package user

import (
	"context"
	"fmt"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/dto"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository"
)

type userUseCase struct {
	userRepo repository.UserRepository
}

func NewUserUseCase(userRepo repository.UserRepository) UseCase {
	return &userUseCase{
		userRepo: userRepo,
	}
}

func (uc *userUseCase) GetAllUsers(ctx context.Context) ([]*dto.UserDTO, error) {
	users, err := uc.userRepo.GetAllUsers(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get all users: %w", err)
	}

	userDTOs := make([]*dto.UserDTO, 0, len(users))
	for _, user := range users {
		userDTOs = append(userDTOs, &dto.UserDTO{
			ID:            user.ID,
			FirstName:     user.FirstName,
			LastName:      user.LastName,
			Email:         user.Email,
			Role:          user.Role,
			Section:       user.Section,
			AccountStatus: user.AccountStatus,
			AvatarURL:     user.AvatarURL,
			CreatedAt:     user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	return userDTOs, nil
}

func (uc *userUseCase) ApproveUser(ctx context.Context, userID string, approvedByID string) error {
	// Verify the user exists
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Check if user is pending approval
	if user.AccountStatus != "pending_approval" {
		return fmt.Errorf("user is not pending approval")
	}

	// Update status to active
	err = uc.userRepo.UpdateAccountStatus(ctx, userID, "active", &approvedByID)
	if err != nil {
		return fmt.Errorf("failed to approve user: %w", err)
	}

	return nil
}

func (uc *userUseCase) RejectUser(ctx context.Context, userID string, approvedByID string) error {
	// Verify the user exists
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Check if user is pending approval
	if user.AccountStatus != "pending_approval" {
		return fmt.Errorf("user is not pending approval")
	}

	// Update status to rejected
	err = uc.userRepo.UpdateAccountStatus(ctx, userID, "rejected", &approvedByID)
	if err != nil {
		return fmt.Errorf("failed to reject user: %w", err)
	}

	return nil
}

func (uc *userUseCase) DeleteUser(ctx context.Context, userID string) error {
	// Verify the user exists
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Prevent deleting admin users
	if user.Role == "admin" {
		return fmt.Errorf("cannot delete admin users")
	}

	// Delete the user
	err = uc.userRepo.Delete(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return nil
}
