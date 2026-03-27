package domain

import "time"

// Program represents an extension service program in the system
type Program struct {
	ID                  string     `json:"id" db:"id"`
	ProgramName         string     `json:"program_name" db:"program_name"`
	ProgramDescription  *string    `json:"program_description" db:"program_description"`
	ProgramCategory     *string    `json:"program_category" db:"program_category"`
	DepartmentID        *string    `json:"department_id" db:"department_id"`
	ProgramChairID      *string    `json:"program_chair_id" db:"program_chair_id"`
	Objectives          *string    `json:"objectives" db:"objectives"`
	TargetBeneficiaries *string    `json:"target_beneficiaries" db:"target_beneficiaries"`
	BudgetAllocation    *float64   `json:"budget_allocation" db:"budget_allocation"`
	SpentBudget         float64    `json:"spent_budget" db:"spent_budget"`
	StartDate           *time.Time `json:"start_date" db:"start_date"`
	EndDate             *time.Time `json:"end_date" db:"end_date"`
	Status              string     `json:"status" db:"status"`                   // draft, active, completed, cancelled
	ApprovalStatus      string     `json:"approval_status" db:"approval_status"` // pending, approved, rejected
	ApprovedBy          *string    `json:"approved_by" db:"approved_by"`
	ApprovedAt          *time.Time `json:"approved_at" db:"approved_at"`
	CreatedAt           time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at" db:"updated_at"`
}

// CreateProgramRequest represents the request to create a new program
type CreateProgramRequest struct {
	ProgramName         string  `json:"program_name" validate:"required,min=3,max=200"`
	ProgramDescription  *string `json:"program_description" validate:"omitempty,max=1000"`
	ProgramCategory     *string `json:"program_category" validate:"omitempty,max=100"`
	DepartmentID        *string `json:"department_id"`
	ProgramChairID      *string `json:"program_chair_id"`
	Objectives          *string `json:"objectives" validate:"omitempty,max=2000"`
	TargetBeneficiaries *string `json:"target_beneficiaries" validate:"omitempty,max=500"`
	StartDate           *string `json:"start_date"` // Format: YYYY-MM-DD
	EndDate             *string `json:"end_date"`   // Format: YYYY-MM-DD
}

// UpdateProgramRequest represents the request to update a program
type UpdateProgramRequest struct {
	ProgramName         *string  `json:"program_name" validate:"omitempty,min=3,max=200"`
	ProgramDescription  *string  `json:"program_description" validate:"omitempty,max=1000"`
	ProgramCategory     *string  `json:"program_category" validate:"omitempty,max=100"`
	DepartmentID        *string  `json:"department_id"`
	ProgramChairID      *string  `json:"program_chair_id"`
	Objectives          *string  `json:"objectives" validate:"omitempty,max=2000"`
	TargetBeneficiaries *string  `json:"target_beneficiaries" validate:"omitempty,max=500"`
	StartDate           *string  `json:"start_date"`
	EndDate             *string  `json:"end_date"`
	Status              *string  `json:"status" validate:"omitempty,oneof=draft active completed cancelled"`
	BudgetAllocation    *float64 `json:"budget_allocation,omitempty"`
}

// UpdateProgramApprovalRequest represents the request to approve/reject a program
type UpdateProgramApprovalRequest struct {
	ApprovalStatus string  `json:"approval_status" validate:"required,oneof=approved rejected"`
	ReviewNotes    *string `json:"review_notes" validate:"omitempty,max=1000"`
}
