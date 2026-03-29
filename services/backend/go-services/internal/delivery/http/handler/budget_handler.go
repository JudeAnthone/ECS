package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/budget"
	"github.com/gorilla/mux"
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

// GetProgramChairBudgets handles GET /api/v1/budgets/chairs
func (h *BudgetHandler) GetProgramChairBudgets(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value("role").(string)
	userID, _ := r.Context().Value("user_id").(string)

	var chairID *string
	if q := r.URL.Query().Get("chair_id"); q != "" {
		chairID = &q
	}

	if role == "program_chair" {
		if chairID != nil && *chairID != userID {
			respondWithError(w, http.StatusForbidden, "you can only access your own budget")
			return
		}
		chairID = &userID
	}

	items, err := h.uc.GetProgramChairBudgets(r.Context(), chairID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"program_chair_budgets": items})
}

// SetProgramChairBudget handles PATCH /api/v1/budgets/chairs/{chairId}
func (h *BudgetHandler) SetProgramChairBudget(w http.ResponseWriter, r *http.Request) {
	chairID := mux.Vars(r)["chairId"]
	var body struct {
		AllocatedBudget *float64 `json:"allocated_budget"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request payload")
		return
	}
	if body.AllocatedBudget == nil {
		respondWithError(w, http.StatusBadRequest, "allocated_budget is required")
		return
	}

	item, err := h.uc.SetProgramChairBudget(r.Context(), chairID, *body.AllocatedBudget)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, item)
}

// GetChairDepartmentBudgets handles GET /api/v1/budgets/chair-departments
func (h *BudgetHandler) GetChairDepartmentBudgets(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value("role").(string)
	userID, _ := r.Context().Value("user_id").(string)

	var chairID *string
	if q := r.URL.Query().Get("chair_id"); q != "" {
		chairID = &q
	}

	if role == "program_chair" {
		if chairID != nil && *chairID != userID {
			respondWithError(w, http.StatusForbidden, "you can only access your own department budgets")
			return
		}
		chairID = &userID
	}

	items, err := h.uc.GetChairDepartmentBudgets(r.Context(), chairID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"chair_department_budgets": items})
}

// SetChairDepartmentBudget handles PATCH /api/v1/budgets/chairs/{chairId}/departments/{departmentId}
func (h *BudgetHandler) SetChairDepartmentBudget(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value("role").(string)
	userID, _ := r.Context().Value("user_id").(string)
	vars := mux.Vars(r)
	chairID := vars["chairId"]
	departmentID := vars["departmentId"]

	if role == "program_chair" && chairID != userID {
		respondWithError(w, http.StatusForbidden, "you can only update your own department budgets")
		return
	}

	var body struct {
		AllocatedBudget *float64 `json:"allocated_budget"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request payload")
		return
	}
	if body.AllocatedBudget == nil {
		respondWithError(w, http.StatusBadRequest, "allocated_budget is required")
		return
	}

	item, err := h.uc.SetChairDepartmentBudget(r.Context(), chairID, departmentID, *body.AllocatedBudget)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, item)
}

// DeleteChairDepartmentBudget handles DELETE /api/v1/budgets/chairs/{chairId}/departments/{departmentId}
func (h *BudgetHandler) DeleteChairDepartmentBudget(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value("role").(string)
	userID, _ := r.Context().Value("user_id").(string)
	vars := mux.Vars(r)
	chairID := vars["chairId"]
	departmentID := vars["departmentId"]

	if role == "program_chair" && chairID != userID {
		respondWithError(w, http.StatusForbidden, "you can only update your own department budgets")
		return
	}

	if err := h.uc.DeleteChairDepartmentBudget(r.Context(), chairID, departmentID); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}
