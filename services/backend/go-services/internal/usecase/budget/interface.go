package budget

import "context"

type UseCase interface {
	GetTotalBudget(ctx context.Context) (float64, error)
	GetAllBudgetRequests(ctx context.Context, role string, userID string) ([]*BudgetRequestDTO, error)
	CreateBudgetRequest(ctx context.Context, requestedBy string, role string, input *CreateBudgetRequestInput) (*BudgetRequestDTO, error)
	ReviewBudgetRequest(ctx context.Context, id string, reviewerID string, role string, input *ReviewBudgetRequestInput) (*BudgetRequestDTO, error)
	DeleteBudgetRequest(ctx context.Context, id string, userID string, role string) error
	GetProjectHeadStaffBudgetDocuments(ctx context.Context, userID string, role string) ([]*BudgetSupportDocumentDTO, error)
	GetProgramChairBudgets(ctx context.Context, chairID *string) ([]*ProgramChairBudgetDTO, error)
	SetProgramChairBudget(ctx context.Context, chairID string, allocatedBudget float64) (*ProgramChairBudgetDTO, error)
	GetChairDepartmentBudgets(ctx context.Context, chairID *string, departmentID *string) ([]*ChairDepartmentBudgetDTO, error)
	SetChairDepartmentBudget(ctx context.Context, chairID string, departmentID string, allocatedBudget float64) (*ChairDepartmentBudgetDTO, error)
	DeleteChairDepartmentBudget(ctx context.Context, chairID string, departmentID string) error
}

// BudgetRequestDTO is a lightweight DTO for handlers
type BudgetRequestDTO struct {
	ID               string  `json:"id"`
	ProjectID        string  `json:"project_id"`
	ProjectName      string  `json:"project_name"`
	DepartmentID     string  `json:"department_id"`
	DepartmentName   string  `json:"department_name"`
	DepartmentAllocatedBudget float64 `json:"department_allocated_budget"`
	DepartmentSpentBudget float64 `json:"department_spent_budget"`
	DepartmentRemainingBudget float64 `json:"department_remaining_budget"`
	RequestedBy      string  `json:"requested_by"`
	RequestedByName  string  `json:"requested_by_name"`
	Amount           float64 `json:"amount"`
	Reason           string  `json:"reason"`
	NeededByDate     string  `json:"needed_by_date"`
	Status           string  `json:"status"`
	WorkflowStage    string  `json:"workflow_stage"`
	DocumentURL      string  `json:"document_url"`
	DocumentName     string  `json:"document_name"`
	ReviewedBy       string  `json:"reviewed_by"`
	ReviewedByName   string  `json:"reviewed_by_name"`
	ReviewNotes      string  `json:"review_notes"`
	ReviewedAt       string  `json:"reviewed_at"`
	ChairSlipNumber  string  `json:"chair_slip_number"`
	ChairSlipGeneratedAt string `json:"chair_slip_generated_at"`
	CreatedAt        string  `json:"created_at"`
}

type CreateBudgetRequestInput struct {
	ProjectID       string  `json:"project_id"`
	Amount          float64 `json:"amount"`
	Reason          string  `json:"reason"`
	NeededByDate    *string `json:"needed_by_date"`
	DocumentURL     string  `json:"document_url"`
	DocumentName    string  `json:"document_name"`
}

type ReviewBudgetRequestInput struct {
	ApprovalStatus string  `json:"approval_status"`
	ReviewNotes    *string `json:"review_notes"`
}

type BudgetSupportDocumentDTO struct {
	ID             string `json:"id"`
	ProjectID      string `json:"project_id"`
	ProjectName    string `json:"project_name"`
	DocumentType   string `json:"document_type"`
	Title          string `json:"title"`
	FileURL        string `json:"file_url"`
	UploadedByName string `json:"uploaded_by_name"`
	CreatedAt      string `json:"created_at"`
}

type ProgramChairBudgetDTO struct {
	ID              string  `json:"id"`
	ChairID         string  `json:"chair_id"`
	ChairFirstName  string  `json:"chair_first_name"`
	ChairLastName   string  `json:"chair_last_name"`
	AllocatedBudget float64 `json:"allocated_budget"`
	SpentBudget     float64 `json:"spent_budget"`
	RemainingBudget float64 `json:"remaining_budget"`
	UpdatedAt       string  `json:"updated_at"`
}

type ChairDepartmentBudgetDTO struct {
	ID              string  `json:"id"`
	ChairID         string  `json:"chair_id"`
	ChairFirstName  string  `json:"chair_first_name"`
	ChairLastName   string  `json:"chair_last_name"`
	DepartmentID    string  `json:"department_id"`
	DepartmentName  string  `json:"department_name"`
	AllocatedBudget float64 `json:"allocated_budget"`
	SpentBudget     float64 `json:"spent_budget"`
	RemainingBudget float64 `json:"remaining_budget"`
	UpdatedAt       string  `json:"updated_at"`
}
