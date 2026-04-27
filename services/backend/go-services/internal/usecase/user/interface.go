package user

import (
	"context"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/dto"
)

type UseCase interface {
	GetAllUsers(ctx context.Context) ([]*dto.UserDTO, error)
	GetUsersByRole(ctx context.Context, role string, requesterID string, requesterRole string) ([]*dto.UserDTO, error)
	GetUserByID(ctx context.Context, userID string) (*dto.UserDTO, error)
	ApproveUser(ctx context.Context, userID string, approvedByID string) error
	RejectUser(ctx context.Context, userID string, approvedByID string) error
	DeleteUser(ctx context.Context, userID string) error
	UpdateUser(ctx context.Context, userID string, updates *dto.UpdateUserDTO) error
	UpdateOwnProfile(ctx context.Context, userID string, updates *dto.UpdateOwnProfileDTO) (*dto.UserDTO, error)
	UpdateOwnAvatar(ctx context.Context, userID string, avatarURL *string) (*dto.UserDTO, error)
}
