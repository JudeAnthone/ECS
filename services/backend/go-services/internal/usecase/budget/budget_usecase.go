package budget

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository"
)

type budgetUsecase struct {
	budgetRepo       repository.BudgetRepository
	projectRepo      repository.ProjectRepository
	programRepo      repository.ProgramRepository
	notificationRepo repository.NotificationRepository
}

func NewBudgetUsecase(bRepo repository.BudgetRepository, projectRepo repository.ProjectRepository, programRepo repository.ProgramRepository, notificationRepo repository.NotificationRepository) UseCase {
	return &budgetUsecase{budgetRepo: bRepo, projectRepo: projectRepo, programRepo: programRepo, notificationRepo: notificationRepo}
}

func (uc *budgetUsecase) GetTotalBudget(ctx context.Context) (float64, error) {
	return uc.budgetRepo.GetTotalBudget(ctx)
}

func (uc *budgetUsecase) GetAllBudgetRequests(ctx context.Context, role string, userID string) ([]*BudgetRequestDTO, error) {
	reqs, err := uc.budgetRepo.GetAllBudgetRequests(ctx, role, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get budget requests: %w", err)
	}
	out := make([]*BudgetRequestDTO, 0, len(reqs))
	for _, r := range reqs {
		neededByDate := ""
		if r.NeededByDate != nil {
			neededByDate = r.NeededByDate.Format("2006-01-02")
		}
		reviewedAt := ""
		if r.ReviewedAt != nil {
			reviewedAt = r.ReviewedAt.Format(time.RFC3339)
		}
		adminReviewedAt := ""
		if r.ChairSlipGeneratedAt != nil {
			adminReviewedAt = r.ChairSlipGeneratedAt.Format(time.RFC3339)
		}
		out = append(out, &BudgetRequestDTO{
			ID:                        r.ID,
			ProjectID:                 r.ProjectID,
			ProjectName:               r.ProjectName,
			DepartmentID:              r.DepartmentID,
			DepartmentName:            r.DepartmentName,
			DepartmentAllocatedBudget: r.DepartmentAllocatedBudget,
			DepartmentSpentBudget:     r.DepartmentSpentBudget,
			DepartmentRemainingBudget: r.DepartmentRemainingBudget,
			RequestedBy:               r.RequestedBy,
			RequestedByName:           r.RequestedByName,
			Amount:                    r.Amount,
			Reason:                    r.Reason,
			NeededByDate:              neededByDate,
			Status:                    r.Status,
			WorkflowStage:             r.WorkflowStage,
			DocumentURL:               r.DocumentURL,
			DocumentName:              r.DocumentName,
			ReviewedBy:                r.ReviewedBy,
			ReviewedByName:            r.ReviewedByName,
			ReviewNotes:               r.ReviewNotes,
			ReviewedAt:                reviewedAt,
			ChairSlipNumber:           r.ChairSlipNumber,
			ChairSlipGeneratedAt:      adminReviewedAt,
			CreatedAt:                 r.CreatedAt.Format(time.RFC3339),
		})
	}
	return out, nil
}

func (uc *budgetUsecase) CreateBudgetRequest(ctx context.Context, requestedBy string, role string, input *CreateBudgetRequestInput) (*BudgetRequestDTO, error) {
	// Allow project heads, admins, and program chairs to create budget requests
	if role != domain.RoleProjectHead && role != domain.RoleAdmin && role != domain.RoleProgramChair {
		return nil, fmt.Errorf("forbidden: only project heads, program chairs, and admins can submit budget requests")
	}
	if requestedBy == "" {
		return nil, fmt.Errorf("requested_by is required")
	}
	if input == nil {
		return nil, fmt.Errorf("request payload is required")
	}
	if input.ProjectID == "" {
		return nil, fmt.Errorf("project_id is required")
	}
	if input.Amount <= 0 {
		return nil, fmt.Errorf("amount must be greater than zero")
	}

	project, err := uc.projectRepo.GetByID(ctx, input.ProjectID)
	if err != nil {
		return nil, fmt.Errorf("failed to validate project: %w", err)
	}

	// Project heads need a reason; admins/chairs don't
	if role == domain.RoleProjectHead && input.Reason == "" {
		return nil, fmt.Errorf("reason is required")
	}

	// Project heads can only request budgets for their own projects
	if role == domain.RoleProjectHead {
		if (project.ProjectHeadID == nil || *project.ProjectHeadID != requestedBy) && project.CreatedBy != requestedBy {
			return nil, fmt.Errorf("forbidden: you can only request budgets for projects assigned to you or created by you")
		}
	}

	var neededByDate *time.Time
	if input.NeededByDate != nil && *input.NeededByDate != "" {
		parsed, err := time.Parse("2006-01-02", *input.NeededByDate)
		if err != nil {
			return nil, fmt.Errorf("invalid needed_by_date format")
		}
		neededByDate = &parsed
	}

	// Admin/ProgramChair can auto-approve budget requests; ProjectHead requests start as pending
	status := "pending"
	workflowStage := "pending"
	if role == domain.RoleAdmin || role == domain.RoleProgramChair {
		status = "approved"
		workflowStage = "approved"
	}

	req := &domain.BudgetRequest{
		ProjectID:     input.ProjectID,
		ProjectName:   project.ProjectName,
		RequestedBy:   requestedBy,
		Amount:        input.Amount,
		Reason:        input.Reason,
		NeededByDate:  neededByDate,
		Status:        status,
		WorkflowStage: workflowStage,
		DocumentURL:   input.DocumentURL,
		DocumentName:  input.DocumentName,
	}

	created, err := uc.budgetRepo.CreateBudgetRequest(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to create budget request: %w", err)
	}

	if role == domain.RoleProjectHead && uc.notificationRepo != nil && project.ProgramID != nil {
		program, programErr := uc.programRepo.GetByID(ctx, *project.ProgramID)
		if programErr == nil && program != nil && program.ProgramChairID != nil && *program.ProgramChairID != requestedBy {
			requesterName := strings.TrimSpace(created.RequestedByName)
			if requesterName == "" {
				requesterName = "A project head"
			}
			title := "New Budget Request"
			message := fmt.Sprintf("%s requested %s for project %s.", requesterName, formatCurrency(created.Amount), project.ProjectName)
			entityType := "budget_request"
			entityID := created.ID
			_ = uc.notificationRepo.Create(ctx, &domain.Notification{
				UserID:     *program.ProgramChairID,
				Title:      title,
				Message:    message,
				Type:       "budget_request",
				EntityType: &entityType,
				EntityID:   &entityID,
				IsRead:     false,
			})
		}
	}

	return uc.toDTO(created), nil
}

func (uc *budgetUsecase) ReviewBudgetRequest(ctx context.Context, id string, reviewerID string, role string, input *ReviewBudgetRequestInput) (*BudgetRequestDTO, error) {
	if role != domain.RoleProgramChair {
		return nil, fmt.Errorf("forbidden: only program chairs can review budget requests")
	}
	if input == nil {
		return nil, fmt.Errorf("request payload is required")
	}
	if input.ApprovalStatus == "rejected" {
		input.ApprovalStatus = "declined"
	}
	if input.ApprovalStatus != "approved" && input.ApprovalStatus != "declined" {
		return nil, fmt.Errorf("approval_status must be approved or declined")
	}
	if input.ApprovalStatus == "declined" && (input.ReviewNotes == nil || *input.ReviewNotes == "") {
		return nil, fmt.Errorf("review_notes is required when declining a budget request")
	}

	req, err := uc.budgetRepo.GetBudgetRequestByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to load budget request: %w", err)
	}
	if req.WorkflowStage != "pending" {
		return nil, fmt.Errorf("budget request is not ready for chair review")
	}
	project, err := uc.projectRepo.GetByID(ctx, req.ProjectID)
	if err != nil {
		return nil, fmt.Errorf("failed to validate request project: %w", err)
	}
	if project.ProgramID == nil {
		return nil, fmt.Errorf("forbidden: project is not linked to a program")
	}
	program, err := uc.programRepo.GetByID(ctx, *project.ProgramID)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve program: %w", err)
	}
	if program.ProgramChairID == nil || *program.ProgramChairID != reviewerID {
		return nil, fmt.Errorf("forbidden: you can only review requests under your programs")
	}
	if project.DepartmentID == nil || *project.DepartmentID == "" {
		return nil, fmt.Errorf("forbidden: project department is required for budget request approval")
	}

	chairBudgets, err := uc.budgetRepo.GetChairDepartmentBudgets(ctx, &reviewerID, project.DepartmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to validate chair department budget ownership: %w", err)
	}
	if len(chairBudgets) == 0 {
		return nil, fmt.Errorf("forbidden: you can only review requests for departments allocated to your chair budget")
	}

	approved := input.ApprovalStatus == "approved"
	updated, err := uc.budgetRepo.ReviewBudgetRequest(ctx, id, reviewerID, input.ReviewNotes, approved)
	if err != nil {
		return nil, fmt.Errorf("failed to review budget request: %w", err)
	}

	if uc.notificationRepo != nil {
		title := "Budget Request Updated"
		typeValue := "request_updated"
		statusLabel := "declined"
		if approved {
			title = "Budget Request Approved"
			typeValue = "budget_approved"
			statusLabel = "approved"
		}
		message := fmt.Sprintf("Your budget request for project %s was %s.", req.ProjectName, statusLabel)
		entityType := "budget_request"
		entityID := updated.ID
		_ = uc.notificationRepo.Create(ctx, &domain.Notification{
			UserID:     req.RequestedBy,
			Title:      title,
			Message:    message,
			Type:       typeValue,
			EntityType: &entityType,
			EntityID:   &entityID,
			IsRead:     false,
		})
	}

	return uc.toDTO(updated), nil
}

func formatCurrency(amount float64) string {
	return fmt.Sprintf("PHP %.2f", amount)
}

func (uc *budgetUsecase) DeleteBudgetRequest(ctx context.Context, id string, userID string, role string) error {
	if id == "" {
		return fmt.Errorf("id is required")
	}
	req, err := uc.budgetRepo.GetBudgetRequestByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to load budget request: %w", err)
	}

	switch role {
	case domain.RoleAdmin:
		return fmt.Errorf("forbidden: admin is read-only for budget request decisions")
	case domain.RoleProgramChair:
		project, err := uc.projectRepo.GetByID(ctx, req.ProjectID)
		if err != nil {
			return fmt.Errorf("failed to validate request project: %w", err)
		}
		if project.ProgramID == nil {
			return fmt.Errorf("forbidden: project is not linked to a program")
		}
		program, err := uc.programRepo.GetByID(ctx, *project.ProgramID)
		if err != nil {
			return fmt.Errorf("failed to resolve program: %w", err)
		}
		if program.ProgramChairID == nil || *program.ProgramChairID != userID {
			return fmt.Errorf("forbidden: you can only delete budget requests under your programs")
		}
		if req.WorkflowStage == "approved" {
			return fmt.Errorf("forbidden: approved budget requests cannot be deleted")
		}
	case domain.RoleProjectHead:
		if req.RequestedBy != userID {
			return fmt.Errorf("forbidden: you can only delete your own budget requests")
		}
		if req.WorkflowStage == "approved" {
			return fmt.Errorf("forbidden: approved budget requests cannot be deleted")
		}
	default:
		return fmt.Errorf("forbidden: unsupported role for budget request deletion")
	}

	if err := uc.budgetRepo.DeleteBudgetRequest(ctx, id); err != nil {
		return fmt.Errorf("failed to delete budget request: %w", err)
	}
	if storagePath := budgetRequestStoragePath(req.DocumentURL); storagePath != "" {
		_ = os.Remove(storagePath)
	}
	return nil
}

func (uc *budgetUsecase) GetProjectHeadStaffBudgetDocuments(ctx context.Context, userID string, role string) ([]*BudgetSupportDocumentDTO, error) {
	if role != domain.RoleProjectHead {
		return nil, fmt.Errorf("forbidden: only project heads can view staff budget documents")
	}
	items, err := uc.budgetRepo.GetProjectHeadStaffBudgetDocuments(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to load staff budget documents: %w", err)
	}
	out := make([]*BudgetSupportDocumentDTO, 0, len(items))
	for _, item := range items {
		out = append(out, &BudgetSupportDocumentDTO{
			ID:             item.ID,
			ProjectID:      item.ProjectID,
			ProjectName:    item.ProjectName,
			DocumentType:   item.DocumentType,
			Title:          item.Title,
			FileURL:        budgetRequestPublicURL(item.FileURL),
			UploadedByName: item.UploadedByName,
			CreatedAt:      item.CreatedAt.Format(time.RFC3339),
		})
	}
	return out, nil
}

func (uc *budgetUsecase) toDTO(r *domain.BudgetRequest) *BudgetRequestDTO {
	if r == nil {
		return nil
	}
	neededByDate := ""
	if r.NeededByDate != nil {
		neededByDate = r.NeededByDate.Format("2006-01-02")
	}
	reviewedAt := ""
	if r.ReviewedAt != nil {
		reviewedAt = r.ReviewedAt.Format(time.RFC3339)
	}
	chairSlipGeneratedAt := ""
	if r.ChairSlipGeneratedAt != nil {
		chairSlipGeneratedAt = r.ChairSlipGeneratedAt.Format(time.RFC3339)
	}
	return &BudgetRequestDTO{
		ID:                        r.ID,
		ProjectID:                 r.ProjectID,
		ProjectName:               r.ProjectName,
		DepartmentID:              r.DepartmentID,
		DepartmentName:            r.DepartmentName,
		DepartmentAllocatedBudget: r.DepartmentAllocatedBudget,
		DepartmentSpentBudget:     r.DepartmentSpentBudget,
		DepartmentRemainingBudget: r.DepartmentRemainingBudget,
		RequestedBy:               r.RequestedBy,
		RequestedByName:           r.RequestedByName,
		Amount:                    r.Amount,
		Reason:                    r.Reason,
		NeededByDate:              neededByDate,
		Status:                    r.Status,
		WorkflowStage:             r.WorkflowStage,
		DocumentURL:               budgetRequestPublicURL(r.DocumentURL),
		DocumentName:              r.DocumentName,
		ReviewedBy:                r.ReviewedBy,
		ReviewedByName:            r.ReviewedByName,
		ReviewNotes:               r.ReviewNotes,
		ReviewedAt:                reviewedAt,
		ChairSlipNumber:           r.ChairSlipNumber,
		ChairSlipGeneratedAt:      chairSlipGeneratedAt,
		CreatedAt:                 r.CreatedAt.Format(time.RFC3339),
	}
}

func budgetRequestPublicURL(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}
	if strings.HasPrefix(raw, "http://") || strings.HasPrefix(raw, "https://") {
		return raw
	}
	normalized := filepath.ToSlash(raw)
	normalized = strings.TrimPrefix(normalized, "./")
	normalized = strings.TrimPrefix(normalized, "/")
	if strings.HasPrefix(normalized, "uploads/") {
		return "/" + normalized
	}
	if normalized == "uploads" {
		return "/uploads"
	}
	return "/uploads/" + normalized
}

func budgetRequestStoragePath(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}
	if strings.HasPrefix(raw, "http://") || strings.HasPrefix(raw, "https://") {
		return ""
	}
	normalized := filepath.ToSlash(raw)
	normalized = strings.TrimPrefix(normalized, "./")
	normalized = strings.TrimPrefix(normalized, "/uploads/")
	normalized = strings.TrimPrefix(normalized, "uploads/")
	if normalized == "" || normalized == "uploads" {
		return filepath.Join("uploads")
	}
	return filepath.Join("uploads", filepath.FromSlash(normalized))
}

func (uc *budgetUsecase) GetProgramChairBudgets(ctx context.Context, chairID *string) ([]*ProgramChairBudgetDTO, error) {
	items, err := uc.budgetRepo.GetProgramChairBudgets(ctx, chairID)
	if err != nil {
		return nil, fmt.Errorf("failed to get program chair budgets: %w", err)
	}
	out := make([]*ProgramChairBudgetDTO, 0, len(items))
	for _, item := range items {
		out = append(out, &ProgramChairBudgetDTO{
			ID:              item.ID,
			ChairID:         item.ChairID,
			ChairFirstName:  item.ChairFirstName,
			ChairLastName:   item.ChairLastName,
			AllocatedBudget: item.AllocatedBudget,
			SpentBudget:     item.SpentBudget,
			RemainingBudget: item.AllocatedBudget - item.SpentBudget,
			UpdatedAt:       item.UpdatedAt.Format(time.RFC3339),
		})
	}
	return out, nil
}

func (uc *budgetUsecase) SetProgramChairBudget(ctx context.Context, chairID string, allocatedBudget float64) (*ProgramChairBudgetDTO, error) {
	if chairID == "" {
		return nil, fmt.Errorf("chair_id is required")
	}
	if allocatedBudget < 0 {
		return nil, fmt.Errorf("allocated_budget cannot be negative")
	}
	// Validate reduction: ensure new allocatedBudget covers already committed department allocations and spent amount
	// Fetch current chair department allocations
	deptBudgets, err := uc.budgetRepo.GetChairDepartmentBudgets(ctx, &chairID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to validate chair allocations: %w", err)
	}
	var deptSum float64
	for _, d := range deptBudgets {
		deptSum += d.AllocatedBudget
	}
	// Fetch current program chair budget (to read spent)
	pcs, err := uc.budgetRepo.GetProgramChairBudgets(ctx, &chairID)
	if err != nil {
		return nil, fmt.Errorf("failed to validate chair budget: %w", err)
	}
	var spent float64
	if len(pcs) > 0 {
		spent = pcs[0].SpentBudget
	}

	minRequired := deptSum + spent
	if allocatedBudget < minRequired {
		return nil, fmt.Errorf("cannot reduce allocated_budget below current commitments: minimum allowed is %.2f (departments: %.2f + spent: %.2f)", minRequired, deptSum, spent)
	}

	item, err := uc.budgetRepo.SetProgramChairBudget(ctx, chairID, allocatedBudget)
	if err != nil {
		return nil, fmt.Errorf("failed to set program chair budget: %w", err)
	}
	return &ProgramChairBudgetDTO{
		ID:              item.ID,
		ChairID:         item.ChairID,
		ChairFirstName:  item.ChairFirstName,
		ChairLastName:   item.ChairLastName,
		AllocatedBudget: item.AllocatedBudget,
		SpentBudget:     item.SpentBudget,
		RemainingBudget: item.AllocatedBudget - item.SpentBudget,
		UpdatedAt:       item.UpdatedAt.Format(time.RFC3339),
	}, nil
}

func (uc *budgetUsecase) GetChairDepartmentBudgets(ctx context.Context, chairID *string, departmentID *string) ([]*ChairDepartmentBudgetDTO, error) {
	items, err := uc.budgetRepo.GetChairDepartmentBudgets(ctx, chairID, departmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get chair department budgets: %w", err)
	}
	out := make([]*ChairDepartmentBudgetDTO, 0, len(items))
	for _, item := range items {
		out = append(out, &ChairDepartmentBudgetDTO{
			ID:              item.ID,
			ChairID:         item.ChairID,
			ChairFirstName:  item.ChairFirstName,
			ChairLastName:   item.ChairLastName,
			DepartmentID:    item.DepartmentID,
			DepartmentName:  item.DepartmentName,
			AllocatedBudget: item.AllocatedBudget,
			SpentBudget:     item.SpentBudget,
			RemainingBudget: item.AllocatedBudget - item.SpentBudget,
			UpdatedAt:       item.UpdatedAt.Format(time.RFC3339),
		})
	}
	return out, nil
}

func (uc *budgetUsecase) SetChairDepartmentBudget(ctx context.Context, chairID string, departmentID string, allocatedBudget float64) (*ChairDepartmentBudgetDTO, error) {
	if chairID == "" {
		return nil, fmt.Errorf("chair_id is required")
	}
	if departmentID == "" {
		return nil, fmt.Errorf("department_id is required")
	}
	if allocatedBudget < 0 {
		return nil, fmt.Errorf("allocated_budget cannot be negative")
	}
	item, err := uc.budgetRepo.SetChairDepartmentBudget(ctx, chairID, departmentID, allocatedBudget)
	if err != nil {
		return nil, fmt.Errorf("failed to set chair department budget: %w", err)
	}
	return &ChairDepartmentBudgetDTO{
		ID:              item.ID,
		ChairID:         item.ChairID,
		ChairFirstName:  item.ChairFirstName,
		ChairLastName:   item.ChairLastName,
		DepartmentID:    item.DepartmentID,
		DepartmentName:  item.DepartmentName,
		AllocatedBudget: item.AllocatedBudget,
		SpentBudget:     item.SpentBudget,
		RemainingBudget: item.AllocatedBudget - item.SpentBudget,
		UpdatedAt:       item.UpdatedAt.Format(time.RFC3339),
	}, nil
}

func (uc *budgetUsecase) DeleteChairDepartmentBudget(ctx context.Context, chairID string, departmentID string) error {
	if chairID == "" {
		return fmt.Errorf("chair_id is required")
	}
	if departmentID == "" {
		return fmt.Errorf("department_id is required")
	}
	if err := uc.budgetRepo.DeleteChairDepartmentBudget(ctx, chairID, departmentID); err != nil {
		return fmt.Errorf("failed to delete chair department budget: %w", err)
	}
	return nil
}
