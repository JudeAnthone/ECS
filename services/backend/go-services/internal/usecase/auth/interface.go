package auth

import (
	"context"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/dto"
)

// AuthUsecase defines the authentication business logic
type AuthUsecase interface {
	Login(ctx context.Context, req *dto.LoginRequest) (*dto.AuthResponse, error)
	Register(ctx context.Context, req *dto.RegisterRequest) (*dto.AuthResponse, error)
}
