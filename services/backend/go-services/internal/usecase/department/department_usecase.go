package department

import (
	"context"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository"
)

type departmentUseCase struct {
	departmentRepo repository.DepartmentRepository
}

// NewDepartmentUseCase creates a new department use case
func NewDepartmentUseCase(departmentRepo repository.DepartmentRepository) UseCase {
	return &departmentUseCase{
		departmentRepo: departmentRepo,
	}
}

// GetAllDepartments retrieves all active departments
func (uc *departmentUseCase) GetAllDepartments(ctx context.Context) ([]*domain.Department, error) {
	departments, err := uc.departmentRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return departments, nil
}

// GetDepartmentByID retrieves a department by ID
func (uc *departmentUseCase) GetDepartmentByID(ctx context.Context, id string) (*domain.Department, error) {
	department, err := uc.departmentRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return department, nil
}

// GetDepartmentByCode retrieves a department by code
func (uc *departmentUseCase) GetDepartmentByCode(ctx context.Context, code string) (*domain.Department, error) {
	department, err := uc.departmentRepo.GetByCode(ctx, code)
	if err != nil {
		return nil, err
	}
	return department, nil
}
