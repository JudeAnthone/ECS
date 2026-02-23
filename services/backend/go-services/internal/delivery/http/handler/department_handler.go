package handler

import (
	"net/http"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/department"
	"github.com/gorilla/mux"
)

type DepartmentHandler struct {
	departmentUsecase department.UseCase
}

func NewDepartmentHandler(departmentUsecase department.UseCase) *DepartmentHandler {
	return &DepartmentHandler{
		departmentUsecase: departmentUsecase,
	}
}

func (h *DepartmentHandler) GetAllDepartments(w http.ResponseWriter, r *http.Request) {
	departments, err := h.departmentUsecase.GetAllDepartments(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"departments": departments,
	})
}

func (h *DepartmentHandler) GetDepartmentByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	department, err := h.departmentUsecase.GetDepartmentByID(r.Context(), id)
	if err != nil {
		respondWithError(w, http.StatusNotFound, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, department)
}

func (h *DepartmentHandler) GetDepartmentByCode(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	code := vars["code"]

	department, err := h.departmentUsecase.GetDepartmentByCode(r.Context(), code)
	if err != nil {
		respondWithError(w, http.StatusNotFound, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, department)
}
