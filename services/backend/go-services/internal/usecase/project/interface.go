package project

import (
	"context"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
)

// UseCase defines the project use case interface
type UseCase interface {
	CreateProject(ctx context.Context, req *domain.CreateProjectRequest, createdBy string) (*domain.Project, error)
	GetProjectsByProgramID(ctx context.Context, programID string) ([]*domain.Project, error)
	UpdateProject(ctx context.Context, id string, req *domain.UpdateProjectRequest) error
	AssignProjectHead(ctx context.Context, projectID string, headID *string) error
	DeleteProject(ctx context.Context, id string) error
}
