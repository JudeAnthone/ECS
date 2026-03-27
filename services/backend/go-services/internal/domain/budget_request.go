package domain

import "time"

// BudgetRequest represents a budget request made by a project head to a program chair/admin
type BudgetRequest struct {
	ID          string     `json:"id" db:"id"`
	ProjectID   string     `json:"project_id" db:"project_id"`
	RequestedBy string     `json:"requested_by" db:"requested_by"`
	Amount      float64    `json:"amount" db:"amount"`
	Reason      string     `json:"reason" db:"reason"`
	Status      string     `json:"status" db:"status"`
	ReviewedBy  *string    `json:"reviewed_by" db:"reviewed_by"`
	ReviewNotes *string    `json:"review_notes" db:"review_notes"`
	ReviewedAt  *time.Time `json:"reviewed_at" db:"reviewed_at"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}
