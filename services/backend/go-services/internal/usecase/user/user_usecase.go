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
		var lastActive *string
		if user.LastActive != nil {
			formatted := user.LastActive.Format("2006-01-02T15:04:05Z07:00")
			lastActive = &formatted
		}

		userDTOs = append(userDTOs, &dto.UserDTO{
			ID:                     user.ID,
			Username:               user.Username,
			FirstName:              user.FirstName,
			LastName:               user.LastName,
			Email:                  user.Email,
			Role:                   user.Role,
			Department:             user.Department,
			AssignedProgramChairID: user.AssignedProgramChairID,
			ContactNumber:          user.ContactNumber,
			AccountStatus:          user.AccountStatus,
			AvatarURL:              user.AvatarURL,
			LastActive:             lastActive,
			CreatedAt:              user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
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

	if (user.Role == "project_head" || user.Role == "staff") && user.AssignedProgramChairID == nil {
		return fmt.Errorf("project_head and staff users must be assigned to a program chair before approval")
	}

	if user.Role == "program_chair" {
		chairs, err := uc.userRepo.GetUsersByRole(ctx, "program_chair")
		if err != nil {
			return fmt.Errorf("failed to validate program chair limit: %w", err)
		}
		if len(chairs) >= 3 {
			return fmt.Errorf("program chair limit reached: only 3 program chairs can be active")
		}
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

func (uc *userUseCase) UpdateUser(ctx context.Context, userID string, updates *dto.UpdateUserDTO) error {
	// Verify the user exists
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Check if username is being changed and if it's already taken
	if updates.Username != nil && *updates.Username != user.Username {
		existingUser, _ := uc.userRepo.GetByUsername(ctx, *updates.Username)
		if existingUser != nil && existingUser.ID != userID {
			return fmt.Errorf("username is already taken")
		}
		user.Username = *updates.Username
	}

	// Check if email is being changed and if it's already taken
	if updates.Email != nil && *updates.Email != user.Email {
		existingUser, _ := uc.userRepo.GetByEmail(ctx, *updates.Email)
		if existingUser != nil && existingUser.ID != userID {
			return fmt.Errorf("email is already taken")
		}
		user.Email = *updates.Email
	}

	// Update fields if provided
	if updates.FirstName != nil {
		user.FirstName = *updates.FirstName
	}
	if updates.LastName != nil {
		user.LastName = *updates.LastName
	}

	// Process department BEFORE role to avoid constraint violations
	if updates.Department != nil {
		if *updates.Department == "" {
			user.Department = nil
		} else {
			user.Department = updates.Department
		}
	}

	if updates.Role != nil {
		newRole := *updates.Role
		if newRole == "program_chair" && user.Role != "program_chair" {
			chairs, err := uc.userRepo.GetUsersByRole(ctx, "program_chair")
			if err != nil {
				return fmt.Errorf("failed to validate program chair limit: %w", err)
			}
			if len(chairs) >= 3 {
				return fmt.Errorf("program chair limit reached: only 3 program chairs can be active")
			}
		}
		user.Role = newRole

		if newRole == "admin" || newRole == "program_chair" || newRole == "public_user" {
			user.AssignedProgramChairID = nil
		}

		// Handle department constraints based on role
		if newRole == "admin" || newRole == "public_user" {
			// Admin and public_user don't need department
			user.Department = nil
		} else if newRole == "program_chair" || newRole == "project_head" || newRole == "staff" {
			// These roles MUST have department
			if user.Department == nil {
				return fmt.Errorf("program_chair, project_head, and staff roles require department to be set")
			}
		}
	}

	if updates.ContactNumber != nil {
		if *updates.ContactNumber == "" {
			user.ContactNumber = nil
		} else {
			user.ContactNumber = updates.ContactNumber
		}
	}

	if updates.AssignedProgramChairID != nil {
		if *updates.AssignedProgramChairID == "" {
			user.AssignedProgramChairID = nil
		} else {
			if user.Role != "project_head" && user.Role != "staff" {
				return fmt.Errorf("only project_head and staff users can be assigned to a program chair")
			}
			chair, err := uc.userRepo.GetByID(ctx, *updates.AssignedProgramChairID)
			if err != nil {
				return fmt.Errorf("failed to validate assigned program chair: %w", err)
			}
			if chair.Role != "program_chair" {
				return fmt.Errorf("assigned_program_chair_id must reference a user with role program_chair")
			}
			user.AssignedProgramChairID = updates.AssignedProgramChairID
		}
	}
	if updates.AccountStatus != nil {
		if *updates.AccountStatus == "active" && user.AccountStatus != "active" && user.Role == "program_chair" {
			chairs, err := uc.userRepo.GetUsersByRole(ctx, "program_chair")
			if err != nil {
				return fmt.Errorf("failed to validate program chair limit: %w", err)
			}
			if len(chairs) >= 3 {
				return fmt.Errorf("program chair limit reached: only 3 program chairs can be active")
			}
		}
		user.AccountStatus = *updates.AccountStatus
	}

	if user.AccountStatus == "active" && (user.Role == "project_head" || user.Role == "staff") && user.AssignedProgramChairID == nil {
		return fmt.Errorf("active project_head and staff users must be assigned to a program chair")
	}

	// Update the user
	err = uc.userRepo.Update(ctx, user)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}

// GetUsersByRole returns active users filtered by role as UserDTOs
func (uc *userUseCase) GetUsersByRole(ctx context.Context, role string) ([]*dto.UserDTO, error) {
	users, err := uc.userRepo.GetUsersByRole(ctx, role)
	if err != nil {
		return nil, fmt.Errorf("failed to get users by role: %w", err)
	}
	var result []*dto.UserDTO
	for _, u := range users {
		result = append(result, &dto.UserDTO{
			ID:                     u.ID,
			Username:               u.Username,
			FirstName:              u.FirstName,
			LastName:               u.LastName,
			Email:                  u.Email,
			Role:                   u.Role,
			Department:             u.Department,
			AssignedProgramChairID: u.AssignedProgramChairID,
		})
	}
	if result == nil {
		result = []*dto.UserDTO{}
	}
	return result, nil
}
