package handler

import (
	"fmt"
	"io"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/dto"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/user"
	"github.com/gorilla/mux"
)

const maxAvatarUploadSize int64 = 5 << 20

type UserHandler struct {
	userUsecase user.UseCase
}

func NewUserHandler(userUsecase user.UseCase) *UserHandler {
	return &UserHandler{
		userUsecase: userUsecase,
	}
}

func (h *UserHandler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.userUsecase.GetAllUsers(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"users": users,
	})
}

func (h *UserHandler) ApproveUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	// Get the approver's user ID from context (set by middleware)
	approverID, ok := r.Context().Value("user_id").(string)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	err := h.userUsecase.ApproveUser(r.Context(), userID, approverID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "User approved successfully",
	})
}

func (h *UserHandler) RejectUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	// Get the approver's user ID from context (set by middleware)
	approverID, ok := r.Context().Value("user_id").(string)
	if !ok {
		respondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	err := h.userUsecase.RejectUser(r.Context(), userID, approverID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "User rejected successfully",
	})
}

func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	err := h.userUsecase.DeleteUser(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "User deleted successfully",
	})
}

func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	var updates dto.UpdateUserDTO
	err := json.NewDecoder(r.Body).Decode(&updates)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	err = h.userUsecase.UpdateUser(r.Context(), userID, &updates)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": "User updated successfully",
	})
}

// GetUsersByRole handles GET /api/v1/users/by-role?role=<role>
func (h *UserHandler) GetUsersByRole(w http.ResponseWriter, r *http.Request) {
	role := r.URL.Query().Get("role")
	if role == "" {
		respondWithError(w, http.StatusBadRequest, "role query parameter is required")
		return
	}
	users, err := h.userUsecase.GetUsersByRole(r.Context(), role)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"users": users})
}

func (h *UserHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok || userID == "" {
		respondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	userData, err := h.userUsecase.GetUserByID(r.Context(), userID)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"user": userData})
}

func (h *UserHandler) UpdateCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok || userID == "" {
		respondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var updates dto.UpdateOwnProfileDTO
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&updates); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	updatedUser, err := h.userUsecase.UpdateOwnProfile(r.Context(), userID, &updates)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{"user": updatedUser})
}

func (h *UserHandler) UploadMyAvatar(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok || userID == "" {
		respondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := r.ParseMultipartForm(maxAvatarUploadSize); err != nil {
		respondWithError(w, http.StatusBadRequest, "failed to parse upload form")
		return
	}

	file, header, err := r.FormFile("avatar")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "avatar file is required")
		return
	}
	defer file.Close()

	if header.Size > maxAvatarUploadSize {
		respondWithError(w, http.StatusBadRequest, "avatar must be 5MB or smaller")
		return
	}

	buf := make([]byte, 512)
	n, err := file.Read(buf)
	if err != nil && err != io.EOF {
		respondWithError(w, http.StatusBadRequest, "failed to read avatar file")
		return
	}
	contentType := http.DetectContentType(buf[:n])
	ext, ok := avatarExtByContentType(contentType)
	if !ok {
		respondWithError(w, http.StatusBadRequest, "only JPG, PNG, and WEBP images are allowed")
		return
	}
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		respondWithError(w, http.StatusBadRequest, "failed to process avatar file")
		return
	}

	previousUser, _ := h.userUsecase.GetUserByID(r.Context(), userID)
	previousAvatar := ""
	if previousUser != nil && previousUser.AvatarURL != nil {
		previousAvatar = *previousUser.AvatarURL
	}

	avatarDir := filepath.Join("uploads", "avatars")
	if err := os.MkdirAll(avatarDir, 0o755); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to prepare avatar storage")
		return
	}

	filename := fmt.Sprintf("%s-%d%s", userID, time.Now().UnixNano(), ext)
	storedPath := filepath.Join(avatarDir, filename)
	dst, err := os.Create(storedPath)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to store avatar")
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, io.LimitReader(file, maxAvatarUploadSize+1)); err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to save avatar")
		return
	}

	avatarURL := filepath.ToSlash(filepath.Join("uploads", "avatars", filename))
	updatedUser, err := h.userUsecase.UpdateOwnAvatar(r.Context(), userID, &avatarURL)
	if err != nil {
		_ = os.Remove(storedPath)
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	removeManagedAvatarFile(previousAvatar, avatarURL)
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"user": updatedUser})
}

func (h *UserHandler) RemoveMyAvatar(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok || userID == "" {
		respondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	currentUser, _ := h.userUsecase.GetUserByID(r.Context(), userID)
	previousAvatar := ""
	if currentUser != nil && currentUser.AvatarURL != nil {
		previousAvatar = *currentUser.AvatarURL
	}

	updatedUser, err := h.userUsecase.UpdateOwnAvatar(r.Context(), userID, nil)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	removeManagedAvatarFile(previousAvatar, "")
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"user": updatedUser})
}

func avatarExtByContentType(contentType string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(contentType)) {
	case "image/jpeg":
		return ".jpg", true
	case "image/png":
		return ".png", true
	case "image/webp":
		return ".webp", true
	default:
		return "", false
	}
}

func removeManagedAvatarFile(oldPath string, keepPath string) {
	old := filepath.ToSlash(strings.TrimSpace(oldPath))
	if old == "" || old == keepPath {
		return
	}
	if !strings.HasPrefix(old, "uploads/avatars/") {
		return
	}
	_ = os.Remove(filepath.FromSlash(old))
}
