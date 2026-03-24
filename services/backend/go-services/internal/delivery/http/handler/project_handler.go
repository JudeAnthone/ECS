package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/project"
	"github.com/gorilla/mux"
)

type ProjectHandler struct {
	projectUsecase project.UseCase
}

func NewProjectHandler(projectUsecase project.UseCase) *ProjectHandler {
	return &ProjectHandler{projectUsecase: projectUsecase}
}

// CreateProject handles POST /api/v1/projects
func (h *ProjectHandler) CreateProject(w http.ResponseWriter, r *http.Request) {
	createdBy, ok := r.Context().Value("user_id").(string)
	if !ok || createdBy == "" {
		respondWithError(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	var req domain.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	if req.ProjectName == "" {
		respondWithError(w, http.StatusBadRequest, "project_name is required")
		return
	}

	proj, err := h.projectUsecase.CreateProject(r.Context(), &req, createdBy)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusCreated, proj)
}

// GetProjects handles GET /api/v1/projects?program_id=<id>
func (h *ProjectHandler) GetProjects(w http.ResponseWriter, r *http.Request) {
	programID := r.URL.Query().Get("program_id")
	if programID == "" {
		respondWithError(w, http.StatusBadRequest, "program_id query parameter is required")
		return
	}

	projects, err := h.projectUsecase.GetProjectsByProgramID(r.Context(), programID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"projects": projects,
	})
}

// UpdateProject handles PUT /api/v1/projects/{id}
func (h *ProjectHandler) UpdateProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "project id is required")
		return
	}

	var req domain.UpdateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.projectUsecase.UpdateProject(r.Context(), id, &req); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "project updated"})
}

// DeleteProject handles DELETE /api/v1/projects/{id}
func (h *ProjectHandler) DeleteProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "project id is required")
		return
	}

	if err := h.projectUsecase.DeleteProject(r.Context(), id); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "project deleted"})
}

// AssignProjectHead handles PATCH /api/v1/projects/{id}/assign-head
func (h *ProjectHandler) AssignProjectHead(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var body struct {
		ProjectHeadID *string `json:"project_head_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.projectUsecase.AssignProjectHead(r.Context(), id, body.ProjectHeadID); err != nil {
		if strings.Contains(err.Error(), "outside the assigned project team") || strings.Contains(err.Error(), "assigned user must have role project_head") || strings.Contains(err.Error(), "different program chair") {
			respondWithError(w, http.StatusBadRequest, err.Error())
			return
		}
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Project head assigned"})
}
