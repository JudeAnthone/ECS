package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/pkg/database"
)

type HealthResponse struct {
	Status   string `json:"status"`
	Database string `json:"database"`
	Time     string `json:"time"`
}

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := HealthResponse{
		Status: "healthy",
		Time:   time.Now().Format(time.RFC3339),
	}

	// Check database connection
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := database.DB.Ping(ctx); err != nil {
		response.Database = "disconnected"
		response.Status = "unhealthy"
		w.WriteHeader(http.StatusServiceUnavailable)
	} else {
		response.Database = "connected"
		w.WriteHeader(http.StatusOK)
	}

	json.NewEncoder(w).Encode(response)
}

func RootHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "ECS Backend API",
		"version": "1.0.0",
		"status":  "running",
	})
}
