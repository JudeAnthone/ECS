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

	role, _ := r.Context().Value("role").(string)

	var req domain.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	if req.ProjectName == "" {
		respondWithError(w, http.StatusBadRequest, "project_name is required")
		return
	}

	proj, err := h.projectUsecase.CreateProject(r.Context(), &req, createdBy, role)
	if err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusCreated, proj)
}

// GetProjects handles GET /api/v1/projects?program_id=<id>
func (h *ProjectHandler) GetProjects(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("user_id").(string)
	if userID == "" {
		respondWithError(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	if r.URL.Query().Get("mine") == "1" {
		projects, err := h.projectUsecase.GetMyProjects(r.Context(), userID)
		if err != nil {
			if strings.HasPrefix(err.Error(), "forbidden:") {
				respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
				return
			}
			respondWithError(w, http.StatusBadRequest, err.Error())
			return
		}

		respondWithJSON(w, http.StatusOK, map[string]interface{}{
			"projects": projects,
		})
		return
	}

	programID := r.URL.Query().Get("program_id")
	if programID == "" {
		respondWithError(w, http.StatusBadRequest, "program_id query parameter is required")
		return
	}

	role, _ := r.Context().Value("role").(string)

	projects, err := h.projectUsecase.GetProjectsByProgramIDForUser(r.Context(), programID, userID, role)
	if err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"projects": projects,
	})
}

// ProjectHeadPreReview handles PATCH /api/v1/projects/{id}/head-review
func (h *ProjectHandler) ProjectHeadPreReview(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "project id is required")
		return
	}

	headID, _ := r.Context().Value("user_id").(string)
	if headID == "" {
		respondWithError(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	var input domain.ProjectHeadPreReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.projectUsecase.ProjectHeadPreReview(r.Context(), id, headID, &input); err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "project head pre-review recorded"})
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

// UpdateProjectApproval handles PATCH /api/v1/projects/{id}/approval
func (h *ProjectHandler) UpdateProjectApproval(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "project id is required")
		return
	}

	actorID, _ := r.Context().Value("user_id").(string)
	actorRole, _ := r.Context().Value("role").(string)

	var req domain.UpdateProjectApprovalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.projectUsecase.UpdateProjectApproval(r.Context(), id, &req, actorID, actorRole); err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "project approval updated"})
}

// BulkUpdateProjectApproval handles PATCH /api/v1/projects/approval/bulk
func (h *ProjectHandler) BulkUpdateProjectApproval(w http.ResponseWriter, r *http.Request) {
	actorID, _ := r.Context().Value("user_id").(string)
	actorRole, _ := r.Context().Value("role").(string)

	var req domain.BulkUpdateProjectApprovalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.projectUsecase.BulkUpdateProjectApproval(r.Context(), &req, actorID, actorRole); err != nil {
		if strings.HasPrefix(err.Error(), "bulk approval failed for project") && strings.Contains(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, err.Error())
			return
		}
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "bulk project approval updated"})
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

	actorID, _ := r.Context().Value("user_id").(string)
	actorRole, _ := r.Context().Value("role").(string)

	var body struct {
		ProjectHeadID *string `json:"project_head_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.projectUsecase.AssignProjectHead(r.Context(), id, body.ProjectHeadID, actorID, actorRole); err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		if strings.Contains(err.Error(), "outside the assigned project team") || strings.Contains(err.Error(), "assigned user must have role project_head") || strings.Contains(err.Error(), "different program chair") {
			respondWithError(w, http.StatusBadRequest, err.Error())
			return
		}
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Project head assigned"})
}

// GetProjectStaffAssignments handles GET /api/v1/projects/{id}/staff-assignments
func (h *ProjectHandler) GetProjectStaffAssignments(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "project id is required")
		return
	}

	actorID, _ := r.Context().Value("user_id").(string)
	actorRole, _ := r.Context().Value("role").(string)

	assignments, err := h.projectUsecase.GetProjectStaffAssignments(r.Context(), id, actorID, actorRole)
	if err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, assignments)
}

// ReplaceProjectStaffAssignments handles PUT /api/v1/projects/{id}/staff-assignments
func (h *ProjectHandler) ReplaceProjectStaffAssignments(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "project id is required")
		return
	}

	actorID, _ := r.Context().Value("user_id").(string)
	actorRole, _ := r.Context().Value("role").(string)

	var req domain.ReplaceProjectStaffAssignmentsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	if req.StaffIDs == nil {
		req.StaffIDs = []string{}
	}

	if err := h.projectUsecase.ReplaceProjectStaffAssignments(r.Context(), id, req.StaffIDs, actorID, actorRole); err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Project staff assignments updated"})
}

// GetProjectTasks handles GET /api/v1/projects/{id}/tasks
func (h *ProjectHandler) GetProjectTasks(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectID := strings.TrimSpace(vars["id"])
	if projectID == "" {
		respondWithError(w, http.StatusBadRequest, "project id is required")
		return
	}

	actorID, _ := r.Context().Value("user_id").(string)
	actorRole, _ := r.Context().Value("role").(string)

	tasks, err := h.projectUsecase.GetProjectTasks(r.Context(), projectID, actorID, actorRole)
	if err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"tasks": tasks,
	})
}

// CreateProjectTask handles POST /api/v1/projects/{id}/tasks
func (h *ProjectHandler) CreateProjectTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	projectID := strings.TrimSpace(vars["id"])
	if projectID == "" {
		respondWithError(w, http.StatusBadRequest, "project id is required")
		return
	}

	actorID, _ := r.Context().Value("user_id").(string)
	actorRole, _ := r.Context().Value("role").(string)

	var req domain.CreateProjectTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	task, err := h.projectUsecase.CreateProjectTask(r.Context(), projectID, actorID, actorRole, &req)
	if err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, task)
}

// UpdateProjectTaskStatus handles PATCH /api/v1/projects/tasks/{id}/status
func (h *ProjectHandler) UpdateProjectTaskStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	taskID := strings.TrimSpace(vars["id"])
	if taskID == "" {
		respondWithError(w, http.StatusBadRequest, "task id is required")
		return
	}

	actorID, _ := r.Context().Value("user_id").(string)
	actorRole, _ := r.Context().Value("role").(string)

	var req domain.UpdateProjectTaskStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.projectUsecase.UpdateProjectTaskStatus(r.Context(), taskID, actorID, actorRole, req.Status); err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Task status updated"})
}

// DeleteProjectTask handles DELETE /api/v1/projects/tasks/{id}
func (h *ProjectHandler) DeleteProjectTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	taskID := strings.TrimSpace(vars["id"])
	if taskID == "" {
		respondWithError(w, http.StatusBadRequest, "task id is required")
		return
	}

	actorID, _ := r.Context().Value("user_id").(string)
	actorRole, _ := r.Context().Value("role").(string)

	if err := h.projectUsecase.DeleteProjectTask(r.Context(), taskID, actorID, actorRole); err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Task deleted"})
}

// GetStaffProjectTaskSummaries handles GET /api/v1/staff/projects-with-task-summary
func (h *ProjectHandler) GetStaffProjectTaskSummaries(w http.ResponseWriter, r *http.Request) {
	actorID, _ := r.Context().Value("user_id").(string)
	actorRole, _ := r.Context().Value("role").(string)

	summaries, err := h.projectUsecase.GetStaffProjectTaskSummaries(r.Context(), actorID, actorRole)
	if err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"projects": summaries,
	})
}

// GetStaffTasks handles GET /api/v1/staff/tasks?project_id=<id>
func (h *ProjectHandler) GetStaffTasks(w http.ResponseWriter, r *http.Request) {
	actorID, _ := r.Context().Value("user_id").(string)
	actorRole, _ := r.Context().Value("role").(string)
	projectID := strings.TrimSpace(r.URL.Query().Get("project_id"))

	tasks, err := h.projectUsecase.GetStaffTasks(r.Context(), actorID, actorRole, projectID)
	if err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"tasks": tasks,
	})
}

// UpdateStaffTaskStatus handles PATCH /api/v1/staff/tasks/{id}/status
func (h *ProjectHandler) UpdateStaffTaskStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	taskID := strings.TrimSpace(vars["id"])
	if taskID == "" {
		respondWithError(w, http.StatusBadRequest, "task id is required")
		return
	}

	actorID, _ := r.Context().Value("user_id").(string)
	actorRole, _ := r.Context().Value("role").(string)

	var req domain.UpdateStaffTaskStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.projectUsecase.UpdateStaffTaskStatus(r.Context(), taskID, actorID, actorRole, req.Status); err != nil {
		if strings.HasPrefix(err.Error(), "forbidden:") {
			respondWithError(w, http.StatusForbidden, strings.TrimPrefix(err.Error(), "forbidden: "))
			return
		}
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Task status updated"})
}
