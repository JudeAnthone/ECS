package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type programRepository struct {
	db *pgxpool.Pool
}

// NewProgramRepository creates a new ProgramRepository instance
func NewProgramRepository(db *pgxpool.Pool) *programRepository {
	return &programRepository{db: db}
}

// Create inserts a new program into the database
func (r *programRepository) Create(ctx context.Context, program *domain.Program) error {
	query := `
		INSERT INTO programs (
			program_name,
			program_description,
			program_category,
			department_id,
			program_chair_id,
			objectives,
			target_beneficiaries,
			budget_allocation,
			spent_budget,
			start_date,
			end_date,
			status,
			approval_status
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		program.ProgramName,
		program.ProgramDescription,
		program.ProgramCategory,
		program.DepartmentID,
		program.ProgramChairID,
		program.Objectives,
		program.TargetBeneficiaries,
		program.BudgetAllocation,
		program.SpentBudget,
		program.StartDate,
		program.EndDate,
		program.Status,
		program.ApprovalStatus,
	).Scan(&program.ID, &program.CreatedAt, &program.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create program: %w", err)
	}

	return nil
}

// GetAll retrieves all programs from the database
func (r *programRepository) GetAll(ctx context.Context) ([]*domain.Program, error) {
	query := `
		SELECT 
			id,
			program_name,
			program_description,
			program_category,
			department_id,
			program_chair_id,
			objectives,
			target_beneficiaries,
			budget_allocation,
			spent_budget,
			start_date,
			end_date,
			status,
			approval_status,
			approved_by,
			approved_at,
			created_at,
			updated_at
		FROM programs
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query programs: %w", err)
	}
	defer rows.Close()

	var programs []*domain.Program
	for rows.Next() {
		var prog domain.Program
		err := rows.Scan(
			&prog.ID,
			&prog.ProgramName,
			&prog.ProgramDescription,
			&prog.ProgramCategory,
			&prog.DepartmentID,
			&prog.ProgramChairID,
			&prog.Objectives,
			&prog.TargetBeneficiaries,
			&prog.BudgetAllocation,
			&prog.SpentBudget,
			&prog.StartDate,
			&prog.EndDate,
			&prog.Status,
			&prog.ApprovalStatus,
			&prog.ApprovedBy,
			&prog.ApprovedAt,
			&prog.CreatedAt,
			&prog.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan program: %w", err)
		}
		programs = append(programs, &prog)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}

	return programs, nil
}

// GetByID retrieves a program by its ID
func (r *programRepository) GetByID(ctx context.Context, id string) (*domain.Program, error) {
	query := `
		SELECT 
			id,
			program_name,
			program_description,
			program_category,
			department_id,
			program_chair_id,
			objectives,
			target_beneficiaries,
			budget_allocation,
			spent_budget,
			start_date,
			end_date,
			status,
			approval_status,
			approved_by,
			approved_at,
			created_at,
			updated_at
		FROM programs
		WHERE id = $1
	`

	var prog domain.Program
	err := r.db.QueryRow(ctx, query, id).Scan(
		&prog.ID,
		&prog.ProgramName,
		&prog.ProgramDescription,
		&prog.ProgramCategory,
		&prog.DepartmentID,
		&prog.ProgramChairID,
		&prog.Objectives,
		&prog.TargetBeneficiaries,
		&prog.BudgetAllocation,
		&prog.SpentBudget,
		&prog.StartDate,
		&prog.EndDate,
		&prog.Status,
		&prog.ApprovalStatus,
		&prog.ApprovedBy,
		&prog.ApprovedAt,
		&prog.CreatedAt,
		&prog.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("program not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get program: %w", err)
	}

	return &prog, nil
}

// GetByDepartment retrieves all programs for a specific department
func (r *programRepository) GetByDepartment(ctx context.Context, departmentID string) ([]*domain.Program, error) {
	query := `
		SELECT 
			id,
			program_name,
			program_description,
			program_category,
			department_id,
			program_chair_id,
			objectives,
			target_beneficiaries,
			budget_allocation,
			spent_budget,
			start_date,
			end_date,
			status,
			approval_status,
			approved_by,
			approved_at,
			created_at,
			updated_at
		FROM programs
		WHERE department_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, departmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to query programs by department: %w", err)
	}
	defer rows.Close()

	var programs []*domain.Program
	for rows.Next() {
		var prog domain.Program
		err := rows.Scan(
			&prog.ID,
			&prog.ProgramName,
			&prog.ProgramDescription,
			&prog.ProgramCategory,
			&prog.DepartmentID,
			&prog.ProgramChairID,
			&prog.Objectives,
			&prog.TargetBeneficiaries,
			&prog.BudgetAllocation,
			&prog.SpentBudget,
			&prog.StartDate,
			&prog.EndDate,
			&prog.Status,
			&prog.ApprovalStatus,
			&prog.ApprovedBy,
			&prog.ApprovedAt,
			&prog.CreatedAt,
			&prog.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan program: %w", err)
		}
		programs = append(programs, &prog)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}

	return programs, nil
}

// GetByProgramChair retrieves all programs managed by a specific program chair
func (r *programRepository) GetByProgramChair(ctx context.Context, programChairID string) ([]*domain.Program, error) {
	query := `
		SELECT 
			id,
			program_name,
			program_description,
			program_category,
			department_id,
			program_chair_id,
			objectives,
			target_beneficiaries,
			budget_allocation,
			spent_budget,
			start_date,
			end_date,
			status,
			approval_status,
			approved_by,
			approved_at,
			created_at,
			updated_at
		FROM programs
		WHERE program_chair_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, programChairID)
	if err != nil {
		return nil, fmt.Errorf("failed to query programs by program chair: %w", err)
	}
	defer rows.Close()

	var programs []*domain.Program
	for rows.Next() {
		var prog domain.Program
		err := rows.Scan(
			&prog.ID,
			&prog.ProgramName,
			&prog.ProgramDescription,
			&prog.ProgramCategory,
			&prog.DepartmentID,
			&prog.ProgramChairID,
			&prog.Objectives,
			&prog.TargetBeneficiaries,
			&prog.BudgetAllocation,
			&prog.SpentBudget,
			&prog.StartDate,
			&prog.EndDate,
			&prog.Status,
			&prog.ApprovalStatus,
			&prog.ApprovedBy,
			&prog.ApprovedAt,
			&prog.CreatedAt,
			&prog.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan program: %w", err)
		}
		programs = append(programs, &prog)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}

	return programs, nil
}

// Update updates an existing program
func (r *programRepository) Update(ctx context.Context, program *domain.Program) error {
	query := `
		UPDATE programs
		SET 
			program_name = $1,
			program_description = $2,
			program_category = $3,
			department_id = $4,
			program_chair_id = $5,
			objectives = $6,
			target_beneficiaries = $7,
			budget_allocation = $8,
			start_date = $9,
			end_date = $10,
			status = $11,
			updated_at = $12
		WHERE id = $13
	`

	result, err := r.db.Exec(
		ctx,
		query,
		program.ProgramName,
		program.ProgramDescription,
		program.ProgramCategory,
		program.DepartmentID,
		program.ProgramChairID,
		program.Objectives,
		program.TargetBeneficiaries,
		program.BudgetAllocation,
		program.StartDate,
		program.EndDate,
		program.Status,
		time.Now(),
		program.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update program: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("program not found")
	}

	return nil
}

// UpdateStatus updates the status of a program
func (r *programRepository) UpdateStatus(ctx context.Context, id string, status string) error {
	query := `
		UPDATE programs
		SET 
			status = $1,
			updated_at = $2
		WHERE id = $3
	`

	result, err := r.db.Exec(ctx, query, status, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update program status: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("program not found")
	}

	return nil
}

// UpdateApproval updates the approval status of a program
func (r *programRepository) UpdateApproval(ctx context.Context, id string, approvalStatus string, approvedBy *string) error {
	query := `
		UPDATE programs
		SET 
			approval_status = $1,
			approved_by = $2,
			approved_at = $3,
			updated_at = $4
		WHERE id = $5
	`

	result, err := r.db.Exec(ctx, query, approvalStatus, approvedBy, time.Now(), time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update program approval: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("program not found")
	}

	return nil
}

// Delete removes a program from the database
func (r *programRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM programs WHERE id = $1`

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete program: %w", err)
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("program not found")
	}

	return nil
}

// AssignProgramChair sets or clears the program_chair_id on a program
func (r *programRepository) AssignProgramChair(ctx context.Context, programID string, chairID *string) error {
	query := `UPDATE programs SET program_chair_id = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.db.Exec(ctx, query, chairID, programID)
	if err != nil {
		return fmt.Errorf("failed to assign program chair: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("program not found")
	}
	return nil
}
