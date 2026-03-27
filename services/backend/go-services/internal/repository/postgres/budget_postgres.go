package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
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
	// Sum budget_allocation across programs; NULLs treated as 0
	query := `SELECT COALESCE(SUM(budget_allocation),0) FROM programs`
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
