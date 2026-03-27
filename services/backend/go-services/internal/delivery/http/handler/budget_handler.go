package handler

import (
	"net/http"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/budget"
)

type BudgetHandler struct {
	uc budget.UseCase
}

func NewBudgetHandler(uc budget.UseCase) *BudgetHandler {
	return &BudgetHandler{uc: uc}
}

// GetTotalBudget handles GET /api/v1/budgets/summary
func (h *BudgetHandler) GetTotalBudget(w http.ResponseWriter, r *http.Request) {
	total, err := h.uc.GetTotalBudget(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"total": total})
}

// GetBudgetRequests handles GET /api/v1/budget-requests
func (h *BudgetHandler) GetBudgetRequests(w http.ResponseWriter, r *http.Request) {
	reqs, err := h.uc.GetAllBudgetRequests(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"requests": reqs})
}
