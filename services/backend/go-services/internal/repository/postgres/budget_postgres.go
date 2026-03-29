package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type budgetRepository struct {
	db *pgxpool.Pool
}

func NewBudgetRepository(db *pgxpool.Pool) *budgetRepository {
	return &budgetRepository{db: db}
}

// GetTotalBudget returns the sum of all program budget_allocations for the current academic year
func (r *budgetRepository) GetTotalBudget(ctx context.Context) (float64, error) {
	var total float64
	// Sum admin-defined annual caps for program chairs.
	query := `SELECT COALESCE(SUM(allocated_budget),0) FROM program_chair_budgets`
	if err := r.db.QueryRow(ctx, query).Scan(&total); err != nil {
		return 0, fmt.Errorf("failed to calculate total budget: %w", err)
	}
	return total, nil
}

// GetAllBudgetRequests returns all budget_requests rows
func (r *budgetRepository) GetAllBudgetRequests(ctx context.Context) ([]*domain.BudgetRequest, error) {
	query := `SELECT id, project_id, requested_by, amount, reason, status, reviewed_by, review_notes, reviewed_at, created_at, updated_at FROM budget_requests ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query budget requests: %w", err)
	}
	defer rows.Close()

	var out []*domain.BudgetRequest
	for rows.Next() {
		var b domain.BudgetRequest
		var reviewedAt *time.Time
		var reviewNotes *string
		var reviewedBy *string
		if err := rows.Scan(&b.ID, &b.ProjectID, &b.RequestedBy, &b.Amount, &b.Reason, &b.Status, &reviewedBy, &reviewNotes, &reviewedAt, &b.CreatedAt, &b.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan budget request: %w", err)
		}
		b.ReviewedAt = reviewedAt
		b.ReviewNotes = reviewNotes
		b.ReviewedBy = reviewedBy
		out = append(out, &b)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}
	return out, nil
}

func (r *budgetRepository) GetProgramChairBudgets(ctx context.Context, chairID *string) ([]*domain.ProgramChairBudget, error) {
	query := `
		SELECT
			pcb.id,
			pcb.chair_id,
			u.first_name,
			u.last_name,
			pcb.allocated_budget,
			pcb.spent_budget,
			pcb.created_at,
			pcb.updated_at
		FROM program_chair_budgets pcb
		JOIN users u ON u.id = pcb.chair_id
		WHERE ($1::uuid IS NULL OR pcb.chair_id = $1::uuid)
		ORDER BY u.first_name, u.last_name
	`
	var chairFilter interface{}
	if chairID != nil && *chairID != "" {
		chairFilter = *chairID
	}
	rows, err := r.db.Query(ctx, query, chairFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to query program chair budgets: %w", err)
	}
	defer rows.Close()

	out := make([]*domain.ProgramChairBudget, 0)
	for rows.Next() {
		var item domain.ProgramChairBudget
		if err := rows.Scan(
			&item.ID,
			&item.ChairID,
			&item.ChairFirstName,
			&item.ChairLastName,
			&item.AllocatedBudget,
			&item.SpentBudget,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan program chair budget: %w", err)
		}
		out = append(out, &item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}
	return out, nil
}

func (r *budgetRepository) SetProgramChairBudget(ctx context.Context, chairID string, allocatedBudget float64) (*domain.ProgramChairBudget, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var role string
	if err := tx.QueryRow(ctx, `SELECT role::text FROM users WHERE id = $1`, chairID).Scan(&role); err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("program chair not found")
		}
		return nil, fmt.Errorf("failed to validate program chair: %w", err)
	}
	if role != "program_chair" {
		return nil, fmt.Errorf("target user is not a program chair")
	}

	var allocatedToDepartments float64
	if err := tx.QueryRow(ctx,
		`SELECT COALESCE(SUM(allocated_budget),0) FROM chair_department_budgets WHERE chair_id = $1`,
		chairID,
	).Scan(&allocatedToDepartments); err != nil {
		return nil, fmt.Errorf("failed to validate department allocations: %w", err)
	}
	if allocatedBudget < allocatedToDepartments {
		return nil, fmt.Errorf("allocated_budget cannot be lower than existing department allocations of %.2f", allocatedToDepartments)
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO program_chair_budgets (chair_id, allocated_budget)
		VALUES ($1, $2)
		ON CONFLICT (chair_id)
		DO UPDATE SET allocated_budget = EXCLUDED.allocated_budget, updated_at = NOW()
	`, chairID, allocatedBudget); err != nil {
		return nil, fmt.Errorf("failed to upsert program chair budget: %w", err)
	}

	item := &domain.ProgramChairBudget{}
	if err := tx.QueryRow(ctx, `
		SELECT
			pcb.id,
			pcb.chair_id,
			u.first_name,
			u.last_name,
			pcb.allocated_budget,
			pcb.spent_budget,
			pcb.created_at,
			pcb.updated_at
		FROM program_chair_budgets pcb
		JOIN users u ON u.id = pcb.chair_id
		WHERE pcb.chair_id = $1
	`, chairID).Scan(
		&item.ID,
		&item.ChairID,
		&item.ChairFirstName,
		&item.ChairLastName,
		&item.AllocatedBudget,
		&item.SpentBudget,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return nil, fmt.Errorf("failed to fetch updated program chair budget: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}
	return item, nil
}

func (r *budgetRepository) GetChairDepartmentBudgets(ctx context.Context, chairID *string) ([]*domain.ChairDepartmentBudget, error) {
	query := `
		SELECT
			cdb.id,
			cdb.chair_id,
			u.first_name,
			u.last_name,
			cdb.department_id,
			d.department_name,
			cdb.allocated_budget,
			cdb.spent_budget,
			cdb.created_at,
			cdb.updated_at
		FROM chair_department_budgets cdb
		JOIN users u ON u.id = cdb.chair_id
		JOIN departments d ON d.id = cdb.department_id
		WHERE ($1::uuid IS NULL OR cdb.chair_id = $1::uuid)
		ORDER BY u.first_name, u.last_name, d.department_name
	`
	var chairFilter interface{}
	if chairID != nil && *chairID != "" {
		chairFilter = *chairID
	}
	rows, err := r.db.Query(ctx, query, chairFilter)
	if err != nil {
		return nil, fmt.Errorf("failed to query chair department budgets: %w", err)
	}
	defer rows.Close()

	out := make([]*domain.ChairDepartmentBudget, 0)
	for rows.Next() {
		var item domain.ChairDepartmentBudget
		if err := rows.Scan(
			&item.ID,
			&item.ChairID,
			&item.ChairFirstName,
			&item.ChairLastName,
			&item.DepartmentID,
			&item.DepartmentName,
			&item.AllocatedBudget,
			&item.SpentBudget,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan chair department budget: %w", err)
		}
		out = append(out, &item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}
	return out, nil
}

func (r *budgetRepository) SetChairDepartmentBudget(ctx context.Context, chairID string, departmentID string, allocatedBudget float64) (*domain.ChairDepartmentBudget, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var chairAllocatedBudget float64
	if err := tx.QueryRow(ctx,
		`SELECT allocated_budget FROM program_chair_budgets WHERE chair_id = $1`,
		chairID,
	).Scan(&chairAllocatedBudget); err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("program chair has no admin budget yet")
		}
		return nil, fmt.Errorf("failed to load chair budget: %w", err)
	}

	var allocationsExcludingCurrent float64
	if err := tx.QueryRow(ctx, `
		SELECT COALESCE(SUM(allocated_budget),0)
		FROM chair_department_budgets
		WHERE chair_id = $1 AND department_id <> $2
	`, chairID, departmentID).Scan(&allocationsExcludingCurrent); err != nil {
		return nil, fmt.Errorf("failed to validate existing allocations: %w", err)
	}

	if allocationsExcludingCurrent+allocatedBudget > chairAllocatedBudget {
		return nil, fmt.Errorf("department allocations exceed chair budget cap")
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO chair_department_budgets (chair_id, department_id, allocated_budget)
		VALUES ($1, $2, $3)
		ON CONFLICT (chair_id, department_id)
		DO UPDATE SET allocated_budget = EXCLUDED.allocated_budget, updated_at = NOW()
	`, chairID, departmentID, allocatedBudget); err != nil {
		return nil, fmt.Errorf("failed to upsert chair department budget: %w", err)
	}

	item := &domain.ChairDepartmentBudget{}
	if err := tx.QueryRow(ctx, `
		SELECT
			cdb.id,
			cdb.chair_id,
			u.first_name,
			u.last_name,
			cdb.department_id,
			d.department_name,
			cdb.allocated_budget,
			cdb.spent_budget,
			cdb.created_at,
			cdb.updated_at
		FROM chair_department_budgets cdb
		JOIN users u ON u.id = cdb.chair_id
		JOIN departments d ON d.id = cdb.department_id
		WHERE cdb.chair_id = $1 AND cdb.department_id = $2
	`, chairID, departmentID).Scan(
		&item.ID,
		&item.ChairID,
		&item.ChairFirstName,
		&item.ChairLastName,
		&item.DepartmentID,
		&item.DepartmentName,
		&item.AllocatedBudget,
		&item.SpentBudget,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return nil, fmt.Errorf("failed to fetch updated chair department budget: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}
	return item, nil
}

func (r *budgetRepository) DeleteChairDepartmentBudget(ctx context.Context, chairID string, departmentID string) error {
	if _, err := r.db.Exec(ctx, `DELETE FROM chair_department_budgets WHERE chair_id = $1 AND department_id = $2`, chairID, departmentID); err != nil {
		return fmt.Errorf("failed to delete chair department budget: %w", err)
	}
	return nil
}
