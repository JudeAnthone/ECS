package domain

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID            string
	FullName      string
	Email         string
	PasswordHash  string
	AuthProvider  string
	GoogleID      *string
	AvatarURL     *string
	Role          string
	Section       *string
	AccountStatus string
	ApprovedBy    *string
	ApprovedAt    *time.Time
	IsActive      bool
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// UserRole constants
const (
	RoleAdmin        = "admin"
	RoleProjectChair = "project_chair"
	RoleProjectHead  = "project_head"
	RoleStaff        = "staff"
	RolePublicUser   = "public_user"
)

// AccountStatus constants
const (
	AccountPendingApproval = "pending_approval"
	AccountActive          = "active"
	AccountRejected        = "rejected"
	AccountDeactivated     = "deactivated"
)

// AuthProvider constants
const (
	AuthProviderLocal  = "local"
	AuthProviderGoogle = "google"
)
