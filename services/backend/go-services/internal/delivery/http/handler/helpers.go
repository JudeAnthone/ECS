package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/dto"
)

// respondWithError sends an error response in JSON format
func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, dto.ErrorResponse{
		Error: message,
		Code:  code,
	})
}

// respondWithJSON sends a response in JSON format
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}
