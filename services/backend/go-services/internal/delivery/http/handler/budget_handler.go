package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
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
	role, _ := r.Context().Value("role").(string)
	userID, _ := r.Context().Value("user_id").(string)
	reqs, err := h.uc.GetAllBudgetRequests(r.Context(), role, userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"requests": reqs})
}

// CreateBudgetRequest handles POST /api/v1/budget-requests
func (h *BudgetHandler) CreateBudgetRequest(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value("role").(string)
	userID, _ := r.Context().Value("user_id").(string)

	var input budget.CreateBudgetRequestInput
	contentType := r.Header.Get("Content-Type")
	if strings.Contains(contentType, "multipart/form-data") {
		if err := r.ParseMultipartForm(32 << 20); err != nil {
			respondWithError(w, http.StatusBadRequest, "invalid multipart payload")
			return
		}
		input.ProjectID = strings.TrimSpace(r.FormValue("project_id"))
		amount, err := strconv.ParseFloat(strings.TrimSpace(r.FormValue("amount")), 64)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "amount must be a valid number")
			return
		}
		input.Amount = amount
		input.Reason = strings.TrimSpace(r.FormValue("reason"))
		if neededBy := strings.TrimSpace(r.FormValue("needed_by_date")); neededBy != "" {
			input.NeededByDate = &neededBy
		}
		file, fileHeader, err := r.FormFile("supporting_document")
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "supporting_document is required")
			return
		}
		defer file.Close()
		storedPath, storedName, err := saveBudgetRequestDocument(fileHeader)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		input.DocumentURL = storedPath
		input.DocumentName = storedName
	} else {
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			respondWithError(w, http.StatusBadRequest, "invalid request payload")
			return
		}
	}

	created, err := h.uc.CreateBudgetRequest(r.Context(), userID, role, &input)
	if err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusCreated, created)
}

// ReviewBudgetRequest handles PATCH /api/v1/budget-requests/{id}/review
func (h *BudgetHandler) ReviewBudgetRequest(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value("role").(string)
	userID, _ := r.Context().Value("user_id").(string)
	id := mux.Vars(r)["id"]
	var input budget.ReviewBudgetRequestInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request payload")
		return
	}
	updated, err := h.uc.ReviewBudgetRequest(r.Context(), id, userID, role, &input)
	if err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, updated)
}

// DeleteBudgetRequest handles DELETE /api/v1/budget-requests/{id}
func (h *BudgetHandler) DeleteBudgetRequest(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value("role").(string)
	userID, _ := r.Context().Value("user_id").(string)
	id := mux.Vars(r)["id"]
	if err := h.uc.DeleteBudgetRequest(r.Context(), id, userID, role); err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

// GetProjectHeadStaffBudgetDocuments handles GET /api/v1/budget-reports/staff
func (h *BudgetHandler) GetProjectHeadStaffBudgetDocuments(w http.ResponseWriter, r *http.Request) {
	role, _ := r.Context().Value("role").(string)
	userID, _ := r.Context().Value("user_id").(string)
	items, err := h.uc.GetProjectHeadStaffBudgetDocuments(r.Context(), userID, role)
	if err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"documents": items})
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
	var departmentID *string
	if q := r.URL.Query().Get("department_id"); q != "" {
		departmentID = &q
	}

	if role == "program_chair" {
		if chairID != nil && *chairID != userID {
			respondWithError(w, http.StatusForbidden, "you can only access your own department budgets")
			return
		}
		chairID = &userID
	}

	items, err := h.uc.GetChairDepartmentBudgets(r.Context(), chairID, departmentID)
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

func saveBudgetRequestDocument(header *multipart.FileHeader) (string, string, error) {
	if header == nil {
		return "", "", fmt.Errorf("supporting document is required")
	}
	baseName := filepath.Base(header.Filename)
	if baseName == "." || baseName == string(filepath.Separator) || baseName == "" {
		baseName = "supporting-document"
	}
	dir := filepath.Join("uploads", "budget-requests")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", "", fmt.Errorf("failed to prepare document storage: %w", err)
	}
	storedName := fmt.Sprintf("%d-%s", time.Now().UnixNano(), baseName)
	storedPath := filepath.Join(dir, storedName)
	if err := func() error {
		file, err := header.Open()
		if err != nil {
			return err
		}
		defer file.Close()
		out, err := os.Create(storedPath)
		if err != nil {
			return err
		}
		defer out.Close()
		if _, err := io.Copy(out, file); err != nil {
			return err
		}
		return nil
	}(); err != nil {
		return "", "", fmt.Errorf("failed to store supporting document: %w", err)
	}
	return storedPath, baseName, nil
}
