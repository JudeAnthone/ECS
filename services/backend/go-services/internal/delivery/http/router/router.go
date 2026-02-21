package router

import (
	"net/http"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/config"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/handler"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/middleware"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/pkg/database"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository/postgres"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/auth"
)

func SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	// Initialize repositories
	userRepo := postgres.NewUserRepository(database.DB)

	// Initialize usecases
	authUsecase := auth.NewAuthUsecase(userRepo, config.AppConfig)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authUsecase)

	// Root endpoint
	mux.HandleFunc("/", handler.RootHandler)

	// Health check endpoint
	mux.HandleFunc("/health", handler.HealthCheck)

	// Auth routes
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)
	mux.HandleFunc("POST /api/v1/auth/register", authHandler.Register)

	return mux
}

func NewServer(port string) *http.Server {
	mux := SetupRoutes()

	// Wrap with CORS and logging middleware
	handler := middleware.CORS(middleware.Logger(mux))

	return &http.Server{
		Addr:    ":" + port,
		Handler: handler,
	}
}

