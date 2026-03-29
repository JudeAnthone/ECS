package budget

import "context"

type UseCase interface {
	GetTotalBudget(ctx context.Context) (float64, error)
	GetAllBudgetRequests(ctx context.Context) ([]*RequestDTO, error)
	GetProgramChairBudgets(ctx context.Context, chairID *string) ([]*ProgramChairBudgetDTO, error)
	SetProgramChairBudget(ctx context.Context, chairID string, allocatedBudget float64) (*ProgramChairBudgetDTO, error)
	GetChairDepartmentBudgets(ctx context.Context, chairID *string) ([]*ChairDepartmentBudgetDTO, error)
	SetChairDepartmentBudget(ctx context.Context, chairID string, departmentID string, allocatedBudget float64) (*ChairDepartmentBudgetDTO, error)
	DeleteChairDepartmentBudget(ctx context.Context, chairID string, departmentID string) error
}

// RequestDTO is a lightweight DTO for handlers
type RequestDTO struct {
	ID          string  `json:"id"`
	ProjectID   string  `json:"project_id"`
	RequestedBy string  `json:"requested_by"`
	Amount      float64 `json:"amount"`
	Reason      string  `json:"reason"`
	Status      string  `json:"status"`
	CreatedAt   string  `json:"created_at"`
}

type ProgramChairBudgetDTO struct {
	ID              string  `json:"id"`
	ChairID         string  `json:"chair_id"`
	ChairFirstName  string  `json:"chair_first_name"`
	ChairLastName   string  `json:"chair_last_name"`
	AllocatedBudget float64 `json:"allocated_budget"`
	SpentBudget     float64 `json:"spent_budget"`
	RemainingBudget float64 `json:"remaining_budget"`
	UpdatedAt       string  `json:"updated_at"`
}

type ChairDepartmentBudgetDTO struct {
	ID              string  `json:"id"`
	ChairID         string  `json:"chair_id"`
	ChairFirstName  string  `json:"chair_first_name"`
	ChairLastName   string  `json:"chair_last_name"`
	DepartmentID    string  `json:"department_id"`
	DepartmentName  string  `json:"department_name"`
	AllocatedBudget float64 `json:"allocated_budget"`
	SpentBudget     float64 `json:"spent_budget"`
	RemainingBudget float64 `json:"remaining_budget"`
	UpdatedAt       string  `json:"updated_at"`
}
