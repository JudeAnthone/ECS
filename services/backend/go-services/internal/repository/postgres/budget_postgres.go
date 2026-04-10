package postgres

import (
	"context"
	"database/sql"
	"fmt"

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

const budgetRequestSelectColumns = `
	SELECT
		br.id,
		br.project_id,
		COALESCE(p.project_name, ''),
		COALESCE(p.department_id::text, ''),
		COALESCE(d.department_name, ''),
		COALESCE(cdb.allocated_budget, 0),
		COALESCE(cdb.spent_budget, 0),
		COALESCE(cdb.allocated_budget - cdb.spent_budget, 0),
		COALESCE(br.approved_against_chair_department_budget_id::text, ''),
		br.requested_by,
		COALESCE(NULLIF(TRIM(CONCAT_WS(' ', requester.first_name, requester.last_name)), ''), ''),
		br.amount,
		br.reason,
		br.needed_by_date,
		br.status,
		br.workflow_stage,
		COALESCE(br.document_url, ''),
		COALESCE(br.document_name, ''),
		COALESCE(br.reviewed_by::text, ''),
		COALESCE(NULLIF(TRIM(CONCAT_WS(' ', chair.first_name, chair.last_name)), ''), ''),
		COALESCE(br.review_notes, ''),
		br.reviewed_at,
		COALESCE(br.chair_slip_number, ''),
		br.chair_slip_generated_at,
		br.created_at,
		br.updated_at
	FROM budget_requests br
	JOIN projects p ON p.id = br.project_id
	LEFT JOIN departments d ON d.id = p.department_id
	JOIN users requester ON requester.id = br.requested_by
	LEFT JOIN users chair ON chair.id = br.reviewed_by
	LEFT JOIN programs prg ON prg.id = p.program_id
	LEFT JOIN chair_department_budgets cdb ON cdb.chair_id = prg.program_chair_id AND cdb.department_id = p.department_id
`

func scanBudgetRequest(rows pgx.Rows) (*domain.BudgetRequest, error) {
	var item domain.BudgetRequest
	var neededByDate sql.NullTime
	var reviewedAt sql.NullTime
	var chairSlipGeneratedAt sql.NullTime
	if err := rows.Scan(
		&item.ID,
		&item.ProjectID,
		&item.ProjectName,
		&item.DepartmentID,
		&item.DepartmentName,
		&item.DepartmentAllocatedBudget,
		&item.DepartmentSpentBudget,
		&item.DepartmentRemainingBudget,
		&item.ApprovedAgainstChairDepartmentBudgetID,
		&item.RequestedBy,
		&item.RequestedByName,
		&item.Amount,
		&item.Reason,
		&neededByDate,
		&item.Status,
		&item.WorkflowStage,
		&item.DocumentURL,
		&item.DocumentName,
		&item.ReviewedBy,
		&item.ReviewedByName,
		&item.ReviewNotes,
		&reviewedAt,
		&item.ChairSlipNumber,
		&chairSlipGeneratedAt,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return nil, err
	}
	if neededByDate.Valid {
		item.NeededByDate = &neededByDate.Time
	}
	if reviewedAt.Valid {
		item.ReviewedAt = &reviewedAt.Time
	}
	if chairSlipGeneratedAt.Valid {
		item.ChairSlipGeneratedAt = &chairSlipGeneratedAt.Time
	}
	return &item, nil
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

// GetAllBudgetRequests returns budget_requests rows scoped by role.
func (r *budgetRepository) GetAllBudgetRequests(ctx context.Context, role string, userID string) ([]*domain.BudgetRequest, error) {
	query := budgetRequestSelectColumns
	args := make([]interface{}, 0)
	switch role {
	case domain.RoleProjectHead:
		query += ` WHERE br.requested_by = $1`
		args = append(args, userID)
	case domain.RoleProgramChair:
		query += ` WHERE prg.program_chair_id = $1`
		args = append(args, userID)
	case domain.RoleAdmin:
		// no filter
	default:
		return nil, fmt.Errorf("forbidden: unsupported role for budget request listing")
	}
	query += ` ORDER BY br.created_at DESC`

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query budget requests: %w", err)
	}
	defer rows.Close()

	var out []*domain.BudgetRequest
	for rows.Next() {
		item, err := scanBudgetRequest(rows)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget request: %w", err)
		}
		out = append(out, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}
	return out, nil
}

func (r *budgetRepository) GetBudgetRequestByID(ctx context.Context, id string) (*domain.BudgetRequest, error) {
	query := budgetRequestSelectColumns + ` WHERE br.id = $1`
	rows, err := r.db.Query(ctx, query, id)
	if err != nil {
		return nil, fmt.Errorf("failed to query budget request: %w", err)
	}
	defer rows.Close()
	if !rows.Next() {
		return nil, fmt.Errorf("budget request not found")
	}
	item, err := scanBudgetRequest(rows)
	if err != nil {
		return nil, fmt.Errorf("failed to scan budget request: %w", err)
	}
	return item, nil
}

func (r *budgetRepository) CreateBudgetRequest(ctx context.Context, req *domain.BudgetRequest) (*domain.BudgetRequest, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	if err := tx.QueryRow(ctx, `
		INSERT INTO budget_requests (
			project_id, requested_by, amount, reason, needed_by_date, status, workflow_stage,
			document_url, document_name, reviewed_by, review_notes, reviewed_at,
			chair_slip_number, chair_slip_generated_at
		)
		VALUES ($1, $2, $3, $4, $5, 'pending', 'pending', $6, $7, NULL, NULL, NULL, NULL, NULL)
		RETURNING id, created_at, updated_at
	`, req.ProjectID, req.RequestedBy, req.Amount, req.Reason, req.NeededByDate, req.DocumentURL, req.DocumentName).Scan(&req.ID, &req.CreatedAt, &req.UpdatedAt); err != nil {
		return nil, fmt.Errorf("failed to create budget request: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}
	created, err := r.GetBudgetRequestByID(ctx, req.ID)
	if err != nil {
		return nil, err
	}
	return created, nil
}

func (r *budgetRepository) ReviewBudgetRequest(ctx context.Context, id string, reviewerID string, notes *string, approved bool) (*domain.BudgetRequest, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var amount float64
	var projectID string
	var departmentID sql.NullString
	if err := tx.QueryRow(ctx, `
		SELECT br.amount, br.project_id::text, p.department_id::text
		FROM budget_requests br
		JOIN projects p ON p.id = br.project_id
		WHERE br.id = $1
		FOR UPDATE
	`, id).Scan(&amount, &projectID, &departmentID); err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("budget request not found")
		}
		return nil, fmt.Errorf("failed to lock budget request: %w", err)
	}

	stage := "approved"
	status := "approved"
	var approvedAgainstChairDepartmentBudgetID *string
	if !approved {
		stage = "declined"
		status = "declined"
	}

	if approved {
		projectResult, err := tx.Exec(ctx, `
			UPDATE projects
			SET budget_used = COALESCE(budget_used, 0) + $2,
				updated_at = NOW()
			WHERE id = $1::uuid
			  AND (
				budget_allocated IS NULL
				OR COALESCE(budget_used, 0) + $2 <= budget_allocated
			  )
		`, projectID, amount)
		if err != nil {
			return nil, fmt.Errorf("failed to apply spend to project: %w", err)
		}
		if projectResult.RowsAffected() == 0 {
			return nil, fmt.Errorf("insufficient project budget for requested spend amount")
		}

		if departmentID.Valid && departmentID.String != "" {
			var chairDepartmentBudgetID string
			if err := tx.QueryRow(ctx, `
				SELECT id::text
				FROM chair_department_budgets
				WHERE chair_id = $1::uuid
				  AND department_id = $2::uuid
				FOR UPDATE
			`, reviewerID, departmentID.String).Scan(&chairDepartmentBudgetID); err != nil {
				if err == pgx.ErrNoRows {
					return nil, fmt.Errorf("missing department allocation under reviewing chair for requested spend")
				}
				return nil, fmt.Errorf("failed to lock chair department allocation: %w", err)
			}

			deptResult, err := tx.Exec(ctx, `
				UPDATE chair_department_budgets
				SET spent_budget = spent_budget + $2,
					updated_at = NOW()
				WHERE id = $1::uuid
				  AND (
					allocated_budget = 0
					OR spent_budget + $2 <= allocated_budget
				  )
			`, chairDepartmentBudgetID, amount)
			if err != nil {
				return nil, fmt.Errorf("failed to apply spend to chair department budget: %w", err)
			}
			if deptResult.RowsAffected() == 0 {
				return nil, fmt.Errorf("insufficient department allocation for requested spend amount")
			}
			approvedAgainstChairDepartmentBudgetID = &chairDepartmentBudgetID

			deptSummaryResult, err := tx.Exec(ctx, `
				UPDATE departments
				SET spent_budget = COALESCE(spent_budget, 0) + $2,
					updated_at = NOW()
				WHERE id = $1::uuid
				  AND (
					budget_allocation = 0
					OR COALESCE(spent_budget, 0) + $2 <= budget_allocation
				  )
			`, departmentID.String, amount)
			if err != nil {
				return nil, fmt.Errorf("failed to apply spend to department budget summary: %w", err)
			}
			if deptSummaryResult.RowsAffected() == 0 {
				return nil, fmt.Errorf("insufficient department budget for requested spend amount")
			}
		} else {
			return nil, fmt.Errorf("project department is required for budget request approval")
		}

	}

	query := `
		UPDATE budget_requests SET
			reviewed_by = $2,
			review_notes = $3::text,
			reviewed_at = NOW(),
			workflow_stage = $4,
			status = $5,
			approved_against_chair_department_budget_id = $7::uuid,
			chair_slip_number = CASE WHEN $6 THEN CONCAT('SLIP-', EXTRACT(EPOCH FROM NOW())::bigint, '-', SUBSTRING(REPLACE(id::text, '-', '') FROM 1 FOR 8)) ELSE NULL END,
			chair_slip_generated_at = CASE WHEN $6 THEN NOW() ELSE NULL END,
			updated_at = NOW()
		WHERE id = $1
	`
	if _, err := tx.Exec(ctx, query, id, reviewerID, notes, stage, status, approved, approvedAgainstChairDepartmentBudgetID); err != nil {
		return nil, fmt.Errorf("failed to review budget request: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit budget review: %w", err)
	}

	return r.GetBudgetRequestByID(ctx, id)
}

func (r *budgetRepository) DeleteBudgetRequest(ctx context.Context, id string) error {
	result, err := r.db.Exec(ctx, `DELETE FROM budget_requests WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete budget request: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("budget request not found")
	}
	return nil
}

func (r *budgetRepository) GetProjectHeadStaffBudgetDocuments(ctx context.Context, projectHeadID string) ([]*domain.BudgetSupportDocument, error) {
	query := `
		SELECT
			d.id,
			COALESCE(d.project_id::text, ''),
			COALESCE(p.project_name, ''),
			d.document_type::text,
			COALESCE(d.title, ''),
			COALESCE(d.file_url, ''),
			COALESCE(NULLIF(TRIM(CONCAT_WS(' ', u.first_name, u.last_name)), ''), ''),
			d.created_at
		FROM documents d
		JOIN users u ON u.id = d.uploaded_by
		LEFT JOIN projects p ON p.id = d.project_id
		WHERE u.role = 'staff'
		  AND d.document_type IN ('budget_report', 'market_research')
		  AND d.project_id IN (
			SELECT id
			FROM projects
			WHERE created_by = $1 OR project_head_id = $1
		  )
		ORDER BY d.created_at DESC
	`
	rows, err := r.db.Query(ctx, query, projectHeadID)
	if err != nil {
		return nil, fmt.Errorf("failed to query staff budget documents: %w", err)
	}
	defer rows.Close()

	out := make([]*domain.BudgetSupportDocument, 0)
	for rows.Next() {
		item := &domain.BudgetSupportDocument{}
		if err := rows.Scan(
			&item.ID,
			&item.ProjectID,
			&item.ProjectName,
			&item.DocumentType,
			&item.Title,
			&item.FileURL,
			&item.UploadedByName,
			&item.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan staff budget document: %w", err)
		}
		out = append(out, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("staff budget document iteration error: %w", err)
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

func (r *budgetRepository) GetChairDepartmentBudgets(ctx context.Context, chairID *string, departmentID *string) ([]*domain.ChairDepartmentBudget, error) {
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
		  AND ($2::uuid IS NULL OR cdb.department_id = $2::uuid)
		ORDER BY u.first_name, u.last_name, d.department_name
	`
	var chairFilter interface{}
	var departmentFilter interface{}
	if chairID != nil && *chairID != "" {
		chairFilter = *chairID
	}
	if departmentID != nil && *departmentID != "" {
		departmentFilter = *departmentID
	}
	rows, err := r.db.Query(ctx, query, chairFilter, departmentFilter)
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
