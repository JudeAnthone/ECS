package domain

import "time"

// StaffTaskProjectSummary represents a staff-scoped project summary with task counts.
type StaffTaskProjectSummary struct {
	ProjectID       string     `json:"project_id"`
	ProjectName     string     `json:"project_name"`
	DepartmentName  string     `json:"department_name"`
	Status          string     `json:"status"`
	DateAssigned    time.Time  `json:"date_assigned"`
	Deadline        *time.Time `json:"deadline"`
	BudgetAllocated *float64   `json:"budget_allocated"`
	Progress        int        `json:"progress"`
	Description     *string    `json:"description"`
	TotalTasks      int        `json:"total_tasks"`
	CompletedTasks  int        `json:"completed_tasks"`
	OngoingTasks    int        `json:"ongoing_tasks"`
	NotStartedTasks int        `json:"not_started_tasks"`
	CancelledTasks  int        `json:"cancelled_tasks"`
}

// CreateProjectTaskRequest represents task creation payload from project management UI.
type CreateProjectTaskRequest struct {
	Title       string   `json:"title"`
	Description *string  `json:"description"`
	AssigneeIDs []string `json:"assignee_ids"`
	Priority    string   `json:"priority"`
	DueDate     *string  `json:"due_date"`
}

// ProjectTask represents a task record for project management views.
type ProjectTask struct {
	ID          string     `json:"id"`
	ProjectID   string     `json:"project_id"`
	Title       string     `json:"title"`
	Description *string    `json:"description"`
	AssigneeIDs []string   `json:"assignee_ids"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	DueDate     *time.Time `json:"due_date"`
	CreatedAt   time.Time  `json:"created_at"`
}

// UpdateProjectTaskStatusRequest updates project task lifecycle status.
type UpdateProjectTaskStatusRequest struct {
	Status string `json:"status"`
}

// StaffTask represents a single task visible to a staff member.
type StaffTask struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description *string    `json:"description"`
	ProjectID   string     `json:"project_id"`
	ProjectName string     `json:"project_name"`
	DateGiven   time.Time  `json:"date_given"`
	Deadline    *time.Time `json:"deadline"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
}

// UpdateStaffTaskStatusRequest updates task status by assigned staff.
type UpdateStaffTaskStatusRequest struct {
	Status string `json:"status"`
}
