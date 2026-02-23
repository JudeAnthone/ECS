package router

import (
	"net/http"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/config"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/handler"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/middleware"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/pkg/database"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository/postgres"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/auth"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/department"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/program"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/user"
	"github.com/gorilla/mux"
)

func SetupRoutes() *mux.Router {
	r := mux.NewRouter()

	// Initialize repositories
	userRepo := postgres.NewUserRepository(database.DB)
	departmentRepo := postgres.NewDepartmentRepository(database.DB)
	programRepo := postgres.NewProgramRepository(database.DB)

	// Initialize usecases
	authUsecase := auth.NewAuthUsecase(userRepo, config.AppConfig)
	userUsecase := user.NewUserUseCase(userRepo)
	departmentUsecase := department.NewDepartmentUseCase(departmentRepo)
	programUsecase := program.NewProgramUseCase(programRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authUsecase)
	userHandler := handler.NewUserHandler(userUsecase)
	departmentHandler := handler.NewDepartmentHandler(departmentUsecase)
	programHandler := handler.NewProgramHandler(programUsecase)

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

	// Department routes (accessible to authenticated users)
	api.HandleFunc("/departments", departmentHandler.GetAllDepartments).Methods("GET")
	api.HandleFunc("/departments/{id}", departmentHandler.GetDepartmentByID).Methods("GET")
	api.HandleFunc("/departments/code/{code}", departmentHandler.GetDepartmentByCode).Methods("GET")

	// Program routes
	api.Handle("/programs", middleware.AdminOnlyMiddleware(http.HandlerFunc(programHandler.CreateProgram))).Methods("POST")
	api.HandleFunc("/programs", programHandler.GetAllPrograms).Methods("GET")
	api.HandleFunc("/programs/{id}", programHandler.GetProgramByID).Methods("GET")
	api.HandleFunc("/programs/department/{departmentId}", programHandler.GetProgramsByDepartment).Methods("GET")
	api.HandleFunc("/programs/program-chair/{programChairId}", programHandler.GetProgramsByProgramChair).Methods("GET")
	api.Handle("/programs/{id}", middleware.AdminOnlyMiddleware(http.HandlerFunc(programHandler.UpdateProgram))).Methods("PUT")
	api.Handle("/programs/{id}/status", middleware.AdminOnlyMiddleware(http.HandlerFunc(programHandler.UpdateProgramStatus))).Methods("PATCH")
	api.Handle("/programs/{id}/approval", middleware.AdminOnlyMiddleware(http.HandlerFunc(programHandler.UpdateProgramApproval))).Methods("PATCH")
	api.Handle("/programs/{id}", middleware.AdminOnlyMiddleware(http.HandlerFunc(programHandler.DeleteProgram))).Methods("DELETE")

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
