package program

import (
	"context"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
)

// UseCase defines the interface for program business logic
type UseCase interface {
	CreateProgram(ctx context.Context, req *domain.CreateProgramRequest) (*domain.Program, error)
	GetAllPrograms(ctx context.Context) ([]*domain.Program, error)
	GetProgramByID(ctx context.Context, id string) (*domain.Program, error)
	GetProgramsByDepartment(ctx context.Context, departmentID string) ([]*domain.Program, error)
	GetProgramsByProgramChair(ctx context.Context, programChairID string) ([]*domain.Program, error)
	UpdateProgram(ctx context.Context, id string, req *domain.UpdateProgramRequest) (*domain.Program, error)
	UpdateProgramStatus(ctx context.Context, id string, status string) error
	UpdateProgramApproval(ctx context.Context, id string, req *domain.UpdateProgramApprovalRequest, approvedBy string) error
	AssignProgramChair(ctx context.Context, programID string, chairID *string) error
	DeleteProgram(ctx context.Context, id string) error
}
