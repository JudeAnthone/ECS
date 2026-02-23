package repository

import (
	"context"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
)

// UserRepository defines methods for user data access
type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByID(ctx context.Context, id string) (*domain.User, error)
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	GetByUsername(ctx context.Context, username string) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id string) error
	GetAllUsers(ctx context.Context) ([]*domain.User, error)
	UpdateAccountStatus(ctx context.Context, userID string, status string, approvedByID *string) error
	UpdateLastActive(ctx context.Context, userID string) error
}
