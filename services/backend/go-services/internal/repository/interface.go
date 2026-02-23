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
	GetByID(ctx context.Context, id string) (*domain.Program, error)
	GetByDepartment(ctx context.Context, departmentID string) ([]*domain.Program, error)
	GetByProgramChair(ctx context.Context, programChairID string) ([]*domain.Program, error)
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
	Update(ctx context.Context, id string, req *domain.UpdateProjectRequest) error
	AssignProjectHead(ctx context.Context, projectID string, headID *string) error
	Delete(ctx context.Context, id string) error
}

// RequestRepository defines methods for extension service request data access
type RequestRepository interface {
	Create(ctx context.Context, req *domain.ProjectRequest) error
	GetByID(ctx context.Context, id string) (*domain.ProjectRequest, error)
	GetAll(ctx context.Context) ([]*domain.ProjectRequest, error)
	GetByRequestedBy(ctx context.Context, userID string) ([]*domain.ProjectRequest, error)
	GetByAssignedProjectHead(ctx context.Context, headID string) ([]*domain.ProjectRequest, error)
	GetByAssignedProgram(ctx context.Context, programID string) ([]*domain.ProjectRequest, error)
	ProgramChairReview(ctx context.Context, id string, reviewerID string, input *domain.ProgramChairReviewInput) error
	AssignToHead(ctx context.Context, id string, input *domain.AssignToHeadInput) error
	ProjectHeadRespond(ctx context.Context, id string, input *domain.ProjectHeadRespondInput) error
	SubmitProposal(ctx context.Context, id string, input *domain.SubmitProposalInput) error
	ReviewProposal(ctx context.Context, id string, reviewerID string, notes *string, approved bool) error
	FinalApprove(ctx context.Context, id string, approverID string, input *domain.FinalApprovalInput) error
}
