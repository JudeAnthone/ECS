package user

import (
	"context"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/dto"
)

type UseCase interface {
	GetAllUsers(ctx context.Context) ([]*dto.UserDTO, error)
	ApproveUser(ctx context.Context, userID string, approvedByID string) error
	RejectUser(ctx context.Context, userID string, approvedByID string) error
	DeleteUser(ctx context.Context, userID string) error
}
