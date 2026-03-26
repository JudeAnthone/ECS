package project

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
)

type mockProjectRepo struct {
	createdByProjects      []*domain.Project
	projectByID            *domain.Project
	getByCreatedByCalled   bool
	updateApprovalCalled   bool
	projectHeadReviewCalled bool
}

func (m *mockProjectRepo) Create(ctx context.Context, project *domain.Project, createdBy string) error {
	return nil
}

func (m *mockProjectRepo) GetByProgramID(ctx context.Context, programID string) ([]*domain.Project, error) {
	return []*domain.Project{}, nil
}

func (m *mockProjectRepo) GetByCreatedBy(ctx context.Context, createdBy string) ([]*domain.Project, error) {
	m.getByCreatedByCalled = true
	return m.createdByProjects, nil
}

func (m *mockProjectRepo) GetByID(ctx context.Context, id string) (*domain.Project, error) {
	if m.projectByID == nil {
		return nil, errors.New("not found")
	}
	return m.projectByID, nil
}

func (m *mockProjectRepo) Update(ctx context.Context, id string, req *domain.UpdateProjectRequest) error {
	return nil
}

func (m *mockProjectRepo) ProjectHeadPreReview(ctx context.Context, id string, headID string, reviewNotes *string, approved bool) error {
	m.projectHeadReviewCalled = true
	return nil
}

func (m *mockProjectRepo) UpdateApproval(ctx context.Context, id string, approvalStatus string, status string, actorID string, reviewNotes *string) error {
	m.updateApprovalCalled = true
	return nil
}

func (m *mockProjectRepo) AssignProjectHead(ctx context.Context, projectID string, headID *string) error {
	return nil
}

func (m *mockProjectRepo) GetAssignedStaffIDsByProject(ctx context.Context, projectID string) ([]string, error) {
	return []string{}, nil
}

func (m *mockProjectRepo) ReplaceProjectStaffAssignments(ctx context.Context, projectID string, staffIDs []string, assignedBy string) error {
	return nil
}

func (m *mockProjectRepo) CreateProjectTask(ctx context.Context, projectID string, createdBy string, req *domain.CreateProjectTaskRequest) (*domain.ProjectTask, error) {
	return nil, nil
}

func (m *mockProjectRepo) GetProjectTaskByID(ctx context.Context, taskID string) (*domain.ProjectTask, error) {
	return nil, nil
}

func (m *mockProjectRepo) GetProjectTasks(ctx context.Context, projectID string) ([]*domain.ProjectTask, error) {
	return []*domain.ProjectTask{}, nil
}

func (m *mockProjectRepo) UpdateProjectTaskStatus(ctx context.Context, taskID string, status string) error {
	return nil
}

func (m *mockProjectRepo) DeleteProjectTask(ctx context.Context, taskID string) error {
	return nil
}

func (m *mockProjectRepo) GetStaffProjectTaskSummaries(ctx context.Context, staffID string) ([]*domain.StaffTaskProjectSummary, error) {
	return []*domain.StaffTaskProjectSummary{}, nil
}

func (m *mockProjectRepo) GetStaffTasks(ctx context.Context, staffID string, projectID string) ([]*domain.StaffTask, error) {
	return []*domain.StaffTask{}, nil
}

func (m *mockProjectRepo) UpdateStaffTaskStatus(ctx context.Context, taskID string, staffID string, status string) error {
	return nil
}

func (m *mockProjectRepo) Delete(ctx context.Context, id string) error {
	return nil
}

type mockUserRepo struct {
	users map[string]*domain.User
}

func (m *mockUserRepo) Create(ctx context.Context, user *domain.User) error { return nil }
func (m *mockUserRepo) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	return nil, nil
}
func (m *mockUserRepo) GetByUsername(ctx context.Context, username string) (*domain.User, error) {
	return nil, nil
}
func (m *mockUserRepo) Update(ctx context.Context, user *domain.User) error { return nil }
func (m *mockUserRepo) Delete(ctx context.Context, id string) error         { return nil }
func (m *mockUserRepo) GetAllUsers(ctx context.Context) ([]*domain.User, error) {
	return []*domain.User{}, nil
}
func (m *mockUserRepo) GetUsersByRole(ctx context.Context, role string) ([]*domain.User, error) {
	return []*domain.User{}, nil
}
func (m *mockUserRepo) UpdateAccountStatus(ctx context.Context, userID string, status string, approvedByID *string) error {
	return nil
}
func (m *mockUserRepo) UpdateLastActive(ctx context.Context, userID string) error { return nil }
func (m *mockUserRepo) GetByID(ctx context.Context, id string) (*domain.User, error) {
	if m.users == nil {
		return nil, errors.New("not found")
	}
	u, ok := m.users[id]
	if !ok {
		return nil, errors.New("not found")
	}
	return u, nil
}

type mockProgramRepo struct {
	visiblePrograms []*domain.Program
	programsByID    map[string]*domain.Program
}

func (m *mockProgramRepo) Create(ctx context.Context, program *domain.Program) error { return nil }
func (m *mockProgramRepo) GetAll(ctx context.Context) ([]*domain.Program, error)     { return []*domain.Program{}, nil }
func (m *mockProgramRepo) GetVisibleForUser(ctx context.Context, userID string, role string) ([]*domain.Program, error) {
	if m.visiblePrograms != nil {
		return m.visiblePrograms, nil
	}
	return []*domain.Program{}, nil
}
func (m *mockProgramRepo) GetByID(ctx context.Context, id string) (*domain.Program, error) {
	if m.programsByID != nil {
		if p, ok := m.programsByID[id]; ok {
			return p, nil
		}
		return nil, errors.New("not found")
	}
	return &domain.Program{ID: id}, nil
}
func (m *mockProgramRepo) GetByDepartment(ctx context.Context, departmentID string) ([]*domain.Program, error) {
	return []*domain.Program{}, nil
}
func (m *mockProgramRepo) GetByProgramChair(ctx context.Context, programChairID string) ([]*domain.Program, error) {
	return []*domain.Program{}, nil
}
func (m *mockProgramRepo) CountDistinctAssignedChairs(ctx context.Context) (int, error) { return 0, nil }
func (m *mockProgramRepo) Update(ctx context.Context, program *domain.Program) error     { return nil }
func (m *mockProgramRepo) UpdateStatus(ctx context.Context, id string, status string) error {
	return nil
}
func (m *mockProgramRepo) UpdateApproval(ctx context.Context, id string, approvalStatus string, approvedBy *string) error {
	return nil
}
func (m *mockProgramRepo) AssignProgramChair(ctx context.Context, programID string, chairID *string) error {
	return nil
}
func (m *mockProgramRepo) Delete(ctx context.Context, id string) error { return nil }

type mockDepartmentRepo struct{}

func (m *mockDepartmentRepo) GetAll(ctx context.Context) ([]*domain.Department, error) {
	return []*domain.Department{}, nil
}
func (m *mockDepartmentRepo) GetByID(ctx context.Context, id string) (*domain.Department, error) {
	return &domain.Department{ID: id}, nil
}
func (m *mockDepartmentRepo) GetByCode(ctx context.Context, code string) (*domain.Department, error) {
	return &domain.Department{DepartmentCode: code}, nil
}

func TestGetMyProjects(t *testing.T) {
	ctx := context.Background()
	expected := []*domain.Project{{ID: "project-1"}, {ID: "project-2"}}
	projectRepo := &mockProjectRepo{createdByProjects: expected}
	uc := NewProjectUseCase(projectRepo, &mockUserRepo{}, &mockDepartmentRepo{}, &mockProgramRepo{})

	projects, err := uc.GetMyProjects(ctx, "staff-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !projectRepo.getByCreatedByCalled {
		t.Fatalf("expected GetByCreatedBy to be called")
	}
	if len(projects) != 2 {
		t.Fatalf("expected 2 projects, got %d", len(projects))
	}
}

func TestGetMyProjects_RejectsBlankUserID(t *testing.T) {
	ctx := context.Background()
	projectRepo := &mockProjectRepo{}
	uc := NewProjectUseCase(projectRepo, &mockUserRepo{}, &mockDepartmentRepo{}, &mockProgramRepo{})

	_, err := uc.GetMyProjects(ctx, "   ")
	if err == nil {
		t.Fatalf("expected error for blank user id")
	}
	if !strings.Contains(err.Error(), "forbidden") {
		t.Fatalf("expected forbidden error, got: %v", err)
	}
}

func TestUpdateProjectApproval_RejectRequiresReviewNotes(t *testing.T) {
	ctx := context.Background()
	projectRepo := &mockProjectRepo{}
	uc := NewProjectUseCase(projectRepo, &mockUserRepo{}, &mockDepartmentRepo{}, &mockProgramRepo{})

	err := uc.UpdateProjectApproval(ctx, "project-1", &domain.UpdateProjectApprovalRequest{
		ApprovalStatus: "rejected",
		ReviewNotes:    nil,
	}, "admin-1", domain.RoleAdmin)
	if err == nil {
		t.Fatalf("expected error for missing review notes")
	}
	if !strings.Contains(err.Error(), "review_notes is required") {
		t.Fatalf("unexpected error: %v", err)
	}
	if projectRepo.updateApprovalCalled {
		t.Fatalf("did not expect UpdateApproval persistence call")
	}
}

func TestProjectHeadPreReview_RejectRequiresReviewNotes(t *testing.T) {
	ctx := context.Background()
	projectRepo := &mockProjectRepo{}
	uc := NewProjectUseCase(projectRepo, &mockUserRepo{}, &mockDepartmentRepo{}, &mockProgramRepo{})

	err := uc.ProjectHeadPreReview(ctx, "project-1", "head-1", &domain.ProjectHeadPreReviewRequest{
		Decision:    "rejected",
		ReviewNotes: nil,
	})
	if err == nil {
		t.Fatalf("expected error for missing review notes")
	}
	if !strings.Contains(err.Error(), "review_notes is required") {
		t.Fatalf("unexpected error: %v", err)
	}
	if projectRepo.projectHeadReviewCalled {
		t.Fatalf("did not expect ProjectHeadPreReview persistence call")
	}
}

func TestUpdateProjectApproval_StaffOriginatedNeedsHeadPreReview(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	projectRepo := &mockProjectRepo{projectByID: &domain.Project{
		ID:             "project-1",
		CreatedBy:      "staff-creator",
		Status:         "pending_approval",
		ApprovalStatus: "pending",
		CreatedAt:      now,
		UpdatedAt:      now,
	}}
	userRepo := &mockUserRepo{users: map[string]*domain.User{
		"staff-creator": {ID: "staff-creator", Role: domain.RoleStaff},
	}}
	uc := NewProjectUseCase(projectRepo, userRepo, &mockDepartmentRepo{}, &mockProgramRepo{})

	err := uc.UpdateProjectApproval(ctx, "project-1", &domain.UpdateProjectApprovalRequest{
		ApprovalStatus: "approved",
	}, "admin-1", domain.RoleAdmin)
	if err == nil {
		t.Fatalf("expected pre-review guard error")
	}
	if !strings.Contains(err.Error(), "project head pre-review is required") {
		t.Fatalf("unexpected error: %v", err)
	}
	if projectRepo.updateApprovalCalled {
		t.Fatalf("did not expect UpdateApproval persistence call")
	}
}

func TestGetProjectsByProgramIDForUser_ProjectHeadForbiddenOutsideAssignedPrograms(t *testing.T) {
	ctx := context.Background()
	projectRepo := &mockProjectRepo{}
	programRepo := &mockProgramRepo{
		visiblePrograms: []*domain.Program{{ID: "program-chair-2"}},
	}
	uc := NewProjectUseCase(projectRepo, &mockUserRepo{}, &mockDepartmentRepo{}, programRepo)

	_, err := uc.GetProjectsByProgramIDForUser(ctx, "program-chair-1", "project-head-2", domain.RoleProjectHead)
	if err == nil {
		t.Fatalf("expected forbidden error")
	}
	if !strings.Contains(err.Error(), "forbidden") {
		t.Fatalf("expected forbidden error, got: %v", err)
	}
}

func TestGetProjectsByProgramIDForUser_ProgramChairForbiddenOnOtherChairProgram(t *testing.T) {
	ctx := context.Background()
	projectRepo := &mockProjectRepo{}
	chairOneID := "chair-1"
	programRepo := &mockProgramRepo{
		programsByID: map[string]*domain.Program{
			"program-chair-1": {ID: "program-chair-1", ProgramChairID: &chairOneID},
		},
	}
	uc := NewProjectUseCase(projectRepo, &mockUserRepo{}, &mockDepartmentRepo{}, programRepo)

	_, err := uc.GetProjectsByProgramIDForUser(ctx, "program-chair-1", "chair-2", domain.RoleProgramChair)
	if err == nil {
		t.Fatalf("expected forbidden error")
	}
	if !strings.Contains(err.Error(), "forbidden") {
		t.Fatalf("expected forbidden error, got: %v", err)
	}
}