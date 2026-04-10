package repository

import (
	"context"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
)

// UserRepository defines methods for user data access
type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByID(ctx context.Context, id string) (*domain.User, error)
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	GetByUsername(ctx context.Context, username string) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id string) error
	GetAllUsers(ctx context.Context) ([]*domain.User, error)
	GetUsersByRole(ctx context.Context, role string) ([]*domain.User, error)
	UpdateAccountStatus(ctx context.Context, userID string, status string, approvedByID *string) error
	UpdateLastActive(ctx context.Context, userID string) error
}

// DepartmentRepository defines methods for department data access
type DepartmentRepository interface {
	GetAll(ctx context.Context) ([]*domain.Department, error)
	GetByID(ctx context.Context, id string) (*domain.Department, error)
	GetByCode(ctx context.Context, code string) (*domain.Department, error)
}

// ProgramRepository defines methods for program data access
type ProgramRepository interface {
	Create(ctx context.Context, program *domain.Program) error
	GetAll(ctx context.Context) ([]*domain.Program, error)
	GetVisibleForUser(ctx context.Context, userID string, role string) ([]*domain.Program, error)
	GetByID(ctx context.Context, id string) (*domain.Program, error)
	GetByDepartment(ctx context.Context, departmentID string) ([]*domain.Program, error)
	GetByProgramChair(ctx context.Context, programChairID string) ([]*domain.Program, error)
	CountDistinctAssignedChairs(ctx context.Context) (int, error)
	Update(ctx context.Context, program *domain.Program) error
	UpdateStatus(ctx context.Context, id string, status string) error
	UpdateApproval(ctx context.Context, id string, approvalStatus string, approvedBy *string) error
	AssignProgramChair(ctx context.Context, programID string, chairID *string) error
	Delete(ctx context.Context, id string) error
}

// ProjectRepository defines methods for project data access
type ProjectRepository interface {
	Create(ctx context.Context, project *domain.Project, createdBy string) error
	GetByProgramID(ctx context.Context, programID string) ([]*domain.Project, error)
	GetByCreatedBy(ctx context.Context, createdBy string) ([]*domain.Project, error)
	GetByProjectHeadID(ctx context.Context, headID string) ([]*domain.Project, error)
	GetByID(ctx context.Context, id string) (*domain.Project, error)
	Update(ctx context.Context, id string, req *domain.UpdateProjectRequest) error
	ProjectHeadPreReview(ctx context.Context, id string, headID string, reviewNotes *string, approved bool) error
	UpdateApproval(ctx context.Context, id string, approvalStatus string, status string, actorID string, reviewNotes *string) error
	AssignProjectHead(ctx context.Context, projectID string, headID *string) error
	GetAssignedStaffIDsByProject(ctx context.Context, projectID string) ([]string, error)
	ReplaceProjectStaffAssignments(ctx context.Context, projectID string, staffIDs []string, assignedBy string) error
	CreateProjectTask(ctx context.Context, projectID string, createdBy string, req *domain.CreateProjectTaskRequest) (*domain.ProjectTask, error)
	GetProjectTaskByID(ctx context.Context, taskID string) (*domain.ProjectTask, error)
	GetProjectTasks(ctx context.Context, projectID string) ([]*domain.ProjectTask, error)
	UpdateProjectTaskStatus(ctx context.Context, taskID string, status string) error
	DeleteProjectTask(ctx context.Context, taskID string) error
	GetStaffProjectTaskSummaries(ctx context.Context, staffID string) ([]*domain.StaffTaskProjectSummary, error)
	GetStaffTasks(ctx context.Context, staffID string, projectID string) ([]*domain.StaffTask, error)
	UpdateStaffTaskStatus(ctx context.Context, taskID string, staffID string, status string) error
	Delete(ctx context.Context, id string) error
}

// BudgetRepository defines operations for budget-related queries
type BudgetRepository interface {
	GetTotalBudget(ctx context.Context) (float64, error)
	GetAllBudgetRequests(ctx context.Context, role string, userID string) ([]*domain.BudgetRequest, error)
	GetBudgetRequestByID(ctx context.Context, id string) (*domain.BudgetRequest, error)
	CreateBudgetRequest(ctx context.Context, req *domain.BudgetRequest) (*domain.BudgetRequest, error)
	ReviewBudgetRequest(ctx context.Context, id string, reviewerID string, notes *string, approved bool) (*domain.BudgetRequest, error)
	DeleteBudgetRequest(ctx context.Context, id string) error
	GetProjectHeadStaffBudgetDocuments(ctx context.Context, projectHeadID string) ([]*domain.BudgetSupportDocument, error)
	GetProgramChairBudgets(ctx context.Context, chairID *string) ([]*domain.ProgramChairBudget, error)
	SetProgramChairBudget(ctx context.Context, chairID string, allocatedBudget float64) (*domain.ProgramChairBudget, error)
	GetChairDepartmentBudgets(ctx context.Context, chairID *string, departmentID *string) ([]*domain.ChairDepartmentBudget, error)
	SetChairDepartmentBudget(ctx context.Context, chairID string, departmentID string, allocatedBudget float64) (*domain.ChairDepartmentBudget, error)
	DeleteChairDepartmentBudget(ctx context.Context, chairID string, departmentID string) error
}

// RequestRepository defines methods for extension service request data access
type RequestRepository interface {
	Create(ctx context.Context, req *domain.ProjectRequest) error
	GetByID(ctx context.Context, id string) (*domain.ProjectRequest, error)
	GetAll(ctx context.Context) ([]*domain.ProjectRequest, error)
	GetByRequestedBy(ctx context.Context, userID string) ([]*domain.ProjectRequest, error)
	GetByAssignedProjectHead(ctx context.Context, headID string) ([]*domain.ProjectRequest, error)
	GetByAssignedProgram(ctx context.Context, programID string) ([]*domain.ProjectRequest, error)
	GetForProjectHead(ctx context.Context, headUserID string) ([]*domain.ProjectRequest, error)
	ProgramChairReview(ctx context.Context, id string, reviewerID string, input *domain.ProgramChairReviewInput) error
	AssignToHead(ctx context.Context, id string, input *domain.AssignToHeadInput) error
	ProjectHeadRespond(ctx context.Context, id string, input *domain.ProjectHeadRespondInput) error
	SubmitProposal(ctx context.Context, id string, input *domain.SubmitProposalInput) error
	ReviewProposal(ctx context.Context, id string, reviewerID string, notes *string, approved bool) error
	FinalApprove(ctx context.Context, id string, approverID string, input *domain.FinalApprovalInput) error
	Delete(ctx context.Context, id string) error
	GetByDepartmentChair(ctx context.Context, chairID string) ([]*domain.ProjectRequest, error)
	RerouteRequest(ctx context.Context, requestID, departmentID string) error
}
