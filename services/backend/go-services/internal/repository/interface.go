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
	Delete(ctx context.Context, id string) error
}
