package project

import (
	"context"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
)

// UseCase defines the project use case interface
type UseCase interface {
	CreateProject(ctx context.Context, req *domain.CreateProjectRequest, createdBy string, creatorRole string) (*domain.Project, error)
	GetMyProjects(ctx context.Context, userID string) ([]*domain.Project, error)
	GetProjectsByProgramID(ctx context.Context, programID string) ([]*domain.Project, error)
	GetProjectsByProgramIDForUser(ctx context.Context, programID string, userID string, role string) ([]*domain.Project, error)
	UpdateProject(ctx context.Context, id string, req *domain.UpdateProjectRequest) error
	ProjectHeadPreReview(ctx context.Context, id string, headID string, input *domain.ProjectHeadPreReviewRequest) error
	UpdateProjectApproval(ctx context.Context, id string, req *domain.UpdateProjectApprovalRequest, actorID string, actorRole string) error
	BulkUpdateProjectApproval(ctx context.Context, req *domain.BulkUpdateProjectApprovalRequest, actorID string, actorRole string) error
	AssignProjectHead(ctx context.Context, projectID string, headID *string, actorID string, actorRole string) error
	GetProjectStaffAssignments(ctx context.Context, projectID string, actorID string, actorRole string) (*domain.ProjectStaffAssignments, error)
	ReplaceProjectStaffAssignments(ctx context.Context, projectID string, staffIDs []string, actorID string, actorRole string) error
	CreateProjectTask(ctx context.Context, projectID string, actorID string, actorRole string, req *domain.CreateProjectTaskRequest) (*domain.ProjectTask, error)
	GetProjectTasks(ctx context.Context, projectID string, actorID string, actorRole string) ([]*domain.ProjectTask, error)
	UpdateProjectTaskStatus(ctx context.Context, taskID string, actorID string, actorRole string, status string) error
	DeleteProjectTask(ctx context.Context, taskID string, actorID string, actorRole string) error
	GetStaffProjectTaskSummaries(ctx context.Context, actorID string, actorRole string) ([]*domain.StaffTaskProjectSummary, error)
	GetStaffTasks(ctx context.Context, actorID string, actorRole string, projectID string) ([]*domain.StaffTask, error)
	UpdateStaffTaskStatus(ctx context.Context, taskID string, actorID string, actorRole string, status string) error
	DeleteProject(ctx context.Context, id string) error
}
