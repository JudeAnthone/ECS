package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RequestRepository struct {
	db *pgxpool.Pool
}

func NewRequestRepository(db *pgxpool.Pool) *RequestRepository {
	return &RequestRepository{db: db}
}

// scanner is satisfied by both pgx.Row and pgx.Rows.
type scanner interface {
	Scan(dest ...any) error
}

// scanRequest scans a full project_requests row into a ProjectRequest struct.
func scanRequest(row scanner) (*domain.ProjectRequest, error) {
	r := &domain.ProjectRequest{}
	err := row.Scan(
		&r.ID,
		&r.RequestTitle,
		&r.RequestDescription,
		&r.RequestedBy,
		&r.RequestedDepartment,
		&r.RequestedDepartmentID,
		&r.EstimatedBudget,
		&r.TargetBeneficiaries,
		&r.Justification,
		&r.Status,

		&r.ReviewedBy,
		&r.ReviewedAt,
		&r.ReviewNotes,
		&r.AssignedProgramID,
		&r.ProgramChairFeedback,
		&r.FeedbackProvidedDate,

		&r.AssignedDepartmentID,
		&r.AssignedToProjectHead,
		&r.DepartmentAssignmentDate,
		&r.AssignmentNotes,

		&r.ProjectHeadResponse,
		&r.ProjectHeadResponseDate,
		&r.ProjectHeadNotes,

		&r.ProposalDocumentURL,
		&r.ProposalSubmittedDate,
		&r.ProposalReviewedBy,
		&r.ProposalReviewDate,
		&r.ProposalReviewNotes,

		&r.WorkflowStage,

		&r.FinalApprovedBy,
		&r.FinalApprovalDate,
		&r.FinalApprovalNotes,

		&r.CreatedAt,
		&r.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return r, nil
}

const selectAllCols = `
	SELECT
		id, request_title, request_description, requested_by,
		requested_department, requested_department_id, estimated_budget, target_beneficiaries, justification, status,
		reviewed_by, reviewed_at, review_notes, assigned_program_id,
		program_chair_feedback, feedback_provided_date,
		assigned_department_id, assigned_to_project_head, department_assignment_date, assignment_notes,
		project_head_response, project_head_response_date, project_head_notes,
		proposal_document_url, proposal_submitted_date, proposal_reviewed_by,
		proposal_review_date, proposal_review_notes,
		workflow_stage,
		final_approved_by, final_approval_date, final_approval_notes,
		created_at, updated_at
	FROM project_requests
`

// Create inserts a new project request submitted by a public user.
func (r *RequestRepository) Create(ctx context.Context, req *domain.ProjectRequest) error {
	query := `
		INSERT INTO project_requests (
			request_title, request_description, requested_by,
			requested_department, requested_department_id,
			estimated_budget, target_beneficiaries, justification,
			status, workflow_stage
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'submitted')
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query,
		req.RequestTitle,
		req.RequestDescription,
		req.RequestedBy,
		req.RequestedDepartment,
		req.RequestedDepartmentID,
		req.EstimatedBudget,
		req.TargetBeneficiaries,
		req.Justification,
	).Scan(&req.ID, &req.CreatedAt, &req.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	return nil
}

// GetByID retrieves a single request by its UUID.
func (r *RequestRepository) GetByID(ctx context.Context, id string) (*domain.ProjectRequest, error) {
	query := selectAllCols + " WHERE id = $1"
	req, err := scanRequest(r.db.QueryRow(ctx, query, id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("request not found")
		}
		return nil, fmt.Errorf("failed to get request: %w", err)
	}
	return req, nil
}

func (r *RequestRepository) getMany(ctx context.Context, query string, args ...any) ([]*domain.ProjectRequest, error) {
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	var result []*domain.ProjectRequest
	for rows.Next() {
		req, err := scanRequest(rows)
		if err != nil {
			return nil, fmt.Errorf("scan failed: %w", err)
		}
		result = append(result, req)
	}
	return result, rows.Err()
}

// GetAll returns every request in the system (admin view).
func (r *RequestRepository) GetAll(ctx context.Context) ([]*domain.ProjectRequest, error) {
	return r.getMany(ctx, selectAllCols+" ORDER BY created_at DESC")
}

// GetByRequestedBy returns all requests submitted by a particular user.
func (r *RequestRepository) GetByRequestedBy(ctx context.Context, userID string) ([]*domain.ProjectRequest, error) {
	return r.getMany(ctx, selectAllCols+" WHERE requested_by = $1 ORDER BY created_at DESC", userID)
}

// GetByAssignedProjectHead returns all requests assigned to a project head.
func (r *RequestRepository) GetByAssignedProjectHead(ctx context.Context, headID string) ([]*domain.ProjectRequest, error) {
	return r.getMany(ctx, selectAllCols+" WHERE assigned_to_project_head = $1 ORDER BY created_at DESC", headID)
}

// GetByAssignedProgram returns all requests routed through a program.
func (r *RequestRepository) GetByAssignedProgram(ctx context.Context, programID string) ([]*domain.ProjectRequest, error) {
	return r.getMany(ctx, selectAllCols+" WHERE assigned_program_id = $1 ORDER BY created_at DESC", programID)
}

// ProgramChairReview — program chair submits an initial review (approve/reject/feedback).
func (r *RequestRepository) ProgramChairReview(ctx context.Context, id, reviewerID string, input *domain.ProgramChairReviewInput) error {
	now := time.Now()

	stage := "under_program_chair_review"
	status := "pending"
	if input.Status == "rejected" {
		stage = "rejected"
		status = "rejected"
	} else if input.Status == "approved" {
		stage = "under_program_chair_review"
		status = "approved"
	} else if input.ProgramChairFeedback != nil && *input.ProgramChairFeedback != "" {
		stage = "feedback_provided"
	}

	query := `
		UPDATE project_requests SET
			reviewed_by              = $2,
			reviewed_at              = $3,
			review_notes             = $4,
			assigned_program_id      = $5,
			program_chair_feedback   = $6,
			feedback_provided_date   = $7,
			workflow_stage           = $8,
			status                   = $9,
			updated_at               = $3
		WHERE id = $1
	`
	var feedbackDate *time.Time
	if stage == "feedback_provided" {
		feedbackDate = &now
	}
	_, err := r.db.Exec(ctx, query,
		id, reviewerID, now,
		input.ReviewNotes,
		input.AssignedProgramID,
		input.ProgramChairFeedback,
		feedbackDate,
		stage, status,
	)
	if err != nil {
		return fmt.Errorf("program chair review failed: %w", err)
	}
	return nil
}

// AssignToHead — program chair assigns request to a department (project head optional).
func (r *RequestRepository) AssignToHead(ctx context.Context, id string, input *domain.AssignToHeadInput) error {
	now := time.Now()
	query := `
		UPDATE project_requests SET
			assigned_department_id    = $2,
			assigned_to_project_head  = $3,
			department_assignment_date = $4,
			assignment_notes          = $5,
			workflow_stage            = 'assigned_to_department',
			updated_at                = $4
		WHERE id = $1
	`
	_, err := r.db.Exec(ctx, query,
		id,
		input.AssignedDepartmentID,
		input.AssignedToProjectHead, // *string — may be nil
		now,
		input.AssignmentNotes,
	)
	if err != nil {
		return fmt.Errorf("assign to head failed: %w", err)
	}
	return nil
}

// ProjectHeadRespond — project head accepts or declines the request.
func (r *RequestRepository) ProjectHeadRespond(ctx context.Context, id string, input *domain.ProjectHeadRespondInput) error {
	now := time.Now()
	stage := "project_head_accepted"
	if input.Response == "declined" {
		stage = "project_head_declined"
	}
	query := `
		UPDATE project_requests SET
			project_head_response      = $2,
			project_head_response_date = $3,
			project_head_notes         = $4,
			workflow_stage             = $5,
			updated_at                 = $3
		WHERE id = $1
	`
	_, err := r.db.Exec(ctx, query,
		id, input.Response, now, input.ProjectHeadNotes, stage,
	)
	if err != nil {
		return fmt.Errorf("project head respond failed: %w", err)
	}
	return nil
}

// SubmitProposal — project head uploads proposal document.
func (r *RequestRepository) SubmitProposal(ctx context.Context, id string, input *domain.SubmitProposalInput) error {
	now := time.Now()
	query := `
		UPDATE project_requests SET
			proposal_document_url  = $2,
			proposal_submitted_date = $3,
			workflow_stage         = 'proposal_submitted',
			updated_at             = $3
		WHERE id = $1
	`
	_, err := r.db.Exec(ctx, query, id, input.ProposalDocumentURL, now)
	if err != nil {
		return fmt.Errorf("submit proposal failed: %w", err)
	}
	return nil
}

// ReviewProposal — admin/chair reviews the submitted proposal.
func (r *RequestRepository) ReviewProposal(ctx context.Context, id, reviewerID string, notes *string, approved bool) error {
	now := time.Now()
	stage := "pending_final_approval"
	if !approved {
		stage = "proposal_changes_requested"
	}
	query := `
		UPDATE project_requests SET
			proposal_reviewed_by  = $2,
			proposal_review_date  = $3,
			proposal_review_notes = $4,
			workflow_stage        = $5,
			updated_at            = $3
		WHERE id = $1
	`
	_, err := r.db.Exec(ctx, query, id, reviewerID, now, notes, stage)
	if err != nil {
		return fmt.Errorf("review proposal failed: %w", err)
	}
	return nil
}

// FinalApprove — admin gives final approval or rejects the request.
func (r *RequestRepository) FinalApprove(ctx context.Context, id, approverID string, input *domain.FinalApprovalInput) error {
	now := time.Now()
	stage := "approved"
	status := "approved"
	if input.Status == "rejected" {
		stage = "rejected"
		status = "rejected"
	}
	query := `
		UPDATE project_requests SET
			final_approved_by    = $2,
			final_approval_date  = $3,
			final_approval_notes = $4,
			workflow_stage       = $5,
			status               = $6,
			updated_at           = $3
		WHERE id = $1
	`
	_, err := r.db.Exec(ctx, query,
		id, approverID, now, input.FinalApprovalNotes, stage, status,
	)
	if err != nil {
		return fmt.Errorf("final approve failed: %w", err)
	}
	return nil
}

// Delete removes a project request by ID.
func (r *RequestRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM project_requests WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete request: %w", err)
	}
	return nil
}

// GetByDepartmentChair returns all requests whose requested_department_id belongs
// to a department managed by the given program chair.
func (r *RequestRepository) GetByDepartmentChair(ctx context.Context, chairID string) ([]*domain.ProjectRequest, error) {
	query := selectAllCols + `
		WHERE (
			requested_department_id IN (
				SELECT id FROM departments WHERE program_chair_id = $1
			)
			OR (
				requested_department_id IS NULL
				AND requested_department IS NOT NULL
				AND EXISTS (
					SELECT 1
					FROM departments d
					WHERE d.program_chair_id = $1
					  AND (
						LOWER(TRIM(requested_department)) = LOWER(TRIM(d.department_name))
						OR LOWER(TRIM(requested_department)) = LOWER(TRIM(d.department_code))
					  )
				)
			)
		)
		ORDER BY created_at DESC
	`
	return r.getMany(ctx, query, chairID)
}

// GetForProjectHead returns requests assigned to the department that the given
// project-head user belongs to.  The user.department field (text) is matched
// against department_code or department_name in the departments table.
func (r *RequestRepository) GetForProjectHead(ctx context.Context, headUserID string) ([]*domain.ProjectRequest, error) {
	query := selectAllCols + `
		WHERE assigned_department_id IN (
			SELECT d.id
			FROM departments d
			JOIN users u ON (
				LOWER(u.department) = LOWER(d.department_code)
				OR LOWER(u.department) = LOWER(d.department_name)
			)
			WHERE u.id = $1
		)
		ORDER BY created_at DESC
	`
	return r.getMany(ctx, query, headUserID)
}

// RerouteRequest changes the requested_department_id of a request to a new department,
// allowing program chairs to redirect misdirected requests.
func (r *RequestRepository) RerouteRequest(ctx context.Context, requestID, departmentID string) error {
	_, err := r.db.Exec(ctx, `
		UPDATE project_requests
		SET requested_department_id = $2, updated_at = NOW()
		WHERE id = $1
	`, requestID, departmentID)
	if err != nil {
		return fmt.Errorf("failed to reroute request: %w", err)
	}
	return nil
}
