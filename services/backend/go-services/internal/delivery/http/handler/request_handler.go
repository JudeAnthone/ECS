package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	requestuc "github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/request"
	"github.com/gorilla/mux"
)

// RequestHandler handles HTTP requests for the extension service request workflow.
type RequestHandler struct {
	requestUsecase requestuc.UseCase
}

func NewRequestHandler(requestUsecase requestuc.UseCase) *RequestHandler {
	return &RequestHandler{requestUsecase: requestUsecase}
}

// SubmitRequest handles POST /api/v1/requests
// Accessible by: public_user (and any authenticated user)
func (h *RequestHandler) SubmitRequest(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok || userID == "" {
		respondWithError(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	var input domain.SubmitRequestInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	req, err := h.requestUsecase.SubmitRequest(r.Context(), userID, &input)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusCreated, req)
}

// GetRequests handles GET /api/v1/requests
// Role-branching:
//   - admin  → all requests
//   - program_chair → requests for their program (query: ?program_id=...)
//   - project_head → requests assigned to them
//   - public_user  → their own requests
func (h *RequestHandler) GetRequests(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("user_id").(string)
	role, _ := r.Context().Value("role").(string)

	switch role {
	case "admin":
		reqs, err := h.requestUsecase.GetAllRequests(r.Context())
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		respondWithJSON(w, http.StatusOK, map[string]interface{}{"requests": reqs})

	case "program_chair":
		// Program chairs are in Administration and oversee ALL incoming requests,
		// not limited to a specific department.
		programID := r.URL.Query().Get("program_id")
		if programID != "" {
			reqs, err := h.requestUsecase.GetRequestsByProgram(r.Context(), programID)
			if err != nil {
				respondWithError(w, http.StatusInternalServerError, err.Error())
				return
			}
			respondWithJSON(w, http.StatusOK, map[string]interface{}{"requests": reqs})
			return
		}
		reqs, err := h.requestUsecase.GetAllRequests(r.Context())
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		respondWithJSON(w, http.StatusOK, map[string]interface{}{"requests": reqs})

	case "project_head":
		// Project heads see requests that were assigned to their department.
		reqs, err := h.requestUsecase.GetRequestsForProjectHead(r.Context(), userID)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		respondWithJSON(w, http.StatusOK, map[string]interface{}{"requests": reqs})

	default: // public_user or college user
		reqs, err := h.requestUsecase.GetMyRequests(r.Context(), userID)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		respondWithJSON(w, http.StatusOK, map[string]interface{}{"requests": reqs})
	}
}

// GetRequestByID handles GET /api/v1/requests/{id}
func (h *RequestHandler) GetRequestByID(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	req, err := h.requestUsecase.GetRequestByID(r.Context(), id)
	if err != nil {
		respondWithError(w, http.StatusNotFound, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, req)
}

// DeleteRequest handles DELETE /api/v1/requests/{id}
// Accessible by: program_chair, admin
func (h *RequestHandler) DeleteRequest(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if err := h.requestUsecase.DeleteRequest(r.Context(), id); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "request deleted"})
}

// RerouteRequest handles PATCH /api/v1/requests/{id}/reroute
// Allows a program chair to redirect a request to a different department.
func (h *RequestHandler) RerouteRequest(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	var input domain.RerouteRequestInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request payload")
		return
	}
	if input.TargetDepartmentID == "" {
		respondWithError(w, http.StatusBadRequest, "target_department_id is required")
		return
	}

	if err := h.requestUsecase.RerouteRequest(r.Context(), id, input.TargetDepartmentID); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "request rerouted"})
}

// ProgramChairReview handles PATCH /api/v1/requests/{id}/review
// Accessible by: program_chair
func (h *RequestHandler) ProgramChairReview(w http.ResponseWriter, r *http.Request) {
	chairID, _ := r.Context().Value("user_id").(string)
	id := mux.Vars(r)["id"]

	var input domain.ProgramChairReviewInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	if err := h.requestUsecase.ProgramChairReview(r.Context(), chairID, id, &input); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "review submitted"})
}

// AssignToHead handles PATCH /api/v1/requests/{id}/assign
// Accessible by: program_chair
func (h *RequestHandler) AssignToHead(w http.ResponseWriter, r *http.Request) {
	chairID, _ := r.Context().Value("user_id").(string)
	id := mux.Vars(r)["id"]

	var input domain.AssignToHeadInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	if err := h.requestUsecase.AssignToHead(r.Context(), chairID, id, &input); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "assigned to department"})
}

// ProjectHeadRespond handles PATCH /api/v1/requests/{id}/respond
// Accessible by: project_head
func (h *RequestHandler) ProjectHeadRespond(w http.ResponseWriter, r *http.Request) {
	headID, _ := r.Context().Value("user_id").(string)
	id := mux.Vars(r)["id"]

	var input domain.ProjectHeadRespondInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	if err := h.requestUsecase.ProjectHeadRespond(r.Context(), headID, id, &input); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "response recorded"})
}

// SubmitProposal handles PATCH /api/v1/requests/{id}/proposal
// Accessible by: project_head
func (h *RequestHandler) SubmitProposal(w http.ResponseWriter, r *http.Request) {
	headID, _ := r.Context().Value("user_id").(string)
	id := mux.Vars(r)["id"]

	var input domain.SubmitProposalInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	if err := h.requestUsecase.SubmitProposal(r.Context(), headID, id, &input); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "proposal submitted"})
}

// ReviewProposal handles PATCH /api/v1/requests/{id}/review-proposal
// Accessible by: admin
func (h *RequestHandler) ReviewProposal(w http.ResponseWriter, r *http.Request) {
	reviewerID, _ := r.Context().Value("user_id").(string)
	id := mux.Vars(r)["id"]

	var body struct {
		Notes    *string `json:"notes"`
		Approved bool    `json:"approved"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	if err := h.requestUsecase.ReviewProposal(r.Context(), reviewerID, id, body.Notes, body.Approved); err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "proposal reviewed"})
}

// FinalApprove handles PATCH /api/v1/requests/{id}/approve
// Accessible by: admin
func (h *RequestHandler) FinalApprove(w http.ResponseWriter, r *http.Request) {
	adminID, _ := r.Context().Value("user_id").(string)
	id := mux.Vars(r)["id"]

	var input domain.FinalApprovalInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	if err := h.requestUsecase.FinalApprove(r.Context(), adminID, id, &input); err != nil {
		respondWithError(w, http.StatusBadRequest, err.Error())
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]string{"message": "final approval recorded"})
}
