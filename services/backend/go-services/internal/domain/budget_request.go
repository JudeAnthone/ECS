package domain

import "time"

// BudgetRequest represents a budget request made by a project head to a program chair/admin
type BudgetRequest struct {
	ID                                     string     `json:"id" db:"id"`
	ProjectID                              string     `json:"project_id" db:"project_id"`
	ProjectName                            string     `json:"project_name" db:"project_name"`
	DepartmentID                           string     `json:"department_id" db:"department_id"`
	DepartmentName                         string     `json:"department_name" db:"department_name"`
	DepartmentAllocatedBudget              float64    `json:"department_allocated_budget" db:"department_allocated_budget"`
	DepartmentSpentBudget                  float64    `json:"department_spent_budget" db:"department_spent_budget"`
	DepartmentRemainingBudget              float64    `json:"department_remaining_budget" db:"department_remaining_budget"`
	ApprovedAgainstChairDepartmentBudgetID string     `json:"approved_against_chair_department_budget_id" db:"approved_against_chair_department_budget_id"`
	RequestedBy                            string     `json:"requested_by" db:"requested_by"`
	RequestedByName                        string     `json:"requested_by_name" db:"requested_by_name"`
	Amount                                 float64    `json:"amount" db:"amount"`
	Reason                                 string     `json:"reason" db:"reason"`
	NeededByDate                           *time.Time `json:"needed_by_date,omitempty" db:"needed_by_date"`
	Status                                 string     `json:"status" db:"status"`
	WorkflowStage                          string     `json:"workflow_stage" db:"workflow_stage"`
	DocumentURL                            string     `json:"document_url" db:"document_url"`
	DocumentName                           string     `json:"document_name" db:"document_name"`
	ReviewedBy                             string     `json:"reviewed_by" db:"reviewed_by"`
	ReviewedByName                         string     `json:"reviewed_by_name" db:"reviewed_by_name"`
	ReviewNotes                            string     `json:"review_notes" db:"review_notes"`
	ReviewedAt                             *time.Time `json:"reviewed_at,omitempty" db:"reviewed_at"`
	ChairSlipNumber                        string     `json:"chair_slip_number" db:"chair_slip_number"`
	ChairSlipGeneratedAt                   *time.Time `json:"chair_slip_generated_at,omitempty" db:"chair_slip_generated_at"`
	CreatedAt                              time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt                              time.Time  `json:"updated_at" db:"updated_at"`
}

type BudgetSupportDocument struct {
	ID             string    `json:"id" db:"id"`
	ProjectID      string    `json:"project_id" db:"project_id"`
	ProjectName    string    `json:"project_name" db:"project_name"`
	DocumentType   string    `json:"document_type" db:"document_type"`
	Title          string    `json:"title" db:"title"`
	FileURL        string    `json:"file_url" db:"file_url"`
	UploadedByName string    `json:"uploaded_by_name" db:"uploaded_by_name"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
}
