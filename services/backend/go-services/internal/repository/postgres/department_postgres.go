package postgres

import (
	"context"
	"fmt"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type departmentRepository struct {
	db *pgxpool.Pool
}

// NewDepartmentRepository creates a new DepartmentRepository instance
func NewDepartmentRepository(db *pgxpool.Pool) *departmentRepository {
	return &departmentRepository{db: db}
}

// GetAll retrieves all departments from the database
func (r *departmentRepository) GetAll(ctx context.Context) ([]*domain.Department, error) {
	query := `
		SELECT 
			id, 
			department_name, 
			department_code,
			program_chair_id,
			budget_allocation,
			spent_budget,
			description,
			is_active,
			created_at,
			updated_at
		FROM departments
		WHERE is_active = true
		ORDER BY department_name ASC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query departments: %w", err)
	}
	defer rows.Close()

	var departments []*domain.Department
	for rows.Next() {
		var dept domain.Department
		err := rows.Scan(
			&dept.ID,
			&dept.DepartmentName,
			&dept.DepartmentCode,
			&dept.ProgramChairID,
			&dept.BudgetAllocation,
			&dept.SpentBudget,
			&dept.Description,
			&dept.IsActive,
			&dept.CreatedAt,
			&dept.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan department: %w", err)
		}
		departments = append(departments, &dept)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}

	return departments, nil
}

// GetByID retrieves a department by its ID
func (r *departmentRepository) GetByID(ctx context.Context, id string) (*domain.Department, error) {
	query := `
		SELECT 
			id, 
			department_name, 
			department_code,
			program_chair_id,
			budget_allocation,
			spent_budget,
			description,
			is_active,
			created_at,
			updated_at
		FROM departments
		WHERE id = $1
	`

	var dept domain.Department
	err := r.db.QueryRow(ctx, query, id).Scan(
		&dept.ID,
		&dept.DepartmentName,
		&dept.DepartmentCode,
		&dept.ProgramChairID,
		&dept.BudgetAllocation,
		&dept.SpentBudget,
		&dept.Description,
		&dept.IsActive,
		&dept.CreatedAt,
		&dept.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("department not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get department: %w", err)
	}

	return &dept, nil
}

// GetByCode retrieves a department by its code
func (r *departmentRepository) GetByCode(ctx context.Context, code string) (*domain.Department, error) {
	query := `
		SELECT 
			id, 
			department_name, 
			department_code,
			program_chair_id,
			budget_allocation,
			spent_budget,
			description,
			is_active,
			created_at,
			updated_at
		FROM departments
		WHERE department_code = $1
	`

	var dept domain.Department
	err := r.db.QueryRow(ctx, query, code).Scan(
		&dept.ID,
		&dept.DepartmentName,
		&dept.DepartmentCode,
		&dept.ProgramChairID,
		&dept.BudgetAllocation,
		&dept.SpentBudget,
		&dept.Description,
		&dept.IsActive,
		&dept.CreatedAt,
		&dept.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("department not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get department: %w", err)
	}

	return &dept, nil
}
