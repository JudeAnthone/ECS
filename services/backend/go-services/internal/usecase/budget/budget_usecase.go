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

func (uc *budgetUsecase) GetProgramChairBudgets(ctx context.Context, chairID *string) ([]*ProgramChairBudgetDTO, error) {
	items, err := uc.budgetRepo.GetProgramChairBudgets(ctx, chairID)
	if err != nil {
		return nil, fmt.Errorf("failed to get program chair budgets: %w", err)
	}
	out := make([]*ProgramChairBudgetDTO, 0, len(items))
	for _, item := range items {
		out = append(out, &ProgramChairBudgetDTO{
			ID:              item.ID,
			ChairID:         item.ChairID,
			ChairFirstName:  item.ChairFirstName,
			ChairLastName:   item.ChairLastName,
			AllocatedBudget: item.AllocatedBudget,
			SpentBudget:     item.SpentBudget,
			RemainingBudget: item.AllocatedBudget - item.SpentBudget,
			UpdatedAt:       item.UpdatedAt.Format(time.RFC3339),
		})
	}
	return out, nil
}

func (uc *budgetUsecase) SetProgramChairBudget(ctx context.Context, chairID string, allocatedBudget float64) (*ProgramChairBudgetDTO, error) {
	if chairID == "" {
		return nil, fmt.Errorf("chair_id is required")
	}
	if allocatedBudget < 0 {
		return nil, fmt.Errorf("allocated_budget cannot be negative")
	}
	// Validate reduction: ensure new allocatedBudget covers already committed department allocations and spent amount
	// Fetch current chair department allocations
	deptBudgets, err := uc.budgetRepo.GetChairDepartmentBudgets(ctx, &chairID)
	if err != nil {
		return nil, fmt.Errorf("failed to validate chair allocations: %w", err)
	}
	var deptSum float64
	for _, d := range deptBudgets {
		deptSum += d.AllocatedBudget
	}
	// Fetch current program chair budget (to read spent)
	pcs, err := uc.budgetRepo.GetProgramChairBudgets(ctx, &chairID)
	if err != nil {
		return nil, fmt.Errorf("failed to validate chair budget: %w", err)
	}
	var spent float64
	if len(pcs) > 0 {
		spent = pcs[0].SpentBudget
	}

	minRequired := deptSum + spent
	if allocatedBudget < minRequired {
		return nil, fmt.Errorf("cannot reduce allocated_budget below current commitments: minimum allowed is %.2f (departments: %.2f + spent: %.2f)", minRequired, deptSum, spent)
	}

	item, err := uc.budgetRepo.SetProgramChairBudget(ctx, chairID, allocatedBudget)
	if err != nil {
		return nil, fmt.Errorf("failed to set program chair budget: %w", err)
	}
	return &ProgramChairBudgetDTO{
		ID:              item.ID,
		ChairID:         item.ChairID,
		ChairFirstName:  item.ChairFirstName,
		ChairLastName:   item.ChairLastName,
		AllocatedBudget: item.AllocatedBudget,
		SpentBudget:     item.SpentBudget,
		RemainingBudget: item.AllocatedBudget - item.SpentBudget,
		UpdatedAt:       item.UpdatedAt.Format(time.RFC3339),
	}, nil
}

func (uc *budgetUsecase) GetChairDepartmentBudgets(ctx context.Context, chairID *string) ([]*ChairDepartmentBudgetDTO, error) {
	items, err := uc.budgetRepo.GetChairDepartmentBudgets(ctx, chairID)
	if err != nil {
		return nil, fmt.Errorf("failed to get chair department budgets: %w", err)
	}
	out := make([]*ChairDepartmentBudgetDTO, 0, len(items))
	for _, item := range items {
		out = append(out, &ChairDepartmentBudgetDTO{
			ID:              item.ID,
			ChairID:         item.ChairID,
			ChairFirstName:  item.ChairFirstName,
			ChairLastName:   item.ChairLastName,
			DepartmentID:    item.DepartmentID,
			DepartmentName:  item.DepartmentName,
			AllocatedBudget: item.AllocatedBudget,
			SpentBudget:     item.SpentBudget,
			RemainingBudget: item.AllocatedBudget - item.SpentBudget,
			UpdatedAt:       item.UpdatedAt.Format(time.RFC3339),
		})
	}
	return out, nil
}

func (uc *budgetUsecase) SetChairDepartmentBudget(ctx context.Context, chairID string, departmentID string, allocatedBudget float64) (*ChairDepartmentBudgetDTO, error) {
	if chairID == "" {
		return nil, fmt.Errorf("chair_id is required")
	}
	if departmentID == "" {
		return nil, fmt.Errorf("department_id is required")
	}
	if allocatedBudget < 0 {
		return nil, fmt.Errorf("allocated_budget cannot be negative")
	}
	item, err := uc.budgetRepo.SetChairDepartmentBudget(ctx, chairID, departmentID, allocatedBudget)
	if err != nil {
		return nil, fmt.Errorf("failed to set chair department budget: %w", err)
	}
	return &ChairDepartmentBudgetDTO{
		ID:              item.ID,
		ChairID:         item.ChairID,
		ChairFirstName:  item.ChairFirstName,
		ChairLastName:   item.ChairLastName,
		DepartmentID:    item.DepartmentID,
		DepartmentName:  item.DepartmentName,
		AllocatedBudget: item.AllocatedBudget,
		SpentBudget:     item.SpentBudget,
		RemainingBudget: item.AllocatedBudget - item.SpentBudget,
		UpdatedAt:       item.UpdatedAt.Format(time.RFC3339),
	}, nil
}

func (uc *budgetUsecase) DeleteChairDepartmentBudget(ctx context.Context, chairID string, departmentID string) error {
	if chairID == "" {
		return fmt.Errorf("chair_id is required")
	}
	if departmentID == "" {
		return fmt.Errorf("department_id is required")
	}
	if err := uc.budgetRepo.DeleteChairDepartmentBudget(ctx, chairID, departmentID); err != nil {
		return fmt.Errorf("failed to delete chair department budget: %w", err)
	}
	return nil
}
