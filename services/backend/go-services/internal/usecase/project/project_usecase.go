package project

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository"
)

type projectUseCase struct {
	projectRepo repository.ProjectRepository
	userRepo    repository.UserRepository
	deptRepo    repository.DepartmentRepository
	programRepo repository.ProgramRepository
}

func normalizeOptionalString(input *string) *string {
	if input == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*input)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

// NewProjectUseCase creates a new project use case
func NewProjectUseCase(
	projectRepo repository.ProjectRepository,
	userRepo repository.UserRepository,
	deptRepo repository.DepartmentRepository,
	programRepo repository.ProgramRepository,
) UseCase {
	return &projectUseCase{projectRepo: projectRepo, userRepo: userRepo, deptRepo: deptRepo, programRepo: programRepo}
}

// GetMyProjects retrieves all projects created by the current user.
func (uc *projectUseCase) GetMyProjects(ctx context.Context, userID string) ([]*domain.Project, error) {
	if strings.TrimSpace(userID) == "" {
		return nil, fmt.Errorf("forbidden: user id is required")
	}

	projects, err := uc.projectRepo.GetByCreatedBy(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get projects: %w", err)
	}

	return projects, nil
}

// GetProjectsAssignedToHead retrieves projects currently assigned to the given project head.
func (uc *projectUseCase) GetProjectsAssignedToHead(ctx context.Context, headID string) ([]*domain.Project, error) {
	if strings.TrimSpace(headID) == "" {
		return nil, fmt.Errorf("forbidden: user id is required")
	}

	projects, err := uc.projectRepo.GetByProjectHeadID(ctx, headID)
	if err != nil {
		return nil, fmt.Errorf("failed to get assigned projects: %w", err)
	}

	return projects, nil
}

// CreateProject creates a new project under a program
func (uc *projectUseCase) CreateProject(ctx context.Context, req *domain.CreateProjectRequest, createdBy string, creatorRole string) (*domain.Project, error) {
	var startDate, endDate *time.Time
	if req.StartDate != nil && *req.StartDate != "" {
		parsed, err := time.Parse("2006-01-02", *req.StartDate)
		if err != nil {
			return nil, fmt.Errorf("invalid start date format: %w", err)
		}
		startDate = &parsed
	}
	if req.EndDate != nil && *req.EndDate != "" {
		parsed, err := time.Parse("2006-01-02", *req.EndDate)
		if err != nil {
			return nil, fmt.Errorf("invalid end date format: %w", err)
		}
		endDate = &parsed
	}

	status := "pending_approval"
	if req.Status != "" {
		status = req.Status
	}
	approvalStatus := "pending"
	if req.ApprovalStatus != "" {
		approvalStatus = req.ApprovalStatus
	}

	if creatorRole != domain.RoleProjectHead {
		return nil, fmt.Errorf("forbidden: only project heads can create projects")
	}

	if creatorRole == domain.RoleProjectHead {
		if req.ProgramID == nil || *req.ProgramID == "" {
			return nil, fmt.Errorf("program_id is required for project head project creation")
		}
		if req.BudgetAllocated != nil {
			return nil, fmt.Errorf("forbidden: project heads cannot set budget at creation; submit a budget request after project creation")
		}
		visiblePrograms, err := uc.programRepo.GetVisibleForUser(ctx, createdBy, creatorRole)
		if err != nil {
			return nil, fmt.Errorf("failed to validate project head scope: %w", err)
		}
		allowed := false
		for _, p := range visiblePrograms {
			if p != nil && p.ID == *req.ProgramID {
				allowed = true
				if req.DepartmentID == nil || *req.DepartmentID == "" {
					req.DepartmentID = p.DepartmentID
				}
				break
			}
		}
		if !allowed {
			return nil, fmt.Errorf("forbidden: you can only create projects under assigned programs")
		}
		// Project heads creating a project become the default assigned project head.
		req.ProjectHeadID = &createdBy
	}

	project := &domain.Project{
		ProjectName:        req.ProjectName,
		ProjectDescription: req.ProjectDescription,
		ProgramID:          req.ProgramID,
		DepartmentID:       req.DepartmentID,
		ProjectHeadID:      req.ProjectHeadID,
		Objectives:         req.Objectives,
		BudgetAllocated:    req.BudgetAllocated,
		StartDate:          startDate,
		EndDate:            endDate,
		Status:             status,
		ApprovalStatus:     approvalStatus,
	}

	// Fetch creator user info to store with project
	creator, err := uc.userRepo.GetByID(ctx, createdBy)
	if err == nil && creator != nil {
		rolePtr := &creatorRole
		project.CreatedByRole = rolePtr
		project.CreatedByFirstName = &creator.FirstName
		project.CreatedByLastName = &creator.LastName
	}

	if err := uc.projectRepo.Create(ctx, project, createdBy); err != nil {
		return nil, fmt.Errorf("failed to create project: %w", err)
	}
	return project, nil
}

// GetProjectsByProgramID retrieves all projects for a given program
func (uc *projectUseCase) GetProjectsByProgramID(ctx context.Context, programID string) ([]*domain.Project, error) {
	projects, err := uc.projectRepo.GetByProgramID(ctx, programID)
	if err != nil {
		return nil, fmt.Errorf("failed to get projects: %w", err)
	}
	return projects, nil
}

// GetProjectsByProgramIDForUser retrieves projects by program after role-based scope checks.
func (uc *projectUseCase) GetProjectsByProgramIDForUser(ctx context.Context, programID string, userID string, role string) ([]*domain.Project, error) {
	if role == domain.RoleProjectHead || role == domain.RoleStaff {
		visiblePrograms, err := uc.programRepo.GetVisibleForUser(ctx, userID, role)
		if err != nil {
			return nil, fmt.Errorf("failed to validate visibility scope: %w", err)
		}
		allowed := false
		for _, p := range visiblePrograms {
			if p != nil && p.ID == programID {
				allowed = true
				break
			}
		}
		if !allowed {
			return nil, fmt.Errorf("forbidden: you can only access projects under assigned programs")
		}
	}

	if role == domain.RoleProgramChair {
		program, err := uc.programRepo.GetByID(ctx, programID)
		if err != nil {
			return nil, fmt.Errorf("failed to resolve program: %w", err)
		}
		if program.ProgramChairID == nil || *program.ProgramChairID != userID {
			return nil, fmt.Errorf("forbidden: you can only access projects under your assigned programs")
		}
	}

	return uc.GetProjectsByProgramID(ctx, programID)
}

// UpdateProject updates an existing project's details
func (uc *projectUseCase) UpdateProject(ctx context.Context, id string, req *domain.UpdateProjectRequest) error {
	if req.ProjectName == "" {
		return fmt.Errorf("project_name is required")
	}
	return uc.projectRepo.Update(ctx, id, req)
}

// UpdateProjectApproval approves/rejects pending projects and finalizes lifecycle status.
func (uc *projectUseCase) UpdateProjectApproval(ctx context.Context, id string, req *domain.UpdateProjectApprovalRequest, actorID string, actorRole string) error {
	if req == nil || req.ApprovalStatus == "" {
		return fmt.Errorf("approval_status is required")
	}
	if req.ApprovalStatus != "approved" && req.ApprovalStatus != "rejected" {
		return fmt.Errorf("approval_status must be approved or rejected")
	}
	if req.ApprovalStatus == "rejected" && normalizeOptionalString(req.ReviewNotes) == nil {
		return fmt.Errorf("review_notes is required when rejecting a project")
	}

	project, err := uc.projectRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get project: %w", err)
	}

	if project.CreatedBy != "" {
		creator, err := uc.userRepo.GetByID(ctx, project.CreatedBy)
		if err == nil && creator != nil && creator.Role == domain.RoleStaff && req.ApprovalStatus == "approved" {
			if project.ProjectHeadID == nil || project.Status == "pending_approval" {
				return fmt.Errorf("forbidden: project head pre-review is required before final approval")
			}
		}
	}

	if actorRole == domain.RoleProgramChair {
		if project.ProgramID == nil {
			return fmt.Errorf("forbidden: project is not linked to a program")
		}
		program, err := uc.programRepo.GetByID(ctx, *project.ProgramID)
		if err != nil {
			return fmt.Errorf("failed to resolve project program: %w", err)
		}
		if program.ProgramChairID == nil || *program.ProgramChairID != actorID {
			return fmt.Errorf("forbidden: you can only approve projects under your programs")
		}
	}

	status := "on_hold"
	if req.ApprovalStatus == "approved" {
		status = "in_progress"
	}
	reviewNotes := normalizeOptionalString(req.ReviewNotes)

	if err := uc.projectRepo.UpdateApproval(ctx, id, req.ApprovalStatus, status, actorID, reviewNotes); err != nil {
		return fmt.Errorf("failed to persist project approval: %w", err)
	}
	return nil
}

// ProjectHeadPreReview records project-head pre-review for staff-originated project requests.
func (uc *projectUseCase) ProjectHeadPreReview(ctx context.Context, id string, headID string, input *domain.ProjectHeadPreReviewRequest) error {
	if input == nil || (input.Decision != "approved" && input.Decision != "rejected") {
		return fmt.Errorf("decision must be approved or rejected")
	}
	if input.Decision == "rejected" && normalizeOptionalString(input.ReviewNotes) == nil {
		return fmt.Errorf("review_notes is required when rejecting a project")
	}

	project, err := uc.projectRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get project: %w", err)
	}

	if project.CreatedBy == "" {
		return fmt.Errorf("forbidden: only staff-originated requests require project head pre-review")
	}
	creator, err := uc.userRepo.GetByID(ctx, project.CreatedBy)
	if err != nil {
		return fmt.Errorf("failed to validate project creator: %w", err)
	}
	if creator.Role != domain.RoleStaff {
		return fmt.Errorf("forbidden: only staff-originated requests require project head pre-review")
	}

	if project.ProgramID == nil || *project.ProgramID == "" {
		return fmt.Errorf("forbidden: project is not linked to a program")
	}
	visiblePrograms, err := uc.programRepo.GetVisibleForUser(ctx, headID, domain.RoleProjectHead)
	if err != nil {
		return fmt.Errorf("failed to validate project head scope: %w", err)
	}
	allowed := false
	for _, p := range visiblePrograms {
		if p != nil && p.ID == *project.ProgramID {
			allowed = true
			break
		}
	}
	if !allowed {
		return fmt.Errorf("forbidden: you can only pre-review projects under your assigned programs")
	}

	if project.ProjectHeadID != nil && *project.ProjectHeadID != "" && *project.ProjectHeadID != headID {
		return fmt.Errorf("forbidden: project is assigned to a different project head")
	}

	approved := input.Decision == "approved"
	reviewNotes := normalizeOptionalString(input.ReviewNotes)
	if err := uc.projectRepo.ProjectHeadPreReview(ctx, id, headID, reviewNotes, approved); err != nil {
		return fmt.Errorf("failed to record project head pre-review: %w", err)
	}
	return nil
}

// BulkUpdateProjectApproval applies the same approval decision to multiple projects.
func (uc *projectUseCase) BulkUpdateProjectApproval(ctx context.Context, req *domain.BulkUpdateProjectApprovalRequest, actorID string, actorRole string) error {
	if req == nil {
		return fmt.Errorf("request body is required")
	}
	if len(req.ProjectIDs) == 0 {
		return fmt.Errorf("project_ids is required")
	}

	single := &domain.UpdateProjectApprovalRequest{
		ApprovalStatus: req.ApprovalStatus,
		ReviewNotes:    req.ReviewNotes,
	}

	for _, projectID := range req.ProjectIDs {
		if projectID == "" {
			return fmt.Errorf("project_ids contains an empty id")
		}
		if err := uc.UpdateProjectApproval(ctx, projectID, single, actorID, actorRole); err != nil {
			return fmt.Errorf("bulk approval failed for project %s: %w", projectID, err)
		}
	}

	return nil
}

// DeleteProject removes a project by ID
func (uc *projectUseCase) DeleteProject(ctx context.Context, id string) error {
	// Check if project exists
	project, err := uc.projectRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get project: %w", err)
	}
	if project == nil {
		return fmt.Errorf("project not found")
	}

	// Check for active tasks (pending or in_progress)
	tasks, err := uc.projectRepo.GetProjectTasks(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check project tasks: %w", err)
	}

	var activeTasks []*domain.ProjectTask
	for _, task := range tasks {
		if task.Status == "pending" || task.Status == "in_progress" {
			activeTasks = append(activeTasks, task)
		}
	}

	if len(activeTasks) > 0 {
		return fmt.Errorf("cannot delete project: %d active task(s) must be completed or cancelled first", len(activeTasks))
	}

	// Delete the project (triggers will handle budget reversion)
	return uc.projectRepo.Delete(ctx, id)
}

// AssignProjectHead assigns or removes a project head from a project
func (uc *projectUseCase) AssignProjectHead(ctx context.Context, projectID string, headID *string, actorID string, actorRole string) error {
	// Authorization check
	if actorRole != domain.RoleAdmin && actorRole != domain.RoleProgramChair {
		return fmt.Errorf("forbidden: only admin and program chair can assign project heads")
	}

	project, err := uc.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return fmt.Errorf("failed to get project: %w", err)
	}

	// Program chair can only assign to projects under their program
	if actorRole == domain.RoleProgramChair {
		if project.ProgramID == nil {
			return fmt.Errorf("forbidden: project is not linked to a program")
		}
		program, err := uc.programRepo.GetByID(ctx, *project.ProgramID)
		if err != nil {
			return fmt.Errorf("failed to resolve project program: %w", err)
		}
		if program.ProgramChairID == nil || *program.ProgramChairID != actorID {
			return fmt.Errorf("forbidden: you can only assign heads to projects under your program")
		}
	}

	if headID != nil {
		headUser, err := uc.userRepo.GetByID(ctx, *headID)
		if err != nil {
			return fmt.Errorf("failed to get project head user: %w", err)
		}
		if headUser.Role != domain.RoleProjectHead {
			return fmt.Errorf("assigned user must have role project_head")
		}

		if project.DepartmentID != nil {
			dept, err := uc.deptRepo.GetByID(ctx, *project.DepartmentID)
			if err != nil {
				return fmt.Errorf("failed to resolve project department: %w", err)
			}
			if headUser.Department == nil || (!strings.EqualFold(*headUser.Department, dept.DepartmentCode) && !strings.EqualFold(*headUser.Department, dept.DepartmentName)) {
				return fmt.Errorf("project head is outside the assigned project team")
			}
		}

		if project.ProgramID != nil {
			program, err := uc.programRepo.GetByID(ctx, *project.ProgramID)
			if err != nil {
				return fmt.Errorf("failed to resolve project program: %w", err)
			}
			if program.ProgramChairID != nil {
				if headUser.AssignedProgramChairID == nil || *headUser.AssignedProgramChairID != *program.ProgramChairID {
					return fmt.Errorf("project head is assigned to a different program chair")
				}
			}
		}
	}

	if err := uc.projectRepo.AssignProjectHead(ctx, projectID, headID); err != nil {
		return fmt.Errorf("failed to assign project head: %w", err)
	}
	return nil
}

func (uc *projectUseCase) canManageProject(ctx context.Context, project *domain.Project, actorID string, actorRole string) error {
	if actorRole == domain.RoleAdmin {
		return nil
	}

	if actorRole == domain.RoleProgramChair {
		if project.ProgramID == nil || *project.ProgramID == "" {
			return fmt.Errorf("forbidden: project is not linked to a program")
		}
		program, err := uc.programRepo.GetByID(ctx, *project.ProgramID)
		if err != nil {
			return fmt.Errorf("failed to resolve project program: %w", err)
		}
		if program.ProgramChairID == nil || *program.ProgramChairID != actorID {
			return fmt.Errorf("forbidden: you can only manage projects under your programs")
		}
		return nil
	}

	if actorRole == domain.RoleProjectHead {
		if project.ProgramID == nil || *project.ProgramID == "" {
			return fmt.Errorf("forbidden: project is not linked to a program")
		}
		visiblePrograms, err := uc.programRepo.GetVisibleForUser(ctx, actorID, domain.RoleProjectHead)
		if err != nil {
			return fmt.Errorf("failed to validate project head scope: %w", err)
		}
		allowed := false
		for _, p := range visiblePrograms {
			if p != nil && p.ID == *project.ProgramID {
				allowed = true
				break
			}
		}
		if !allowed {
			return fmt.Errorf("forbidden: you can only manage projects under your assigned programs")
		}
		return nil
	}

	return fmt.Errorf("forbidden: you are not allowed to manage project staff assignments")
}

// GetProjectStaffAssignments returns assigned staff ids for a project.
func (uc *projectUseCase) GetProjectStaffAssignments(ctx context.Context, projectID string, actorID string, actorRole string) (*domain.ProjectStaffAssignments, error) {
	project, err := uc.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}

	if err := uc.canManageProject(ctx, project, actorID, actorRole); err != nil {
		return nil, err
	}

	staffIDs, err := uc.projectRepo.GetAssignedStaffIDsByProject(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to get project staff assignments: %w", err)
	}

	return &domain.ProjectStaffAssignments{
		ProjectID: projectID,
		StaffIDs:  staffIDs,
	}, nil
}

// ReplaceProjectStaffAssignments replaces assigned staff ids for a project.
func (uc *projectUseCase) ReplaceProjectStaffAssignments(ctx context.Context, projectID string, staffIDs []string, actorID string, actorRole string) error {
	project, err := uc.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return fmt.Errorf("failed to get project: %w", err)
	}

	if err := uc.canManageProject(ctx, project, actorID, actorRole); err != nil {
		return err
	}

	if project.ApprovalStatus != "approved" {
		return fmt.Errorf("forbidden: only approved projects can have staff assigned")
	}

	var requiredChairID string
	if project.ProgramID != nil && strings.TrimSpace(*project.ProgramID) != "" {
		program, err := uc.programRepo.GetByID(ctx, *project.ProgramID)
		if err != nil {
			return fmt.Errorf("failed to resolve project program: %w", err)
		}
		if program.ProgramChairID != nil {
			requiredChairID = strings.TrimSpace(*program.ProgramChairID)
		}
	}

	seen := make(map[string]struct{}, len(staffIDs))
	validated := make([]string, 0, len(staffIDs))
	for _, staffID := range staffIDs {
		staffID = strings.TrimSpace(staffID)
		if staffID == "" {
			continue
		}
		if _, exists := seen[staffID]; exists {
			continue
		}
		seen[staffID] = struct{}{}

		staffUser, err := uc.userRepo.GetByID(ctx, staffID)
		if err != nil {
			return fmt.Errorf("failed to validate staff user %s: %w", staffID, err)
		}
		if staffUser.Role != domain.RoleStaff {
			return fmt.Errorf("user %s is not a staff account", staffID)
		}

		if requiredChairID != "" {
			if staffUser.AssignedProgramChairID == nil || strings.TrimSpace(*staffUser.AssignedProgramChairID) != requiredChairID {
				return fmt.Errorf("staff user %s is not tied to this program chair", staffID)
			}
		}

		if project.DepartmentID != nil {
			dept, err := uc.deptRepo.GetByID(ctx, *project.DepartmentID)
			if err != nil {
				return fmt.Errorf("failed to resolve project department: %w", err)
			}
			if staffUser.Department == nil || (!strings.EqualFold(*staffUser.Department, dept.DepartmentCode) && !strings.EqualFold(*staffUser.Department, dept.DepartmentName)) {
				return fmt.Errorf("staff user %s is outside the project department", staffID)
			}
		}

		validated = append(validated, staffID)
	}

	if err := uc.projectRepo.ReplaceProjectStaffAssignments(ctx, projectID, validated, actorID); err != nil {
		return fmt.Errorf("failed to replace project staff assignments: %w", err)
	}

	return nil
}

// CreateProjectTask creates a persisted task under a project.
func (uc *projectUseCase) CreateProjectTask(ctx context.Context, projectID string, actorID string, actorRole string, req *domain.CreateProjectTaskRequest) (*domain.ProjectTask, error) {
	if req == nil {
		return nil, fmt.Errorf("request body is required")
	}
	if strings.TrimSpace(req.Title) == "" {
		return nil, fmt.Errorf("task title is required")
	}

	project, err := uc.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}
	if err := uc.canManageProject(ctx, project, actorID, actorRole); err != nil {
		return nil, err
	}

	allowedStaffIDs, err := uc.projectRepo.GetAssignedStaffIDsByProject(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to get project staff assignments: %w", err)
	}
	allowedSet := make(map[string]struct{}, len(allowedStaffIDs))
	for _, id := range allowedStaffIDs {
		allowedSet[id] = struct{}{}
	}

	if len(req.AssigneeIDs) == 0 {
		return nil, fmt.Errorf("at least one assignee is required")
	}

	if req.BudgetNeeded < 0 {
		return nil, fmt.Errorf("budget_needed cannot be negative")
	}
	uniqueAssignees := make([]string, 0, len(req.AssigneeIDs))
	seen := make(map[string]struct{}, len(req.AssigneeIDs))
	for _, assigneeID := range req.AssigneeIDs {
		id := strings.TrimSpace(assigneeID)
		if id == "" {
			continue
		}
		if _, exists := seen[id]; exists {
			continue
		}
		seen[id] = struct{}{}
		if _, allowed := allowedSet[id]; !allowed {
			return nil, fmt.Errorf("assignee %s is not assigned to this project", id)
		}
		uniqueAssignees = append(uniqueAssignees, id)
	}
	if len(uniqueAssignees) == 0 {
		return nil, fmt.Errorf("at least one valid assignee is required")
	}

	priority := strings.TrimSpace(strings.ToLower(req.Priority))
	if priority == "" {
		priority = "medium"
	}
	if priority == "critical" {
		priority = "urgent"
	}
	if priority != "low" && priority != "medium" && priority != "high" && priority != "urgent" {
		return nil, fmt.Errorf("invalid priority: %s", req.Priority)
	}

	var dueDate *string
	if req.DueDate != nil {
		trimmed := strings.TrimSpace(*req.DueDate)
		if trimmed != "" {
			if _, err := time.Parse("2006-01-02", trimmed); err != nil {
				return nil, fmt.Errorf("invalid due_date format, expected YYYY-MM-DD")
			}
			dueDate = &trimmed
		}
	}

	description := normalizeOptionalString(req.Description)
	createReq := &domain.CreateProjectTaskRequest{
		Title:       strings.TrimSpace(req.Title),
		Description: description,
		AssigneeIDs: uniqueAssignees,
		BudgetNeeded: req.BudgetNeeded,
		Priority:    priority,
		DueDate:     dueDate,
	}

	task, err := uc.projectRepo.CreateProjectTask(ctx, projectID, actorID, createReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create project task: %w", err)
	}

	return task, nil
}

// GetProjectTasks lists persisted tasks for a project.
func (uc *projectUseCase) GetProjectTasks(ctx context.Context, projectID string, actorID string, actorRole string) ([]*domain.ProjectTask, error) {
	project, err := uc.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}
	if err := uc.canManageProject(ctx, project, actorID, actorRole); err != nil {
		return nil, err
	}

	tasks, err := uc.projectRepo.GetProjectTasks(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to get project tasks: %w", err)
	}

	return tasks, nil
}

// UpdateProjectTaskStatus updates task status for authorized project managers.
func (uc *projectUseCase) UpdateProjectTaskStatus(ctx context.Context, taskID string, actorID string, actorRole string, status string) error {
	task, err := uc.projectRepo.GetProjectTaskByID(ctx, taskID)
	if err != nil {
		return fmt.Errorf("failed to get task: %w", err)
	}

	project, err := uc.projectRepo.GetByID(ctx, task.ProjectID)
	if err != nil {
		return fmt.Errorf("failed to get task project: %w", err)
	}
	if err := uc.canManageProject(ctx, project, actorID, actorRole); err != nil {
		return err
	}

	normalizedStatus := strings.TrimSpace(strings.ToLower(status))
	switch normalizedStatus {
	case "not_started":
		normalizedStatus = "pending"
	case "ongoing":
		normalizedStatus = "in_progress"
	}

	if normalizedStatus != "pending" && normalizedStatus != "in_progress" && normalizedStatus != "completed" && normalizedStatus != "cancelled" {
		return fmt.Errorf("invalid status: %s", status)
	}

	if err := uc.projectRepo.UpdateProjectTaskStatus(ctx, taskID, normalizedStatus); err != nil {
		return fmt.Errorf("failed to update project task status: %w", err)
	}

	return nil
}

// DeleteProjectTask removes a task for authorized project managers.
func (uc *projectUseCase) DeleteProjectTask(ctx context.Context, taskID string, actorID string, actorRole string) error {
	task, err := uc.projectRepo.GetProjectTaskByID(ctx, taskID)
	if err != nil {
		return fmt.Errorf("failed to get task: %w", err)
	}

	project, err := uc.projectRepo.GetByID(ctx, task.ProjectID)
	if err != nil {
		return fmt.Errorf("failed to get task project: %w", err)
	}
	if err := uc.canManageProject(ctx, project, actorID, actorRole); err != nil {
		return err
	}

	if err := uc.projectRepo.DeleteProjectTask(ctx, taskID); err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}

	return nil
}

// GetStaffProjectTaskSummaries returns task summary per assigned project for staff users.
func (uc *projectUseCase) GetStaffProjectTaskSummaries(ctx context.Context, actorID string, actorRole string) ([]*domain.StaffTaskProjectSummary, error) {
	if actorRole != domain.RoleStaff {
		return nil, fmt.Errorf("forbidden: only staff can access staff task summaries")
	}

	summaries, err := uc.projectRepo.GetStaffProjectTaskSummaries(ctx, actorID)
	if err != nil {
		return nil, fmt.Errorf("failed to get staff project task summaries: %w", err)
	}

	return summaries, nil
}

// GetStaffTasks returns tasks assigned to the requesting staff user.
func (uc *projectUseCase) GetStaffTasks(ctx context.Context, actorID string, actorRole string, projectID string) ([]*domain.StaffTask, error) {
	if actorRole != domain.RoleStaff {
		return nil, fmt.Errorf("forbidden: only staff can access staff tasks")
	}

	tasks, err := uc.projectRepo.GetStaffTasks(ctx, actorID, strings.TrimSpace(projectID))
	if err != nil {
		return nil, fmt.Errorf("failed to get staff tasks: %w", err)
	}

	return tasks, nil
}

// UpdateStaffTaskStatus updates a task status for an assigned staff user.
func (uc *projectUseCase) UpdateStaffTaskStatus(ctx context.Context, taskID string, actorID string, actorRole string, status string) error {
	if actorRole != domain.RoleStaff {
		return fmt.Errorf("forbidden: only staff can update staff task status")
	}

	normalizedStatus := strings.TrimSpace(strings.ToLower(status))
	switch normalizedStatus {
	case "ongoing":
		normalizedStatus = "in_progress"
	}
	switch normalizedStatus {
	case "in_progress", "completed", "cancelled":
	default:
		return fmt.Errorf("invalid status: %s", status)
	}

	if err := uc.projectRepo.UpdateStaffTaskStatus(ctx, taskID, actorID, normalizedStatus); err != nil {
		return fmt.Errorf("failed to update staff task status: %w", err)
	}

	return nil
}
