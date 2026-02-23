package domain

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID            string
	Username      string
	FirstName     string
	LastName      string
	Email         string
	PasswordHash  string
	AuthProvider  string
	GoogleID      *string
	AvatarURL     *string
	Role          string
	Department    *string
	ContactNumber *string
	AccountStatus string
	ApprovedBy    *string
	ApprovedAt    *time.Time
	IsActive      bool
	LastActive    *time.Time
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// GetFullName returns the user's full name
func (u *User) GetFullName() string {
	return u.FirstName + " " + u.LastName
}

// UserRole constants
const (
	RoleAdmin        = "admin"
	RoleProgramChair = "program_chair"
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
