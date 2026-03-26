package domain

import "time"

// Project represents a project within a program
type Project struct {
	ID                 string     `json:"id" db:"id"`
	ProjectName        string     `json:"project_name" db:"project_name"`
	ProjectDescription *string    `json:"project_description" db:"project_description"`
	ProgramID          *string    `json:"program_id" db:"program_id"`
	DepartmentID       *string    `json:"department_id" db:"department_id"`
	ProjectHeadID      *string    `json:"project_head_id" db:"project_head_id"`
	CreationSource     string     `json:"creation_source" db:"creation_source"`
	RequestID          *string    `json:"request_id" db:"request_id"`
	CreatedBy          string     `json:"created_by" db:"created_by"`
	CreatedByRole      *string    `json:"created_by_role" db:"created_by_role"`
	CreatedByFirstName *string    `json:"created_by_first_name" db:"created_by_first_name"`
	CreatedByLastName  *string    `json:"created_by_last_name" db:"created_by_last_name"`
	UpdatedBy          *string    `json:"updated_by" db:"updated_by"`
	Objectives         *string    `json:"objectives" db:"objectives"`
	BudgetAllocated    *float64   `json:"budget_allocated" db:"budget_allocated"`
	BudgetUsed         *float64   `json:"budget_used" db:"budget_used"`
	StartDate          *time.Time `json:"start_date" db:"start_date"`
	EndDate            *time.Time `json:"end_date" db:"end_date"`
	ProgressPercentage int        `json:"progress_percentage" db:"progress_percentage"`
	Status             string     `json:"status" db:"status"`
	ApprovalStatus     string     `json:"approval_status" db:"approval_status"`
	Feedback           *string    `json:"feedback,omitempty" db:"feedback"`
	StaffOriginated    bool       `json:"staff_originated" db:"staff_originated"`
	IsPublished        bool       `json:"is_published" db:"is_published"`
	CreatedAt          time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at" db:"updated_at"`
}

// CreateProjectRequest represents the request to create a new project
type CreateProjectRequest struct {
	ProjectName        string   `json:"project_name" validate:"required,min=3,max=200"`
	ProjectDescription *string  `json:"project_description"`
	ProgramID          *string  `json:"program_id"`
	DepartmentID       *string  `json:"department_id"`
	ProjectHeadID      *string  `json:"project_head_id"`                    // NEW
	Objectives         *string  `json:"objectives"`
	BudgetAllocated    *float64 `json:"budget_allocated"`
	StartDate          *string  `json:"start_date"`
	EndDate            *string  `json:"end_date"`
	Status             string   `json:"status"`
	ApprovalStatus     string   `json:"approval_status"`
}

// UpdateProjectRequest represents the request to update an existing project
type UpdateProjectRequest struct {
	ProjectName        string   `json:"project_name"`
	ProjectDescription *string  `json:"project_description"`
	Objectives         *string  `json:"objectives"`
	BudgetAllocated    *float64 `json:"budget_allocated"`
	StartDate          *string  `json:"start_date"`
	EndDate            *string  `json:"end_date"`
	Status             string   `json:"status"`
}

// UpdateProjectApprovalRequest represents approval action on a pending project
type UpdateProjectApprovalRequest struct {
	ApprovalStatus string  `json:"approval_status" validate:"required,oneof=approved rejected"`
	ReviewNotes    *string `json:"review_notes"`
}

// BulkUpdateProjectApprovalRequest represents bulk approval action for pending projects.
type BulkUpdateProjectApprovalRequest struct {
	ProjectIDs     []string `json:"project_ids" validate:"required,min=1,dive,required"`
	ApprovalStatus string   `json:"approval_status" validate:"required,oneof=approved rejected"`
	ReviewNotes    *string  `json:"review_notes"`
}

// ProjectHeadPreReviewRequest captures project head's pre-approval decision
// for staff-originated project requests.
type ProjectHeadPreReviewRequest struct {
	Decision    string  `json:"decision" validate:"required,oneof=approved rejected"`
	ReviewNotes *string `json:"review_notes"`
}

// ReplaceProjectStaffAssignmentsRequest replaces staff assignments for a project.
type ReplaceProjectStaffAssignmentsRequest struct {
	StaffIDs []string `json:"staff_ids"`
}

// ProjectStaffAssignments represents persisted project staff assignment state.
type ProjectStaffAssignments struct {
	ProjectID string   `json:"project_id"`
	StaffIDs  []string `json:"staff_ids"`
}
