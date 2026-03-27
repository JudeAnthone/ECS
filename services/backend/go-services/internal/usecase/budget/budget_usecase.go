package budget

import (
	"context"
	"fmt"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository"
)

type budgetUsecase struct {
	budgetRepo repository.BudgetRepository
}

func NewBudgetUsecase(bRepo repository.BudgetRepository) UseCase {
	return &budgetUsecase{budgetRepo: bRepo}
}

func (uc *budgetUsecase) GetTotalBudget(ctx context.Context) (float64, error) {
	return uc.budgetRepo.GetTotalBudget(ctx)
}

func (uc *budgetUsecase) GetAllBudgetRequests(ctx context.Context) ([]*RequestDTO, error) {
	reqs, err := uc.budgetRepo.GetAllBudgetRequests(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get budget requests: %w", err)
	}
	out := make([]*RequestDTO, 0, len(reqs))
	for _, r := range reqs {
		out = append(out, &RequestDTO{
			ID:          r.ID,
			ProjectID:   r.ProjectID,
			RequestedBy: r.RequestedBy,
			Amount:      r.Amount,
			Reason:      r.Reason,
			Status:      r.Status,
			CreatedAt:   r.CreatedAt.Format(time.RFC3339),
		})
	}
	return out, nil
}
