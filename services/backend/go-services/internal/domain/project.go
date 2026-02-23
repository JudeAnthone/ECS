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
	Objectives         *string    `json:"objectives" db:"objectives"`
	BudgetAllocated    *float64   `json:"budget_allocated" db:"budget_allocated"`
	BudgetUsed         *float64   `json:"budget_used" db:"budget_used"`
	StartDate          *time.Time `json:"start_date" db:"start_date"`
	EndDate            *time.Time `json:"end_date" db:"end_date"`
	ProgressPercentage int        `json:"progress_percentage" db:"progress_percentage"`
	Status             string     `json:"status" db:"status"`
	ApprovalStatus     string     `json:"approval_status" db:"approval_status"`
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
