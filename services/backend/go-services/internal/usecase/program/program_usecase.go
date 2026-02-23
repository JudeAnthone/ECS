package program

import (
	"context"
	"fmt"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository"
)

type programUseCase struct {
	programRepo repository.ProgramRepository
}

// NewProgramUseCase creates a new program use case
func NewProgramUseCase(programRepo repository.ProgramRepository) UseCase {
	return &programUseCase{
		programRepo: programRepo,
	}
}

// CreateProgram creates a new program
func (uc *programUseCase) CreateProgram(ctx context.Context, req *domain.CreateProgramRequest) (*domain.Program, error) {
	// Parse dates if provided
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

	// Validate date range
	if startDate != nil && endDate != nil && endDate.Before(*startDate) {
		return nil, fmt.Errorf("end date cannot be before start date")
	}

	program := &domain.Program{
		ProgramName:         req.ProgramName,
		ProgramDescription:  req.ProgramDescription,
		ProgramCategory:     req.ProgramCategory,
		DepartmentID:        req.DepartmentID,
		ProgramChairID:      req.ProgramChairID,
		Objectives:          req.Objectives,
		TargetBeneficiaries: req.TargetBeneficiaries,
		BudgetAllocation:    req.BudgetAllocation,
		SpentBudget:         0,
		StartDate:           startDate,
		EndDate:             endDate,
		Status:              "draft",
		ApprovalStatus:      "pending",
	}

	err := uc.programRepo.Create(ctx, program)
	if err != nil {
		return nil, fmt.Errorf("failed to create program: %w", err)
	}

	return program, nil
}

// GetAllPrograms retrieves all programs
func (uc *programUseCase) GetAllPrograms(ctx context.Context) ([]*domain.Program, error) {
	programs, err := uc.programRepo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get programs: %w", err)
	}
	return programs, nil
}

// GetProgramByID retrieves a program by ID
func (uc *programUseCase) GetProgramByID(ctx context.Context, id string) (*domain.Program, error) {
	program, err := uc.programRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get program: %w", err)
	}
	return program, nil
}

// GetProgramsByDepartment retrieves all programs for a specific department
func (uc *programUseCase) GetProgramsByDepartment(ctx context.Context, departmentID string) ([]*domain.Program, error) {
	programs, err := uc.programRepo.GetByDepartment(ctx, departmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get programs by department: %w", err)
	}
	return programs, nil
}

// GetProgramsByProgramChair retrieves all programs for a specific program chair
func (uc *programUseCase) GetProgramsByProgramChair(ctx context.Context, programChairID string) ([]*domain.Program, error) {
	programs, err := uc.programRepo.GetByProgramChair(ctx, programChairID)
	if err != nil {
		return nil, fmt.Errorf("failed to get programs by program chair: %w", err)
	}
	return programs, nil
}

// UpdateProgram updates an existing program
func (uc *programUseCase) UpdateProgram(ctx context.Context, id string, req *domain.UpdateProgramRequest) (*domain.Program, error) {
	// Get existing program
	program, err := uc.programRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("program not found: %w", err)
	}

	// Update fields if provided
	if req.ProgramName != nil {
		program.ProgramName = *req.ProgramName
	}
	if req.ProgramDescription != nil {
		program.ProgramDescription = req.ProgramDescription
	}
	if req.ProgramCategory != nil {
		program.ProgramCategory = req.ProgramCategory
	}
	if req.DepartmentID != nil {
		program.DepartmentID = req.DepartmentID
	}
	if req.ProgramChairID != nil {
		program.ProgramChairID = req.ProgramChairID
	}
	if req.Objectives != nil {
		program.Objectives = req.Objectives
	}
	if req.TargetBeneficiaries != nil {
		program.TargetBeneficiaries = req.TargetBeneficiaries
	}
	if req.BudgetAllocation != nil {
		program.BudgetAllocation = req.BudgetAllocation
	}
	if req.Status != nil {
		program.Status = *req.Status
	}

	// Parse and update dates if provided
	if req.StartDate != nil && *req.StartDate != "" {
		parsed, err := time.Parse("2006-01-02", *req.StartDate)
		if err != nil {
			return nil, fmt.Errorf("invalid start date format: %w", err)
		}
		program.StartDate = &parsed
	}
	if req.EndDate != nil && *req.EndDate != "" {
		parsed, err := time.Parse("2006-01-02", *req.EndDate)
		if err != nil {
			return nil, fmt.Errorf("invalid end date format: %w", err)
		}
		program.EndDate = &parsed
	}

	// Validate date range
	if program.StartDate != nil && program.EndDate != nil && program.EndDate.Before(*program.StartDate) {
		return nil, fmt.Errorf("end date cannot be before start date")
	}

	err = uc.programRepo.Update(ctx, program)
	if err != nil {
		return nil, fmt.Errorf("failed to update program: %w", err)
	}

	return program, nil
}

// UpdateProgramStatus updates the status of a program
func (uc *programUseCase) UpdateProgramStatus(ctx context.Context, id string, status string) error {
	// Validate status
	validStatuses := map[string]bool{
		"draft":     true,
		"active":    true,
		"completed": true,
		"cancelled": true,
	}
	if !validStatuses[status] {
		return fmt.Errorf("invalid status: %s", status)
	}

	err := uc.programRepo.UpdateStatus(ctx, id, status)
	if err != nil {
		return fmt.Errorf("failed to update program status: %w", err)
	}

	return nil
}

// UpdateProgramApproval updates the approval status of a program
func (uc *programUseCase) UpdateProgramApproval(ctx context.Context, id string, req *domain.UpdateProgramApprovalRequest, approvedBy string) error {
	err := uc.programRepo.UpdateApproval(ctx, id, req.ApprovalStatus, &approvedBy)
	if err != nil {
		return fmt.Errorf("failed to update program approval: %w", err)
	}

	return nil
}

// DeleteProgram deletes a program
func (uc *programUseCase) DeleteProgram(ctx context.Context, id string) error {
	err := uc.programRepo.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete program: %w", err)
	}

	return nil
}
