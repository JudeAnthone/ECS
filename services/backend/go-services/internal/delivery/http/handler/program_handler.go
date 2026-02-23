package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/program"
	"github.com/gorilla/mux"
)

type ProgramHandler struct {
	programUsecase program.UseCase
}

func NewProgramHandler(programUsecase program.UseCase) *ProgramHandler {
	return &ProgramHandler{
		programUsecase: programUsecase,
	}
}

// CreateProgram handles POST /api/v1/programs
func (h *ProgramHandler) CreateProgram(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateProgramRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	program, err := h.programUsecase.CreateProgram(r.Context(), &req)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusCreated, program)
}

// GetAllPrograms handles GET /api/v1/programs
func (h *ProgramHandler) GetAllPrograms(w http.ResponseWriter, r *http.Request) {
	programs, err := h.programUsecase.GetAllPrograms(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"programs": programs,
	})
}

// GetProgramByID handles GET /api/v1/programs/{id}
func (h *ProgramHandler) GetProgramByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	program, err := h.programUsecase.GetProgramByID(r.Context(), id)
	if err != nil {
		respondWithError(w, http.StatusNotFound, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, program)
}

// GetProgramsByDepartment handles GET /api/v1/programs/department/{departmentId}
func (h *ProgramHandler) GetProgramsByDepartment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	departmentID := vars["departmentId"]

	programs, err := h.programUsecase.GetProgramsByDepartment(r.Context(), departmentID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"programs": programs,
	})
}

// GetProgramsByProgramChair handles GET /api/v1/programs/program-chair/{programChairId}
func (h *ProgramHandler) GetProgramsByProgramChair(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	programChairID := vars["programChairId"]

	programs, err := h.programUsecase.GetProgramsByProgramChair(r.Context(), programChairID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"programs": programs,
	})
}

// UpdateProgram handles PUT /api/v1/programs/{id}
func (h *ProgramHandler) UpdateProgram(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var req domain.UpdateProgramRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	program, err := h.programUsecase.UpdateProgram(r.Context(), id, &req)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, program)
}

// UpdateProgramStatus handles PATCH /api/v1/programs/{id}/status
func (h *ProgramHandler) UpdateProgramStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	err := h.programUsecase.UpdateProgramStatus(r.Context(), id, req.Status)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Program status updated successfully",
	})
}

// UpdateProgramApproval handles PATCH /api/v1/programs/{id}/approval
func (h *ProgramHandler) UpdateProgramApproval(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var req domain.UpdateProgramApprovalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// TODO: Get approvedBy from JWT token/session
	approvedBy := "admin-user-id" // This should come from authenticated user

	err := h.programUsecase.UpdateProgramApproval(r.Context(), id, &req, approvedBy)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Program approval updated successfully",
	})
}

// DeleteProgram handles DELETE /api/v1/programs/{id}
func (h *ProgramHandler) DeleteProgram(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := h.programUsecase.DeleteProgram(r.Context(), id)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Program deleted successfully",
	})
}

// AssignProgramChair handles PATCH /api/v1/programs/{id}/assign-chair
func (h *ProgramHandler) AssignProgramChair(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var body struct {
		ProgramChairID *string `json:"program_chair_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if err := h.programUsecase.AssignProgramChair(r.Context(), id, body.ProgramChairID); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Program chair assigned"})
}
