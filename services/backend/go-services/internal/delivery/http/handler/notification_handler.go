package handler

import (
	"net/http"
	"strconv"

	notificationuc "github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/notification"
	"github.com/gorilla/mux"
)

type NotificationHandler struct {
	uc notificationuc.UseCase
}

func NewNotificationHandler(uc notificationuc.UseCase) *NotificationHandler {
	return &NotificationHandler{uc: uc}
}

// GetNotifications handles GET /api/v1/notifications
func (h *NotificationHandler) GetNotifications(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("user_id").(string)

	limit := 20
	offset := 0
	unreadOnly := false

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
	if v := r.URL.Query().Get("unread_only"); v == "1" || v == "true" {
		unreadOnly = true
	}

	items, err := h.uc.ListNotifications(r.Context(), userID, limit, offset, unreadOnly)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{"notifications": items})
}

// GetUnreadCount handles GET /api/v1/notifications/unread-count
func (h *NotificationHandler) GetUnreadCount(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("user_id").(string)

	count, err := h.uc.GetUnreadCount(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{"unread_count": count})
}

// MarkAsRead handles PATCH /api/v1/notifications/{id}/read
func (h *NotificationHandler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("user_id").(string)
	id := mux.Vars(r)["id"]

	if err := h.uc.MarkAsRead(r.Context(), userID, id); err != nil {
		if err.Error() == "notification not found" {
			respondWithError(w, http.StatusNotFound, err.Error())
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]bool{"success": true})
}

// MarkAllAsRead handles PATCH /api/v1/notifications/read-all
func (h *NotificationHandler) MarkAllAsRead(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("user_id").(string)

	if err := h.uc.MarkAllAsRead(r.Context(), userID); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]bool{"success": true})
}

// DeleteNotification handles DELETE /api/v1/notifications/{id}
func (h *NotificationHandler) DeleteNotification(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("user_id").(string)
	id := mux.Vars(r)["id"]

	if err := h.uc.DeleteNotification(r.Context(), userID, id); err != nil {
		if err.Error() == "notification not found" {
			respondWithError(w, http.StatusNotFound, err.Error())
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]bool{"success": true})
}
