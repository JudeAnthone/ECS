package domain

import "time"

// ProjectRequest represents a public user's extension service request
type ProjectRequest struct {
	ID                    string   `json:"id" db:"id"`
	RequestTitle          string   `json:"request_title" db:"request_title"`
	RequestDescription    string   `json:"request_description" db:"request_description"`
	RequestedBy           string   `json:"requested_by" db:"requested_by"`
	RequestedDepartment   *string  `json:"requested_department" db:"requested_department"`
	RequestedDepartmentID *string  `json:"requested_department_id" db:"requested_department_id"`
	EstimatedBudget       *float64 `json:"estimated_budget" db:"estimated_budget"`
	TargetBeneficiaries   *string  `json:"target_beneficiaries" db:"target_beneficiaries"`
	Justification         *string  `json:"justification" db:"justification"`
	Status                string   `json:"status" db:"status"`

	// Program Chair review
	ReviewedBy           *string    `json:"reviewed_by" db:"reviewed_by"`
	ReviewedAt           *time.Time `json:"reviewed_at" db:"reviewed_at"`
	ReviewNotes          *string    `json:"review_notes" db:"review_notes"`
	AssignedProgramID    *string    `json:"assigned_program_id" db:"assigned_program_id"`
	ProgramChairFeedback *string    `json:"program_chair_feedback" db:"program_chair_feedback"`
	FeedbackProvidedDate *time.Time `json:"feedback_provided_date" db:"feedback_provided_date"`

	// Department / Project Head assignment
	AssignedDepartmentID     *string    `json:"assigned_department_id" db:"assigned_department_id"`
	AssignedToProjectHead    *string    `json:"assigned_to_project_head" db:"assigned_to_project_head"`
	DepartmentAssignmentDate *time.Time `json:"department_assignment_date" db:"department_assignment_date"`
	AssignmentNotes          *string    `json:"assignment_notes" db:"assignment_notes"`

	// Project Head response
	ProjectHeadResponse     *string    `json:"project_head_response" db:"project_head_response"`
	ProjectHeadResponseDate *time.Time `json:"project_head_response_date" db:"project_head_response_date"`
	ProjectHeadNotes        *string    `json:"project_head_notes" db:"project_head_notes"`

	// Proposal tracking
	ProposalDocumentURL   *string    `json:"proposal_document_url" db:"proposal_document_url"`
	ProposalSubmittedDate *time.Time `json:"proposal_submitted_date" db:"proposal_submitted_date"`
	ProposalReviewedBy    *string    `json:"proposal_reviewed_by" db:"proposal_reviewed_by"`
	ProposalReviewDate    *time.Time `json:"proposal_review_date" db:"proposal_review_date"`
	ProposalReviewNotes   *string    `json:"proposal_review_notes" db:"proposal_review_notes"`

	// Workflow
	WorkflowStage string `json:"workflow_stage" db:"workflow_stage"`

	// Final Admin approval
	FinalApprovedBy    *string    `json:"final_approved_by" db:"final_approved_by"`
	FinalApprovalDate  *time.Time `json:"final_approval_date" db:"final_approval_date"`
	FinalApprovalNotes *string    `json:"final_approval_notes" db:"final_approval_notes"`

	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// --- Request bodies ---

type SubmitRequestInput struct {
	RequestTitle          string   `json:"request_title" validate:"required,min=3,max=200"`
	RequestDescription    string   `json:"request_description" validate:"required,min=10,max=2000"`
	RequestedDepartment   *string  `json:"requested_department"`
	RequestedDepartmentID *string  `json:"requested_department_id"`
	EstimatedBudget       *float64 `json:"estimated_budget"`
	TargetBeneficiaries   *string  `json:"target_beneficiaries"`
	Justification         *string  `json:"justification"`
}

type RerouteRequestInput struct {
	TargetDepartmentID string `json:"target_department_id" validate:"required"`
}

type ProgramChairReviewInput struct {
	Status               string  `json:"status" validate:"required,oneof=approved rejected"`
	ReviewNotes          *string `json:"review_notes"`
	AssignedProgramID    *string `json:"assigned_program_id"`
	ProgramChairFeedback *string `json:"program_chair_feedback"`
}

type AssignToHeadInput struct {
	AssignedDepartmentID  string  `json:"assigned_department_id" validate:"required"`
	AssignedToProjectHead *string `json:"assigned_to_project_head"` // optional — kept for future use
	AssignmentNotes       *string `json:"assignment_notes"`
}

type ProjectHeadRespondInput struct {
	Response         string  `json:"response" validate:"required,oneof=accepted declined"`
	ProjectHeadNotes *string `json:"project_head_notes"`
}

type SubmitProposalInput struct {
	ProposalDocumentURL string `json:"proposal_document_url" validate:"required"`
}

type FinalApprovalInput struct {
	Status             string  `json:"status" validate:"required,oneof=approved rejected"`
	FinalApprovalNotes *string `json:"final_approval_notes"`
}
