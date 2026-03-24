package request

import (
	"context"
	"fmt"
	"strings"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository"
)

type requestUseCase struct {
	requestRepo repository.RequestRepository
	programRepo repository.ProgramRepository
	userRepo    repository.UserRepository
	deptRepo    repository.DepartmentRepository
}

// NewRequestUseCase creates a new request use case.
func NewRequestUseCase(
	requestRepo repository.RequestRepository,
	programRepo repository.ProgramRepository,
	userRepo repository.UserRepository,
	deptRepo repository.DepartmentRepository,
) UseCase {
	return &requestUseCase{
		requestRepo: requestRepo,
		programRepo: programRepo,
		userRepo:    userRepo,
		deptRepo:    deptRepo,
	}
}

// SubmitRequest creates a brand-new extension service request.
func (uc *requestUseCase) SubmitRequest(ctx context.Context, userID string, input *domain.SubmitRequestInput) (*domain.ProjectRequest, error) {
	if input.RequestTitle == "" {
		return nil, fmt.Errorf("request_title is required")
	}
	if input.RequestDescription == "" {
		return nil, fmt.Errorf("request_description is required")
	}

	req := &domain.ProjectRequest{
		RequestTitle:          input.RequestTitle,
		RequestDescription:    input.RequestDescription,
		RequestedBy:           userID,
		RequestedDepartment:   input.RequestedDepartment,
		RequestedDepartmentID: input.RequestedDepartmentID,
		EstimatedBudget:       input.EstimatedBudget,
		TargetBeneficiaries:   input.TargetBeneficiaries,
		Justification:         input.Justification,
	}

	if err := uc.requestRepo.Create(ctx, req); err != nil {
		return nil, fmt.Errorf("failed to submit request: %w", err)
	}
	return req, nil
}

// GetMyRequests returns requests submitted by a specific user.
func (uc *requestUseCase) GetMyRequests(ctx context.Context, userID string) ([]*domain.ProjectRequest, error) {
	return uc.requestRepo.GetByRequestedBy(ctx, userID)
}

// GetRequestByID returns a single request.
func (uc *requestUseCase) GetRequestByID(ctx context.Context, id string) (*domain.ProjectRequest, error) {
	return uc.requestRepo.GetByID(ctx, id)
}

// GetAllRequests returns all requests (admin).
func (uc *requestUseCase) GetAllRequests(ctx context.Context) ([]*domain.ProjectRequest, error) {
	return uc.requestRepo.GetAll(ctx)
}

// ProgramChairReview submits the program chair's review.
func (uc *requestUseCase) ProgramChairReview(ctx context.Context, chairID, id string, input *domain.ProgramChairReviewInput) error {
	if input.Status != "approved" && input.Status != "rejected" {
		return fmt.Errorf("status must be 'approved' or 'rejected'")
	}

	if chairID == "" {
		return fmt.Errorf("forbidden: missing program chair identity")
	}

	req, err := uc.requestRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if req.ReviewedBy != nil && *req.ReviewedBy != "" && *req.ReviewedBy != chairID {
		return fmt.Errorf("forbidden: request is owned by another program chair")
	}

	if req.AssignedProgramID != nil && *req.AssignedProgramID != "" {
		program, err := uc.programRepo.GetByID(ctx, *req.AssignedProgramID)
		if err != nil {
			return fmt.Errorf("failed to validate assigned program: %w", err)
		}
		if program.ProgramChairID == nil || *program.ProgramChairID != chairID {
			return fmt.Errorf("forbidden: request is assigned to a different program chair")
		}
	}

	// If approved, create program first, then attach to request via assigned_program_id
	if input.Status == "approved" {
		// if a program was already created for this request, reuse it
		if req.AssignedProgramID != nil && *req.AssignedProgramID != "" {
			input.AssignedProgramID = req.AssignedProgramID
		} else {
			// create program from request details (no department assigned)
			program := &domain.Program{
				ProgramName:         req.RequestTitle,
				ProgramDescription:  &req.RequestDescription,
				ProgramCategory:     nil,
				DepartmentID:        nil,
				ProgramChairID:      &chairID,
				Objectives:          req.Justification,
				TargetBeneficiaries: req.TargetBeneficiaries,
				BudgetAllocation:    req.EstimatedBudget,
				SpentBudget:         0,
				Status:              "active",
				ApprovalStatus:      "approved",
			}
			if err := uc.programRepo.Create(ctx, program); err != nil {
				return fmt.Errorf("failed to create program from request: %w", err)
			}
			// debug log: created program id and chair
			fmt.Printf("[DEBUG] Program created from request %s -> program id=%s chair=%s\n", req.ID, program.ID, chairID)
			// attach created program id to review input so request row records it
			input.AssignedProgramID = &program.ID
		}
	}

	// perform the program chair review update (records review and assigned_program_id)
	if err := uc.requestRepo.ProgramChairReview(ctx, id, chairID, input); err != nil {
		return err
	}
	return nil
}

// AssignToHead routes a request to a department (project head assignment is optional).
func (uc *requestUseCase) AssignToHead(ctx context.Context, chairID, id string, input *domain.AssignToHeadInput) error {
	if input.AssignedDepartmentID == "" {
		return fmt.Errorf("assigned_department_id is required")
	}

	req, err := uc.requestRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if req.ReviewedBy != nil && *req.ReviewedBy != "" && *req.ReviewedBy != chairID {
		return fmt.Errorf("forbidden: request is owned by another program chair")
	}

	if req.AssignedProgramID != nil && *req.AssignedProgramID != "" {
		program, err := uc.programRepo.GetByID(ctx, *req.AssignedProgramID)
		if err != nil {
			return fmt.Errorf("failed to validate assigned program: %w", err)
		}
		if program.ProgramChairID == nil || *program.ProgramChairID != chairID {
			return fmt.Errorf("forbidden: request is assigned to a different program chair")
		}
	}

	department, err := uc.deptRepo.GetByID(ctx, input.AssignedDepartmentID)
	if err != nil {
		return fmt.Errorf("failed to validate assigned department: %w", err)
	}
	if department.ProgramChairID == nil || *department.ProgramChairID != chairID {
		return fmt.Errorf("forbidden: cannot assign to a department outside your team")
	}

	if input.AssignedToProjectHead != nil && *input.AssignedToProjectHead != "" {
		headUser, err := uc.userRepo.GetByID(ctx, *input.AssignedToProjectHead)
		if err != nil {
			return fmt.Errorf("failed to validate assigned project head: %w", err)
		}
		if headUser.Role != domain.RoleProjectHead {
			return fmt.Errorf("assigned_to_project_head must have role project_head")
		}
		if headUser.AssignedProgramChairID == nil || *headUser.AssignedProgramChairID != chairID {
			return fmt.Errorf("forbidden: project head is assigned to a different program chair")
		}
		if headUser.Department == nil || (!strings.EqualFold(*headUser.Department, department.DepartmentCode) && !strings.EqualFold(*headUser.Department, department.DepartmentName)) {
			return fmt.Errorf("forbidden: project head is outside your assigned department team")
		}
	}

	if err := uc.requestRepo.AssignToHead(ctx, id, input); err != nil {
		return err
	}
	return nil
}

// DeleteRequest removes a request by ID.
func (uc *requestUseCase) DeleteRequest(ctx context.Context, id string) error {
	return uc.requestRepo.Delete(ctx, id)
}

// GetRequestsByDepartmentChair returns all requests targeted at departments managed by this chair.
func (uc *requestUseCase) GetRequestsByDepartmentChair(ctx context.Context, chairID string) ([]*domain.ProjectRequest, error) {
	return uc.requestRepo.GetByDepartmentChair(ctx, chairID)
}

// RerouteRequest redirects a request to a different department.
func (uc *requestUseCase) RerouteRequest(ctx context.Context, chairID, requestID, departmentID string) error {
	if departmentID == "" {
		return fmt.Errorf("target_department_id is required")
	}

	req, err := uc.requestRepo.GetByID(ctx, requestID)
	if err != nil {
		return err
	}

	if req.ReviewedBy != nil && *req.ReviewedBy != "" && *req.ReviewedBy != chairID {
		return fmt.Errorf("forbidden: request is owned by another program chair")
	}

	if req.AssignedProgramID != nil && *req.AssignedProgramID != "" {
		program, err := uc.programRepo.GetByID(ctx, *req.AssignedProgramID)
		if err != nil {
			return fmt.Errorf("failed to validate assigned program: %w", err)
		}
		if program.ProgramChairID == nil || *program.ProgramChairID != chairID {
			return fmt.Errorf("forbidden: request is assigned to a different program chair")
		}
	}

	targetDepartment, err := uc.deptRepo.GetByID(ctx, departmentID)
	if err != nil {
		return fmt.Errorf("failed to validate target department: %w", err)
	}
	if targetDepartment.ProgramChairID == nil || *targetDepartment.ProgramChairID != chairID {
		return fmt.Errorf("forbidden: cannot reroute to a department outside your team")
	}

	return uc.requestRepo.RerouteRequest(ctx, requestID, departmentID)
}

// GetRequestsByProgram returns requests for a specific program.
func (uc *requestUseCase) GetRequestsByProgram(ctx context.Context, programID string) ([]*domain.ProjectRequest, error) {
	return uc.requestRepo.GetByAssignedProgram(ctx, programID)
}

// GetRequestsByHead returns requests assigned to a specific project head user ID (legacy).
func (uc *requestUseCase) GetRequestsByHead(ctx context.Context, headID string) ([]*domain.ProjectRequest, error) {
	return uc.requestRepo.GetByAssignedProjectHead(ctx, headID)
}

// GetRequestsForProjectHead returns requests assigned to the department
// that the given project head user belongs to.
func (uc *requestUseCase) GetRequestsForProjectHead(ctx context.Context, headID string) ([]*domain.ProjectRequest, error) {
	return uc.requestRepo.GetForProjectHead(ctx, headID)
}

// ProjectHeadRespond records the project head's acceptance or rejection.
func (uc *requestUseCase) ProjectHeadRespond(ctx context.Context, headID, id string, input *domain.ProjectHeadRespondInput) error {
	if input.Response != "accepted" && input.Response != "declined" {
		return fmt.Errorf("response must be 'accepted' or 'declined'")
	}
	req, err := uc.requestRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if req.AssignedToProjectHead == nil || *req.AssignedToProjectHead != headID {
		return fmt.Errorf("forbidden: request is not assigned to this project head")
	}
	headUser, err := uc.userRepo.GetByID(ctx, headID)
	if err != nil {
		return fmt.Errorf("failed to validate project head: %w", err)
	}
	if headUser.AssignedProgramChairID == nil || req.ReviewedBy == nil || *headUser.AssignedProgramChairID != *req.ReviewedBy {
		return fmt.Errorf("forbidden: project head is outside the assigned program chair team")
	}
	return uc.requestRepo.ProjectHeadRespond(ctx, id, input)
}

// SubmitProposal records the proposal document URL.
func (uc *requestUseCase) SubmitProposal(ctx context.Context, headID, id string, input *domain.SubmitProposalInput) error {
	if input.ProposalDocumentURL == "" {
		return fmt.Errorf("proposal_document_url is required")
	}
	req, err := uc.requestRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if req.AssignedToProjectHead == nil || *req.AssignedToProjectHead != headID {
		return fmt.Errorf("forbidden: request is not assigned to this project head")
	}
	headUser, err := uc.userRepo.GetByID(ctx, headID)
	if err != nil {
		return fmt.Errorf("failed to validate project head: %w", err)
	}
	if headUser.AssignedProgramChairID == nil || req.ReviewedBy == nil || *headUser.AssignedProgramChairID != *req.ReviewedBy {
		return fmt.Errorf("forbidden: project head is outside the assigned program chair team")
	}
	return uc.requestRepo.SubmitProposal(ctx, id, input)
}

// ReviewProposal records the administrative review of a submitted proposal.
func (uc *requestUseCase) ReviewProposal(ctx context.Context, reviewerID, id string, notes *string, approved bool) error {
	return uc.requestRepo.ReviewProposal(ctx, id, reviewerID, notes, approved)
}

// FinalApprove records the admin's final approval or rejection.
func (uc *requestUseCase) FinalApprove(ctx context.Context, adminID, id string, input *domain.FinalApprovalInput) error {
	if input.Status != "approved" && input.Status != "rejected" {
		return fmt.Errorf("status must be 'approved' or 'rejected'")
	}
	return uc.requestRepo.FinalApprove(ctx, id, adminID, input)
}
