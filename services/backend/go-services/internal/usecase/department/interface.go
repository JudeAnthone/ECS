package department

import (
	"context"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
)

type UseCase interface {
	GetAllDepartments(ctx context.Context) ([]*domain.Department, error)
	GetDepartmentByID(ctx context.Context, id string) (*domain.Department, error)
	GetDepartmentByCode(ctx context.Context, code string) (*domain.Department, error)
}
