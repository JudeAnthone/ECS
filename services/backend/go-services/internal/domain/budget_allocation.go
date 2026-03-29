package domain

import "time"

// ProgramChairBudget stores the annual budget cap allocated by admin to a chair.
type ProgramChairBudget struct {
	ID              string    `json:"id" db:"id"`
	ChairID         string    `json:"chair_id" db:"chair_id"`
	ChairFirstName  string    `json:"chair_first_name,omitempty" db:"chair_first_name"`
	ChairLastName   string    `json:"chair_last_name,omitempty" db:"chair_last_name"`
	AllocatedBudget float64   `json:"allocated_budget" db:"allocated_budget"`
	SpentBudget     float64   `json:"spent_budget" db:"spent_budget"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

// ChairDepartmentBudget stores a chair-specific allocation for a department.
type ChairDepartmentBudget struct {
	ID              string    `json:"id" db:"id"`
	ChairID         string    `json:"chair_id" db:"chair_id"`
	ChairFirstName  string    `json:"chair_first_name,omitempty" db:"chair_first_name"`
	ChairLastName   string    `json:"chair_last_name,omitempty" db:"chair_last_name"`
	DepartmentID    string    `json:"department_id" db:"department_id"`
	DepartmentName  string    `json:"department_name,omitempty" db:"department_name"`
	AllocatedBudget float64   `json:"allocated_budget" db:"allocated_budget"`
	SpentBudget     float64   `json:"spent_budget" db:"spent_budget"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}
