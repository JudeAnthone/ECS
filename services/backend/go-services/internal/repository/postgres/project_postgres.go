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

const projectSelectColumns = `
	SELECT p.id, p.project_name, p.project_description, p.program_id, p.department_id, p.project_head_id,
	       p.creation_source, p.request_id, p.created_by, p.updated_by,
	       p.objectives, p.budget_allocated, p.budget_used, p.start_date, p.end_date, p.progress_percentage,
	       p.status, p.approval_status,
	       CASE
	         WHEN p.approval_status = 'rejected' THEN feedback.latest_rejection_feedback
	         ELSE NULL
	       END AS feedback,
	       COALESCE(creator.role = 'staff', false) AS staff_originated,
	       p.is_published, p.created_at, p.updated_at,
	       p.created_by_role, p.created_by_first_name, p.created_by_last_name
	FROM projects p
	LEFT JOIN users creator ON creator.id = p.created_by
	LEFT JOIN LATERAL (
		SELECT NULLIF(BTRIM(al.details->>'review_notes'), '') AS latest_rejection_feedback
		FROM activity_logs al
		WHERE al.entity_type = 'project'
		  AND al.entity_id = p.id
		  AND (
			(al.details->>'approval_status') = 'rejected'
			OR (al.details->>'status') = 'cancelled'
		  )
		ORDER BY al.created_at DESC
		LIMIT 1
	) feedback ON true
`

// Create inserts a new project into the database
func (r *ProjectRepository) Create(ctx context.Context, p *domain.Project, createdBy string) error {
	query := `
		INSERT INTO projects
			(project_name, project_description, program_id, department_id, project_head_id, objectives,
			 budget_allocated, start_date, end_date, status, approval_status, creation_source, created_by,
			 created_by_role, created_by_first_name, created_by_last_name)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'internal_proposal', $12, $13, $14, $15)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query,
		p.ProjectName,
		p.ProjectDescription,
		p.ProgramID,
		p.DepartmentID,
		p.ProjectHeadID,
		p.Objectives,
		p.BudgetAllocated,
		p.StartDate,
		p.EndDate,
		p.Status,
		p.ApprovalStatus,
		createdBy,
		p.CreatedByRole,
		p.CreatedByFirstName,
		p.CreatedByLastName,
	).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create project: %w", err)
	}
	return nil
}

// GetByProgramID retrieves all projects belonging to a program
func (r *ProjectRepository) GetByProgramID(ctx context.Context, programID string) ([]*domain.Project, error) {
	query := projectSelectColumns + `
		WHERE p.program_id = $1
		ORDER BY p.created_at DESC
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
			&p.DepartmentID, &p.ProjectHeadID, &p.CreationSource, &p.RequestID, &p.CreatedBy, &p.UpdatedBy, &p.Objectives,
			&p.BudgetAllocated, &p.BudgetUsed, &p.StartDate, &p.EndDate, &p.ProgressPercentage,
			&p.Status, &p.ApprovalStatus, &p.Feedback, &p.StaffOriginated, &p.IsPublished, &p.CreatedAt, &p.UpdatedAt,
			&p.CreatedByRole, &p.CreatedByFirstName, &p.CreatedByLastName,
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

// GetByCreatedBy retrieves all projects submitted by a specific creator.
func (r *ProjectRepository) GetByCreatedBy(ctx context.Context, createdBy string) ([]*domain.Project, error) {
	query := projectSelectColumns + `
		WHERE p.created_by = $1
		ORDER BY p.created_at DESC
	`

	rows, err := r.db.Query(ctx, query, createdBy)
	if err != nil {
		return nil, fmt.Errorf("failed to query projects by creator: %w", err)
	}
	defer rows.Close()

	var projects []*domain.Project
	for rows.Next() {
		p := &domain.Project{}
		err := rows.Scan(
			&p.ID, &p.ProjectName, &p.ProjectDescription, &p.ProgramID,
			&p.DepartmentID, &p.ProjectHeadID, &p.CreationSource, &p.RequestID, &p.CreatedBy, &p.UpdatedBy, &p.Objectives,
			&p.BudgetAllocated, &p.BudgetUsed, &p.StartDate, &p.EndDate, &p.ProgressPercentage,
			&p.Status, &p.ApprovalStatus, &p.Feedback, &p.StaffOriginated, &p.IsPublished, &p.CreatedAt, &p.UpdatedAt,
			&p.CreatedByRole, &p.CreatedByFirstName, &p.CreatedByLastName,
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

// GetByProjectHeadID retrieves all projects currently assigned to a project head.
func (r *ProjectRepository) GetByProjectHeadID(ctx context.Context, headID string) ([]*domain.Project, error) {
	query := projectSelectColumns + `
		WHERE p.project_head_id = $1
		ORDER BY p.updated_at DESC, p.created_at DESC
	`

	rows, err := r.db.Query(ctx, query, headID)
	if err != nil {
		return nil, fmt.Errorf("failed to query projects by project head: %w", err)
	}
	defer rows.Close()

	var projects []*domain.Project
	for rows.Next() {
		p := &domain.Project{}
		err := rows.Scan(
			&p.ID, &p.ProjectName, &p.ProjectDescription, &p.ProgramID,
			&p.DepartmentID, &p.ProjectHeadID, &p.CreationSource, &p.RequestID, &p.CreatedBy, &p.UpdatedBy, &p.Objectives,
			&p.BudgetAllocated, &p.BudgetUsed, &p.StartDate, &p.EndDate, &p.ProgressPercentage,
			&p.Status, &p.ApprovalStatus, &p.Feedback, &p.StaffOriginated, &p.IsPublished, &p.CreatedAt, &p.UpdatedAt,
			&p.CreatedByRole, &p.CreatedByFirstName, &p.CreatedByLastName,
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
	query := projectSelectColumns + `
		WHERE p.id = $1
	`

	p := &domain.Project{}
	if err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ID, &p.ProjectName, &p.ProjectDescription, &p.ProgramID,
		&p.DepartmentID, &p.ProjectHeadID, &p.CreationSource, &p.RequestID, &p.CreatedBy, &p.UpdatedBy, &p.Objectives,
		&p.BudgetAllocated, &p.BudgetUsed, &p.StartDate, &p.EndDate, &p.ProgressPercentage,
		&p.Status, &p.ApprovalStatus, &p.Feedback, &p.StaffOriginated, &p.IsPublished, &p.CreatedAt, &p.UpdatedAt,
		&p.CreatedByRole, &p.CreatedByFirstName, &p.CreatedByLastName,
	); err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}

	return p, nil
}

// ProjectHeadPreReview updates a project based on project-head pre-review decision
// and records an audit log entry.
func (r *ProjectRepository) ProjectHeadPreReview(ctx context.Context, id string, headID string, reviewNotes *string, approved bool) error {
	status := "planning"
	approvalStatus := "pending"
	action := "project_head_pre_review_approved"
	if !approved {
		status = "cancelled"
		approvalStatus = "rejected"
		action = "project_head_pre_review_rejected"
	}

	query := `
		WITH updated AS (
			UPDATE projects
			SET project_head_id = $2,
			    status = $3,
			    approval_status = $4,
			    approved_by = CASE WHEN $5 = 'rejected' THEN $2 ELSE approved_by END,
			    approved_at = CASE WHEN $5 = 'rejected' THEN NOW() ELSE approved_at END,
			    updated_by = $2,
			    updated_at = NOW()
			WHERE id = $1
			RETURNING id, status, approval_status
		)
		INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, created_at)
		SELECT
			$2,
			$6,
			'project',
			u.id,
			jsonb_build_object(
				'status', u.status,
				'approval_status', u.approval_status,
				'review_notes', $7::text
			),
			NOW()
		FROM updated u
	`

	result, err := r.db.Exec(ctx, query, id, headID, status, approvalStatus, approvalStatus, action, reviewNotes)
	if err != nil {
		return fmt.Errorf("failed to update project head pre-review: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("project not found")
	}
	return nil
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

// UpdateApproval updates project approval status/lifecycle and appends an audit log entry.
func (r *ProjectRepository) UpdateApproval(ctx context.Context, id string, approvalStatus string, status string, actorID string, reviewNotes *string) error {
	query := `
		WITH updated AS (
			UPDATE projects
			SET approval_status = $1,
			    status = $2,
			    approved_by = $3,
			    approved_at = NOW(),
			    updated_at = NOW()
			WHERE id = $4
			RETURNING id, approval_status, status, approved_at
		)
		INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, created_at)
		SELECT
			$3,
			'project_approval_updated',
			'project',
			u.id,
			jsonb_build_object(
				'approval_status', u.approval_status,
				'status', u.status,
				'review_notes', $5::text,
				'approved_at', u.approved_at
			),
			NOW()
		FROM updated u
	`

	result, err := r.db.Exec(ctx, query, approvalStatus, status, actorID, id, reviewNotes)
	if err != nil {
		return fmt.Errorf("failed to update project approval: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("project not found")
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

// GetAssignedStaffIDsByProject returns staff IDs assigned to a project.
func (r *ProjectRepository) GetAssignedStaffIDsByProject(ctx context.Context, projectID string) ([]string, error) {
	rows, err := r.db.Query(ctx, `
		SELECT staff_id::text
		FROM project_staff_assignments
		WHERE project_id = $1
		ORDER BY assigned_at ASC
	`, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to query project staff assignments: %w", err)
	}
	defer rows.Close()

	staffIDs := make([]string, 0)
	for rows.Next() {
		var staffID string
		if err := rows.Scan(&staffID); err != nil {
			return nil, fmt.Errorf("failed to scan assigned staff id: %w", err)
		}
		staffIDs = append(staffIDs, staffID)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return staffIDs, nil
}

// ReplaceProjectStaffAssignments replaces all assigned staff for a project in a transaction.
func (r *ProjectRepository) ReplaceProjectStaffAssignments(ctx context.Context, projectID string, staffIDs []string, assignedBy string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var hasApprovedRequest bool
	if err := tx.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM budget_requests
			WHERE project_id = $1::uuid
			  AND status = 'approved'::budget_request_status
		)
	`, projectID).Scan(&hasApprovedRequest); err != nil {
		return fmt.Errorf("failed to validate approved budget requests: %w", err)
	}
	if !hasApprovedRequest {
		return fmt.Errorf("cannot assign project staff before an approved budget request exists")
	}

	// Capture current assigned staff before replacement so we can detect removals.
	previousRows, err := tx.Query(ctx, `
		SELECT staff_id::text
		FROM project_staff_assignments
		WHERE project_id = $1
	`, projectID)
	if err != nil {
		return fmt.Errorf("failed to load existing project staff assignments: %w", err)
	}
	previousStaffIDs := make([]string, 0)
	for previousRows.Next() {
		var staffID string
		if err := previousRows.Scan(&staffID); err != nil {
			previousRows.Close()
			return fmt.Errorf("failed to scan existing staff assignment: %w", err)
		}
		previousStaffIDs = append(previousStaffIDs, staffID)
	}
	if err := previousRows.Err(); err != nil {
		previousRows.Close()
		return fmt.Errorf("failed while reading existing staff assignments: %w", err)
	}
	previousRows.Close()

	if _, err := tx.Exec(ctx, `DELETE FROM project_staff_assignments WHERE project_id = $1`, projectID); err != nil {
		return fmt.Errorf("failed to clear project staff assignments: %w", err)
	}

	for _, staffID := range staffIDs {
		if _, err := tx.Exec(ctx, `
			INSERT INTO project_staff_assignments (project_id, staff_id, assigned_by)
			VALUES ($1, $2, $3)
		`, projectID, staffID, assignedBy); err != nil {
			return fmt.Errorf("failed to insert project staff assignment: %w", err)
		}
	}

	currentStaffSet := make(map[string]struct{}, len(staffIDs))
	for _, id := range staffIDs {
		currentStaffSet[id] = struct{}{}
	}

	removedStaffIDs := make([]string, 0)
	for _, oldID := range previousStaffIDs {
		if _, stillAssigned := currentStaffSet[oldID]; !stillAssigned {
			removedStaffIDs = append(removedStaffIDs, oldID)
		}
	}

	if len(removedStaffIDs) > 0 {
		if _, err := tx.Exec(ctx, `
			DELETE FROM task_assignments ta
			USING tasks t
			WHERE ta.task_id = t.id
			  AND t.project_id = $1
			  AND ta.user_id = ANY($2::uuid[])
		`, projectID, removedStaffIDs); err != nil {
			return fmt.Errorf("failed to remove task assignments for unassigned staff: %w", err)
		}

		if _, err := tx.Exec(ctx, `
			WITH replacement AS (
							 SELECT t.id AS task_id, MIN(ta.user_id::text)::uuid AS next_assignee
							 FROM tasks t
							 JOIN task_assignments ta ON ta.task_id = t.id
							 WHERE t.project_id = $1
								 AND t.assigned_to = ANY($2::uuid[])
								 AND t.status IN ('pending', 'in_progress')
								 AND t.deleted_at IS NULL
							 GROUP BY t.id
			)
			UPDATE tasks t
			SET assigned_to = r.next_assignee,
			    updated_at = NOW()
			FROM replacement r
			WHERE t.id = r.task_id
		`, projectID, removedStaffIDs); err != nil {
			return fmt.Errorf("failed to reassign tasks to remaining assignees: %w", err)
		}

		if _, err := tx.Exec(ctx, `
			UPDATE tasks
			SET status = 'cancelled',
			    updated_at = NOW()
			WHERE project_id = $1
			  AND assigned_to = ANY($2::uuid[])
			  AND status IN ('pending', 'in_progress')
		`, projectID, removedStaffIDs); err != nil {
			return fmt.Errorf("failed to cancel tasks for unassigned staff: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit project staff assignment changes: %w", err)
	}

	return nil
}

// CreateProjectTask persists a project task and its task assignments.
func (r *ProjectRepository) CreateProjectTask(ctx context.Context, projectID string, createdBy string, req *domain.CreateProjectTaskRequest) (*domain.ProjectTask, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var projectBudgetAllocated *float64
	var projectBudgetUsed float64
	if err := tx.QueryRow(ctx, `
		SELECT budget_allocated, COALESCE(budget_used, 0)
		FROM projects
		WHERE id = $1::uuid
		FOR UPDATE
	`, projectID).Scan(&projectBudgetAllocated, &projectBudgetUsed); err != nil {
		return nil, fmt.Errorf("failed to load project budget: %w", err)
	}
	if projectBudgetAllocated == nil {
		return nil, fmt.Errorf("project has no allocated budget")
	}
	if req.BudgetNeeded < 0 {
		return nil, fmt.Errorf("task budget_needed cannot be negative")
	}
	if projectBudgetUsed+req.BudgetNeeded > *projectBudgetAllocated {
		remaining := *projectBudgetAllocated - projectBudgetUsed
		if remaining < 0 {
			remaining = 0
		}
		return nil, fmt.Errorf("insufficient project budget: remaining %.2f, requested %.2f", remaining, req.BudgetNeeded)
	}

	if req.BudgetNeeded > 0 {
		var approvedBudget float64
		if err := tx.QueryRow(ctx, `
			SELECT COALESCE(SUM(amount), 0)
			FROM budget_requests
			WHERE project_id = $1::uuid
			  AND status = 'approved'::budget_request_status
		`, projectID).Scan(&approvedBudget); err != nil {
			return nil, fmt.Errorf("failed to load approved budget requests: %w", err)
		}

		if approvedBudget <= 0 {
			return nil, fmt.Errorf("cannot create budgeted tasks before an approved budget request exists")
		}

		var committedTaskBudget float64
		if err := tx.QueryRow(ctx, `
			SELECT COALESCE(SUM(budget_needed), 0)
			FROM tasks
			WHERE project_id = $1::uuid
			  AND status <> 'cancelled'::task_status
		`, projectID).Scan(&committedTaskBudget); err != nil {
			return nil, fmt.Errorf("failed to load existing task budget commitments: %w", err)
		}

		if committedTaskBudget+req.BudgetNeeded > approvedBudget {
			remainingApproved := approvedBudget - committedTaskBudget
			if remainingApproved < 0 {
				remainingApproved = 0
			}
			return nil, fmt.Errorf("insufficient approved budget request amount: remaining %.2f, requested %.2f", remainingApproved, req.BudgetNeeded)
		}
	}

	var assignedTo *string
	if len(req.AssigneeIDs) > 0 {
		assignedTo = &req.AssigneeIDs[0]
	}

	task := &domain.ProjectTask{}
	err = tx.QueryRow(ctx, `
		INSERT INTO tasks (project_id, title, description, budget_needed, status, priority, assigned_to, created_by, due_date)
		VALUES ($1::uuid, $2, $3, $4, 'pending', $5, $6::uuid, $7::uuid, $8::date)
		RETURNING id::text, project_id::text, title, description, budget_needed, status, priority, due_date, created_at
	`, projectID, req.Title, req.Description, req.BudgetNeeded, req.Priority, assignedTo, createdBy, req.DueDate).Scan(
		&task.ID,
		&task.ProjectID,
		&task.Title,
		&task.Description,
		&task.BudgetNeeded,
		&task.Status,
		&task.Priority,
		&task.DueDate,
		&task.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	for _, assigneeID := range req.AssigneeIDs {
		if _, err := tx.Exec(ctx, `
			INSERT INTO task_assignments (task_id, user_id)
			VALUES ($1::uuid, $2::uuid)
		`, task.ID, assigneeID); err != nil {
			return nil, fmt.Errorf("failed to create task assignment: %w", err)
		}
	}
	task.AssigneeIDs = req.AssigneeIDs

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit task creation: %w", err)
	}

	return task, nil
}

// GetProjectTaskByID returns a single task by id.
func (r *ProjectRepository) GetProjectTaskByID(ctx context.Context, taskID string) (*domain.ProjectTask, error) {
	t := &domain.ProjectTask{}
	err := r.db.QueryRow(ctx, `
		SELECT
			id::text,
			project_id::text,
			title,
			description,
			budget_needed,
			COALESCE(
				ARRAY(
					SELECT ta.user_id::text
					FROM task_assignments ta
					WHERE ta.task_id = tasks.id
					ORDER BY ta.assigned_at ASC
				),
				ARRAY[]::text[]
			),
			status,
			priority,
			due_date,
			created_at
		FROM tasks
		WHERE id = $1::uuid
	`, taskID).Scan(
		&t.ID,
		&t.ProjectID,
		&t.Title,
		&t.Description,
		&t.BudgetNeeded,
		&t.AssigneeIDs,
		&t.Status,
		&t.Priority,
		&t.DueDate,
		&t.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get project task: %w", err)
	}

	return t, nil
}

// GetProjectTasks returns persisted tasks under a project with assignee IDs.
func (r *ProjectRepository) GetProjectTasks(ctx context.Context, projectID string) ([]*domain.ProjectTask, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			t.id::text,
			t.project_id::text,
			t.title,
			t.description,
			t.budget_needed,
			COALESCE(
				ARRAY(
					SELECT ta.user_id::text
					FROM task_assignments ta
					WHERE ta.task_id = t.id
					ORDER BY ta.assigned_at ASC
				),
				ARRAY[]::text[]
			),
			t.status,
			t.priority,
			t.due_date,
			t.created_at
		FROM tasks t
		WHERE t.project_id = $1::uuid
		ORDER BY t.created_at DESC
	`, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to query project tasks: %w", err)
	}
	defer rows.Close()

	tasks := make([]*domain.ProjectTask, 0)
	for rows.Next() {
		t := &domain.ProjectTask{}
		if err := rows.Scan(
			&t.ID,
			&t.ProjectID,
			&t.Title,
			&t.Description,
			&t.BudgetNeeded,
			&t.AssigneeIDs,
			&t.Status,
			&t.Priority,
			&t.DueDate,
			&t.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan project task: %w", err)
		}
		tasks = append(tasks, t)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return tasks, nil
}

// UpdateProjectTaskStatus updates lifecycle status for a project task.
func (r *ProjectRepository) UpdateProjectTaskStatus(ctx context.Context, taskID string, status string) error {
	result, err := r.db.Exec(ctx, `
		UPDATE tasks
		SET status = $2::task_status,
			completed_at = CASE WHEN $2::task_status = 'completed'::task_status THEN NOW() ELSE NULL END,
			updated_at = NOW()
		WHERE id = $1::uuid
	`, taskID, status)
	if err != nil {
		return fmt.Errorf("failed to update project task status: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("task not found")
	}

	return nil
}

// DeleteProjectTask removes a persisted task by id.
func (r *ProjectRepository) DeleteProjectTask(ctx context.Context, taskID string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var taskExists bool
	if err := tx.QueryRow(ctx, `
		SELECT TRUE
		FROM tasks
		WHERE id = $1::uuid
		FOR UPDATE
	`, taskID).Scan(&taskExists); err != nil {
		return fmt.Errorf("task not found")
	}

	result, err := tx.Exec(ctx, `DELETE FROM tasks WHERE id = $1::uuid`, taskID)
	if err != nil {
		return fmt.Errorf("failed to delete project task: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("task not found")
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit task deletion: %w", err)
	}

	return nil
}

// GetStaffProjectTaskSummaries returns project summaries visible to a staff member.
func (r *ProjectRepository) GetStaffProjectTaskSummaries(ctx context.Context, staffID string) ([]*domain.StaffTaskProjectSummary, error) {
	query := `
		SELECT
			p.id::text,
			p.project_name,
			COALESCE(d.department_name, ''),
			p.status,
			psa.assigned_at,
			p.end_date,
			p.budget_allocated,
			p.progress_percentage,
			p.project_description,
			COALESCE(ts.total_tasks, 0),
			COALESCE(ts.completed_tasks, 0),
			COALESCE(ts.ongoing_tasks, 0),
			COALESCE(ts.not_started_tasks, 0),
			COALESCE(ts.cancelled_tasks, 0)
		FROM project_staff_assignments psa
		JOIN projects p ON p.id = psa.project_id
		LEFT JOIN departments d ON d.id = p.department_id
		LEFT JOIN LATERAL (
			SELECT
				COUNT(*) AS total_tasks,
				COUNT(*) FILTER (WHERE t.status = 'completed') AS completed_tasks,
				COUNT(*) FILTER (WHERE t.status = 'in_progress') AS ongoing_tasks,
				COUNT(*) FILTER (WHERE t.status = 'pending') AS not_started_tasks,
				COUNT(*) FILTER (WHERE t.status = 'cancelled') AS cancelled_tasks
			FROM tasks t
			WHERE t.project_id = p.id
			  AND (
				t.assigned_to = $1::uuid
				OR EXISTS (
					SELECT 1 FROM task_assignments ta
					WHERE ta.task_id = t.id AND ta.user_id = $1::uuid
				)
			  )
		) ts ON TRUE
		WHERE psa.staff_id = $1::uuid
		ORDER BY psa.assigned_at DESC, p.created_at DESC
	`

	rows, err := r.db.Query(ctx, query, staffID)
	if err != nil {
		return nil, fmt.Errorf("failed to query staff project summaries: %w", err)
	}
	defer rows.Close()

	summaries := make([]*domain.StaffTaskProjectSummary, 0)
	for rows.Next() {
		s := &domain.StaffTaskProjectSummary{}
		err := rows.Scan(
			&s.ProjectID,
			&s.ProjectName,
			&s.DepartmentName,
			&s.Status,
			&s.DateAssigned,
			&s.Deadline,
			&s.BudgetAllocated,
			&s.Progress,
			&s.Description,
			&s.TotalTasks,
			&s.CompletedTasks,
			&s.OngoingTasks,
			&s.NotStartedTasks,
			&s.CancelledTasks,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan staff project summary: %w", err)
		}
		summaries = append(summaries, s)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return summaries, nil
}

// GetStaffTasks returns tasks assigned to a staff member, optionally scoped to a project.
func (r *ProjectRepository) GetStaffTasks(ctx context.Context, staffID string, projectID string) ([]*domain.StaffTask, error) {
	query := `
		SELECT
			t.id::text,
			t.title,
			t.description,
			t.project_id::text,
			p.project_name,
			t.budget_needed,
			t.created_at,
			t.due_date,
			t.status,
			t.priority
		FROM tasks t
		JOIN projects p ON p.id = t.project_id
		JOIN project_staff_assignments psa ON psa.project_id = p.id
		WHERE psa.staff_id = $1::uuid
		  AND (
			t.assigned_to = $1::uuid
			OR EXISTS (
				SELECT 1 FROM task_assignments ta
				WHERE ta.task_id = t.id AND ta.user_id = $1::uuid
			)
		  )
		  AND (NULLIF($2, '') IS NULL OR t.project_id = NULLIF($2, '')::uuid)
		ORDER BY t.created_at DESC
	`

	rows, err := r.db.Query(ctx, query, staffID, projectID)
	if err != nil {
		return nil, fmt.Errorf("failed to query staff tasks: %w", err)
	}
	defer rows.Close()

	tasks := make([]*domain.StaffTask, 0)
	for rows.Next() {
		t := &domain.StaffTask{}
		err := rows.Scan(
			&t.ID,
			&t.Title,
			&t.Description,
			&t.ProjectID,
			&t.ProjectName,
			&t.BudgetNeeded,
			&t.DateGiven,
			&t.Deadline,
			&t.Status,
			&t.Priority,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan staff task: %w", err)
		}
		tasks = append(tasks, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return tasks, nil
}

// UpdateStaffTaskStatus updates status for a task assigned to the given staff member.
func (r *ProjectRepository) UpdateStaffTaskStatus(ctx context.Context, taskID string, staffID string, status string) error {
	query := `
		UPDATE tasks t
		SET status = $3::task_status,
			completed_at = CASE WHEN $3::task_status = 'completed'::task_status THEN NOW() ELSE NULL END,
			updated_at = NOW()
		WHERE t.id = $1::uuid
		  AND EXISTS (
			SELECT 1
			FROM projects p
			JOIN project_staff_assignments psa ON psa.project_id = p.id
			WHERE p.id = t.project_id
			  AND psa.staff_id = $2::uuid
		  )
		  AND (
			t.assigned_to = $2::uuid
			OR EXISTS (
				SELECT 1 FROM task_assignments ta
				WHERE ta.task_id = t.id AND ta.user_id = $2::uuid
			)
		  )
		  AND (
			t.status = $3::task_status
			OR (t.status = 'pending'::task_status AND $3::task_status IN ('in_progress'::task_status, 'cancelled'::task_status))
			OR (t.status = 'in_progress'::task_status AND $3::task_status IN ('completed'::task_status, 'cancelled'::task_status))
			OR (t.status = 'completed'::task_status AND $3::task_status IN ('in_progress'::task_status, 'cancelled'::task_status))
			OR (t.status = 'cancelled'::task_status AND $3::task_status IN ('in_progress'::task_status, 'completed'::task_status))
		  )
	`

	result, err := r.db.Exec(ctx, query, taskID, staffID, status)
	if err != nil {
		return fmt.Errorf("failed to update task status: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("task not found or not assigned to staff")
	}

	return nil
}
