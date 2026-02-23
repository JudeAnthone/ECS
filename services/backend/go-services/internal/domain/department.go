package domain

import "time"

// Department represents a college/department in the system
type Department struct {
	ID               string    `json:"id" db:"id"`
	DepartmentName   string    `json:"department_name" db:"department_name"`
	DepartmentCode   string    `json:"department_code" db:"department_code"`
	ProgramChairID   *string   `json:"program_chair_id" db:"program_chair_id"`
	BudgetAllocation float64   `json:"budget_allocation" db:"budget_allocation"`
	SpentBudget      float64   `json:"spent_budget" db:"spent_budget"`
	Description      *string   `json:"description" db:"description"`
	IsActive         bool      `json:"is_active" db:"is_active"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}
