package router

import (
	"net/http"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/config"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/handler"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/middleware"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/pkg/database"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository/postgres"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/auth"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/user"
	"github.com/gorilla/mux"
)

func SetupRoutes() *mux.Router {
	r := mux.NewRouter()

	// Initialize repositories
	userRepo := postgres.NewUserRepository(database.DB)

	// Initialize usecases
	authUsecase := auth.NewAuthUsecase(userRepo, config.AppConfig)
	userUsecase := user.NewUserUseCase(userRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authUsecase)
	userHandler := handler.NewUserHandler(userUsecase)

	// Root endpoint
	r.HandleFunc("/", handler.RootHandler).Methods("GET")

	// Health check endpoint
	r.HandleFunc("/health", handler.HealthCheck).Methods("GET")

	// Auth routes (public)
	r.HandleFunc("/api/v1/auth/login", authHandler.Login).Methods("POST")
	r.HandleFunc("/api/v1/auth/register", authHandler.Register).Methods("POST")

	// Protected routes (require authentication)
	api := r.PathPrefix("/api/v1").Subrouter()
	api.Use(middleware.AuthMiddleware(config.AppConfig.JWT.Secret))

	// User management routes (admin only)
	api.Handle("/users", middleware.AdminOnlyMiddleware(http.HandlerFunc(userHandler.GetAllUsers))).Methods("GET")
	api.Handle("/users/{id}/approve", middleware.AdminOnlyMiddleware(http.HandlerFunc(userHandler.ApproveUser))).Methods("PUT")
	api.Handle("/users/{id}/reject", middleware.AdminOnlyMiddleware(http.HandlerFunc(userHandler.RejectUser))).Methods("PUT")
	api.Handle("/users/{id}", middleware.AdminOnlyMiddleware(http.HandlerFunc(userHandler.UpdateUser))).Methods("PUT")
	api.Handle("/users/{id}", middleware.AdminOnlyMiddleware(http.HandlerFunc(userHandler.DeleteUser))).Methods("DELETE")

	return r
}

func NewServer(port string) *http.Server {
	router := SetupRoutes()

	// Wrap with CORS and logging middleware
	handler := middleware.CORS(middleware.Logger(router))

	return &http.Server{
		Addr:    ":" + port,
		Handler: handler,
	}
}
