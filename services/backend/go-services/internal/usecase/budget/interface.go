package budget

import "context"

type UseCase interface {
	GetTotalBudget(ctx context.Context) (float64, error)
	GetAllBudgetRequests(ctx context.Context) ([]*RequestDTO, error)
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
