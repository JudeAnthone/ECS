package router

import (
	"net/http"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/config"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/handler"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/middleware"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/pkg/database"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository/postgres"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/auth"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/department"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/program"
	projectuc "github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/project"
	requestuc "github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/request"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/usecase/user"
	"github.com/gorilla/mux"
)

func SetupRoutes() *mux.Router {
	r := mux.NewRouter()

	// Initialize repositories
	userRepo := postgres.NewUserRepository(database.DB)
	departmentRepo := postgres.NewDepartmentRepository(database.DB)
	programRepo := postgres.NewProgramRepository(database.DB)
	projectRepo := postgres.NewProjectRepository(database.DB)
	requestRepo := postgres.NewRequestRepository(database.DB)

	// Initialize usecases
	authUsecase := auth.NewAuthUsecase(userRepo, config.AppConfig)
	userUsecase := user.NewUserUseCase(userRepo)
	departmentUsecase := department.NewDepartmentUseCase(departmentRepo)
	programUsecase := program.NewProgramUseCase(programRepo)
	projectUsecase := projectuc.NewProjectUseCase(projectRepo, userRepo, departmentRepo, programRepo)
	requestUsecase := requestuc.NewRequestUseCase(requestRepo, programRepo, userRepo, departmentRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authUsecase)
	userHandler := handler.NewUserHandler(userUsecase)
	departmentHandler := handler.NewDepartmentHandler(departmentUsecase)
	programHandler := handler.NewProgramHandler(programUsecase)
	projectHandler := handler.NewProjectHandler(projectUsecase)
	requestHandler := handler.NewRequestHandler(requestUsecase)

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
	api.Handle("/programs", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair)(http.HandlerFunc(programHandler.CreateProgram))).Methods("POST")
	api.HandleFunc("/programs", programHandler.GetAllPrograms).Methods("GET")
	api.HandleFunc("/programs/{id}", programHandler.GetProgramByID).Methods("GET")
	api.HandleFunc("/programs/department/{departmentId}", programHandler.GetProgramsByDepartment).Methods("GET")
	api.HandleFunc("/programs/program-chair/{programChairId}", programHandler.GetProgramsByProgramChair).Methods("GET")
	api.Handle("/programs/{id}", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair)(http.HandlerFunc(programHandler.UpdateProgram))).Methods("PUT")
	api.Handle("/programs/{id}/status", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair)(http.HandlerFunc(programHandler.UpdateProgramStatus))).Methods("PATCH")
	api.Handle("/programs/{id}/approval", middleware.AdminOnlyMiddleware(http.HandlerFunc(programHandler.UpdateProgramApproval))).Methods("PATCH")
	api.Handle("/programs/{id}/assign-chair", middleware.AdminOnlyMiddleware(http.HandlerFunc(programHandler.AssignProgramChair))).Methods("PATCH")
	api.Handle("/programs/{id}", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair)(http.HandlerFunc(programHandler.DeleteProgram))).Methods("DELETE")

	// Project routes
	api.Handle("/projects", middleware.RequireRolesMiddleware(domain.RoleProjectHead, domain.RoleProgramChair, domain.RoleStaff)(http.HandlerFunc(projectHandler.CreateProject))).Methods("POST")
	api.HandleFunc("/projects", projectHandler.GetProjects).Methods("GET")
	api.Handle("/projects/{id}", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair, domain.RoleProjectHead)(http.HandlerFunc(projectHandler.UpdateProject))).Methods("PUT")
	api.Handle("/projects/{id}/head-review", middleware.RequireRolesMiddleware(domain.RoleProjectHead)(http.HandlerFunc(projectHandler.ProjectHeadPreReview))).Methods("PATCH")
	api.Handle("/projects/{id}/approval", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair)(http.HandlerFunc(projectHandler.UpdateProjectApproval))).Methods("PATCH")
	api.Handle("/projects/approval/bulk", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair)(http.HandlerFunc(projectHandler.BulkUpdateProjectApproval))).Methods("PATCH")
	api.Handle("/projects/{id}/assign-head", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair)(http.HandlerFunc(projectHandler.AssignProjectHead))).Methods("PATCH")
	api.Handle("/projects/{id}/staff-assignments", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair, domain.RoleProjectHead)(http.HandlerFunc(projectHandler.GetProjectStaffAssignments))).Methods("GET")
	api.Handle("/projects/{id}/staff-assignments", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair, domain.RoleProjectHead)(http.HandlerFunc(projectHandler.ReplaceProjectStaffAssignments))).Methods("PUT")
	api.Handle("/projects/{id}/tasks", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair, domain.RoleProjectHead)(http.HandlerFunc(projectHandler.GetProjectTasks))).Methods("GET")
	api.Handle("/projects/{id}/tasks", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair, domain.RoleProjectHead)(http.HandlerFunc(projectHandler.CreateProjectTask))).Methods("POST")
	api.Handle("/projects/tasks/{id}/status", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair, domain.RoleProjectHead)(http.HandlerFunc(projectHandler.UpdateProjectTaskStatus))).Methods("PATCH")
	api.Handle("/projects/tasks/{id}", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair, domain.RoleProjectHead)(http.HandlerFunc(projectHandler.DeleteProjectTask))).Methods("DELETE")
	api.Handle("/projects/{id}", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair, domain.RoleProjectHead)(http.HandlerFunc(projectHandler.DeleteProject))).Methods("DELETE")

	// Staff task routes
	api.Handle("/staff/projects-with-task-summary", middleware.RequireRolesMiddleware(domain.RoleStaff)(http.HandlerFunc(projectHandler.GetStaffProjectTaskSummaries))).Methods("GET")
	api.Handle("/staff/tasks", middleware.RequireRolesMiddleware(domain.RoleStaff)(http.HandlerFunc(projectHandler.GetStaffTasks))).Methods("GET")
	api.Handle("/staff/tasks/{id}/status", middleware.RequireRolesMiddleware(domain.RoleStaff)(http.HandlerFunc(projectHandler.UpdateStaffTaskStatus))).Methods("PATCH")

	// Request (Extension Service) routes
	// POST   /requests          — any authenticated user submits a request
	// GET    /requests          — role-branched: admin=all, chair=by-program, head=assigned, user=own
	// GET    /requests/{id}     — single request
	// PATCH  /requests/{id}/review          — program_chair reviews
	// PATCH  /requests/{id}/assign          — program_chair assigns to project head
	// PATCH  /requests/{id}/respond         — project_head accepts/declines
	// PATCH  /requests/{id}/proposal        — project_head submits proposal
	// PATCH  /requests/{id}/review-proposal — admin reviews proposal
	// PATCH  /requests/{id}/approve         — admin final approval
	api.HandleFunc("/requests", requestHandler.SubmitRequest).Methods("POST")
	api.HandleFunc("/requests", requestHandler.GetRequests).Methods("GET")
	api.HandleFunc("/requests/{id}", requestHandler.GetRequestByID).Methods("GET")
	api.Handle("/requests/{id}", middleware.RequireRolesMiddleware(domain.RoleAdmin, domain.RoleProgramChair, domain.RoleProjectHead, domain.RoleStaff, domain.RolePublicUser)(http.HandlerFunc(requestHandler.DeleteRequest))).Methods("DELETE")
	api.Handle("/requests/{id}/review", middleware.RequireRolesMiddleware(domain.RoleProgramChair, domain.RoleAdmin)(http.HandlerFunc(requestHandler.ProgramChairReview))).Methods("PATCH")
	api.Handle("/requests/{id}/assign", middleware.RequireRolesMiddleware(domain.RoleProgramChair)(http.HandlerFunc(requestHandler.AssignToHead))).Methods("PATCH")
	api.Handle("/requests/{id}/respond", middleware.RequireRolesMiddleware(domain.RoleProjectHead)(http.HandlerFunc(requestHandler.ProjectHeadRespond))).Methods("PATCH")
	api.Handle("/requests/{id}/proposal", middleware.RequireRolesMiddleware(domain.RoleProjectHead)(http.HandlerFunc(requestHandler.SubmitProposal))).Methods("PATCH")
	api.Handle("/requests/{id}/review-proposal", middleware.AdminOnlyMiddleware(http.HandlerFunc(requestHandler.ReviewProposal))).Methods("PATCH")
	api.Handle("/requests/{id}/approve", middleware.AdminOnlyMiddleware(http.HandlerFunc(requestHandler.FinalApprove))).Methods("PATCH")

	// User management routes (admin only)
	api.Handle("/users", middleware.AdminOnlyMiddleware(http.HandlerFunc(userHandler.GetAllUsers))).Methods("GET")
	api.HandleFunc("/users/by-role", userHandler.GetUsersByRole).Methods("GET")
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
