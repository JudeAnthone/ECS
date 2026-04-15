package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	activityuc "github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/activity"
)

type ActivityHandler struct {
	uc activityuc.UseCase
}

func NewActivityHandler(uc activityuc.UseCase) *ActivityHandler {
	return &ActivityHandler{uc: uc}
}

// CreateActivity handles POST /api/v1/activity-logs
func (h *ActivityHandler) CreateActivity(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("user_id").(string)

	var input activityuc.CreateActivityInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	created, err := h.uc.CreateActivity(r.Context(), userID, &input)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, map[string]interface{}{"activity": created})
}

// GetActivityLogs handles GET /api/v1/activity-logs
func (h *ActivityHandler) GetActivityLogs(w http.ResponseWriter, r *http.Request) {
	limit := 20
	offset := 0

	if v := r.URL.Query().Get("limit"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil {
			limit = parsed
		}
	}
	if v := r.URL.Query().Get("offset"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil {
			offset = parsed
		}
	}

	items, err := h.uc.ListActivities(r.Context(), limit, offset)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{"activities": items})
}
