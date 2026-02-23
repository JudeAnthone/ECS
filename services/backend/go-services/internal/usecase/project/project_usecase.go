package project

import (
	"context"
	"fmt"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository"
)

type projectUseCase struct {
	projectRepo repository.ProjectRepository
}

// NewProjectUseCase creates a new project use case
func NewProjectUseCase(projectRepo repository.ProjectRepository) UseCase {
	return &projectUseCase{projectRepo: projectRepo}
}

// CreateProject creates a new project under a program
func (uc *projectUseCase) CreateProject(ctx context.Context, req *domain.CreateProjectRequest, createdBy string) (*domain.Project, error) {
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

	status := "in_progress"
	if req.Status != "" {
		status = req.Status
	}
	approvalStatus := "approved"
	if req.ApprovalStatus != "" {
		approvalStatus = req.ApprovalStatus
	}

	project := &domain.Project{
		ProjectName:        req.ProjectName,
		ProjectDescription: req.ProjectDescription,
		ProgramID:          req.ProgramID,
		DepartmentID:       req.DepartmentID,
		Objectives:         req.Objectives,
		BudgetAllocated:    req.BudgetAllocated,
		StartDate:          startDate,
		EndDate:            endDate,
		Status:             status,
		ApprovalStatus:     approvalStatus,
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

// UpdateProject updates an existing project's details
func (uc *projectUseCase) UpdateProject(ctx context.Context, id string, req *domain.UpdateProjectRequest) error {
	if req.ProjectName == "" {
		return fmt.Errorf("project_name is required")
	}
	return uc.projectRepo.Update(ctx, id, req)
}

// DeleteProject removes a project by ID
func (uc *projectUseCase) DeleteProject(ctx context.Context, id string) error {
	return uc.projectRepo.Delete(ctx, id)
}

// AssignProjectHead assigns or removes a project head from a project
func (uc *projectUseCase) AssignProjectHead(ctx context.Context, projectID string, headID *string) error {
	if err := uc.projectRepo.AssignProjectHead(ctx, projectID, headID); err != nil {
		return fmt.Errorf("failed to assign project head: %w", err)
	}
	return nil
}
