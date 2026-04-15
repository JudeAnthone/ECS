package domain

import "time"

// Notification represents an in-app notification for a specific user.
type Notification struct {
	ID         string    `json:"id" db:"id"`
	UserID     string    `json:"user_id" db:"user_id"`
	Title      string    `json:"title" db:"title"`
	Message    string    `json:"message" db:"message"`
	Type       string    `json:"type" db:"type"`
	EntityType *string   `json:"entity_type,omitempty" db:"entity_type"`
	EntityID   *string   `json:"entity_id,omitempty" db:"entity_id"`
	IsRead     bool      `json:"is_read" db:"is_read"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}
