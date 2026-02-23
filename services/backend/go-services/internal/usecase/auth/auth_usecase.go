package auth

import (
	"context"
	"fmt"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/config"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/dto"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/pkg/hash"
	jwtutil "github.com/Xschema-dev/Earist-Extension-Service/internal/pkg/jwt"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository"
)

type authUsecase struct {
	userRepo repository.UserRepository
	config   *config.Config
}

func NewAuthUsecase(userRepo repository.UserRepository, cfg *config.Config) AuthUsecase {
	return &authUsecase{
		userRepo: userRepo,
		config:   cfg,
	}
}

func (u *authUsecase) Login(ctx context.Context, req *dto.LoginRequest) (*dto.AuthResponse, error) {
	// Get user by email
	user, err := u.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	// Check password
	if !hash.CheckPasswordHash(req.Password, user.PasswordHash) {
		return nil, fmt.Errorf("invalid email or password")
	}

	// Check if account is active
	if user.AccountStatus != domain.AccountActive {
		return nil, fmt.Errorf("account is not active. Status: %s", user.AccountStatus)
	}

	// Update last active timestamp (use background context to avoid cancellation)
	go u.userRepo.UpdateLastActive(context.Background(), user.ID)

	// Generate JWT token
	token, expiresIn, err := jwtutil.GenerateToken(
		user.ID,
		user.Email,
		user.Role,
		user.AccountStatus,
		u.config.JWT.Secret,
		24, // 24 hours
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	// Build response
	return &dto.AuthResponse{
		Token:     token,
		ExpiresIn: expiresIn,
		User: &dto.UserDTO{
			ID:            user.ID,
			Username:      user.Username,
			FirstName:     user.FirstName,
			LastName:      user.LastName,
			Email:         user.Email,
			Role:          user.Role,
			Department:    user.Department,
			ContactNumber: user.ContactNumber,
			AccountStatus: user.AccountStatus,
			AvatarURL:     user.AvatarURL,
			CreatedAt:     user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		},
	}, nil
}

func (u *authUsecase) Register(ctx context.Context, req *dto.RegisterRequest) (*dto.AuthResponse, error) {
	// Check if user already exists by email
	existingUser, _ := u.userRepo.GetByEmail(ctx, req.Email)
	if existingUser != nil {
		return nil, fmt.Errorf("user with this email already exists")
	}

	// Check if username already exists
	existingUsername, _ := u.userRepo.GetByUsername(ctx, req.Username)
	if existingUsername != nil {
		return nil, fmt.Errorf("username is already taken")
	}

	// Hash password
	hashedPassword, err := hash.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Determine role (default to public_user)
	role := req.Role
	if role == "" {
		role = domain.RolePublicUser
	}

	// Create user
	user := &domain.User{
		Username:      req.Username,
		FirstName:     req.FirstName,
		LastName:      req.LastName,
		Email:         req.Email,
		PasswordHash:  hashedPassword,
		AuthProvider:  domain.AuthProviderLocal,
		Role:          role,
		Department:    req.Department,
		ContactNumber: req.ContactNumber,
		AccountStatus: domain.AccountPendingApproval,
	}

	// Save user to database
	if err := u.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// For pending approval users, don't generate token
	if user.AccountStatus == domain.AccountPendingApproval {
		return &dto.AuthResponse{
			User: &dto.UserDTO{
				ID:            user.ID,
				Username:      user.Username,
				FirstName:     user.FirstName,
				LastName:      user.LastName,
				Email:         user.Email,
				Role:          user.Role,
				Department:    user.Department,
				ContactNumber: user.ContactNumber,
				AccountStatus: user.AccountStatus,
				CreatedAt:     user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			},
		}, nil
	}

	// Generate JWT token for active users
	token, expiresIn, err := jwtutil.GenerateToken(
		user.ID,
		user.Email,
		user.Role,
		user.AccountStatus,
		u.config.JWT.Secret,
		24,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &dto.AuthResponse{
		Token:     token,
		ExpiresIn: expiresIn,
		User: &dto.UserDTO{
			ID:            user.ID,
			Username:      user.Username,
			FirstName:     user.FirstName,
			LastName:      user.LastName,
			Email:         user.Email,
			Role:          user.Role,
			Department:    user.Department,
			ContactNumber: user.ContactNumber,
			AccountStatus: user.AccountStatus,
			CreatedAt:     user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		},
	}, nil
}
