package postgres

import (
	"context"
	"fmt"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProjectRepository struct {
	db *pgxpool.Pool
}

func NewProjectRepository(db *pgxpool.Pool) *ProjectRepository {
	return &ProjectRepository{db: db}
}

// Create inserts a new project into the database
func (r *ProjectRepository) Create(ctx context.Context, p *domain.Project, createdBy string) error {
	query := `
		INSERT INTO projects
			(project_name, project_description, program_id, department_id, objectives,
			 budget_allocated, start_date, end_date, status, approval_status, creation_source, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'internal_proposal', $11)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query,
		p.ProjectName,
		p.ProjectDescription,
		p.ProgramID,
		p.DepartmentID,
		p.Objectives,
		p.BudgetAllocated,
		p.StartDate,
		p.EndDate,
		p.Status,
		p.ApprovalStatus,
		createdBy,
	).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create project: %w", err)
	}
	return nil
}

// GetByProgramID retrieves all projects belonging to a program
func (r *ProjectRepository) GetByProgramID(ctx context.Context, programID string) ([]*domain.Project, error) {
	query := `
		SELECT id, project_name, project_description, program_id, department_id, project_head_id,
		       objectives, budget_allocated, budget_used, start_date, end_date, progress_percentage,
		       status, approval_status, is_published, created_at, updated_at
		FROM projects
		WHERE program_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, programID)
	if err != nil {
		return nil, fmt.Errorf("failed to query projects: %w", err)
	}
	defer rows.Close()

	var projects []*domain.Project
	for rows.Next() {
		p := &domain.Project{}
		err := rows.Scan(
			&p.ID, &p.ProjectName, &p.ProjectDescription, &p.ProgramID,
			&p.DepartmentID, &p.ProjectHeadID, &p.Objectives,
			&p.BudgetAllocated, &p.BudgetUsed, &p.StartDate, &p.EndDate, &p.ProgressPercentage,
			&p.Status, &p.ApprovalStatus, &p.IsPublished, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan project: %w", err)
		}
		projects = append(projects, p)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}
	if projects == nil {
		projects = []*domain.Project{}
	}
	return projects, nil
}

// GetByID retrieves a single project by ID.
func (r *ProjectRepository) GetByID(ctx context.Context, id string) (*domain.Project, error) {
	query := `
		SELECT id, project_name, project_description, program_id, department_id, project_head_id,
		       objectives, budget_allocated, budget_used, start_date, end_date, progress_percentage,
		       status, approval_status, is_published, created_at, updated_at
		FROM projects
		WHERE id = $1
	`

	p := &domain.Project{}
	if err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ID, &p.ProjectName, &p.ProjectDescription, &p.ProgramID,
		&p.DepartmentID, &p.ProjectHeadID, &p.Objectives,
		&p.BudgetAllocated, &p.BudgetUsed, &p.StartDate, &p.EndDate, &p.ProgressPercentage,
		&p.Status, &p.ApprovalStatus, &p.IsPublished, &p.CreatedAt, &p.UpdatedAt,
	); err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}

	return p, nil
}

// Update modifies an existing project's fields
func (r *ProjectRepository) Update(ctx context.Context, id string, req *domain.UpdateProjectRequest) error {
	var startDate, endDate *string
	if req.StartDate != nil && *req.StartDate != "" {
		startDate = req.StartDate
	}
	if req.EndDate != nil && *req.EndDate != "" {
		endDate = req.EndDate
	}

	query := `
		UPDATE projects SET
			project_name        = $1,
			project_description = $2,
			objectives          = $3,
			budget_allocated    = $4,
			start_date          = $5::date,
			end_date            = $6::date,
			updated_at          = NOW()
		WHERE id = $7
	`
	_, err := r.db.Exec(ctx, query,
		req.ProjectName,
		req.ProjectDescription,
		req.Objectives,
		req.BudgetAllocated,
		startDate,
		endDate,
		id,
	)
	if err != nil {
		return fmt.Errorf("failed to update project: %w", err)
	}
	return nil
}

// Delete removes a project by ID
func (r *ProjectRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM projects WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete project: %w", err)
	}
	return nil
}

// AssignProjectHead sets or clears the project_head_id on a project
func (r *ProjectRepository) AssignProjectHead(ctx context.Context, projectID string, headID *string) error {
	query := `UPDATE projects SET project_head_id = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.db.Exec(ctx, query, headID, projectID)
	if err != nil {
		return fmt.Errorf("failed to assign project head: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("project not found")
	}
	return nil
}
