package user

import (
	"context"
	"fmt"
	"strings"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/delivery/http/dto"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
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

func toUserDTO(user *domain.User) *dto.UserDTO {
	if user == nil {
		return nil
	}

	var lastActive *string
	if user.LastActive != nil {
		formatted := user.LastActive.Format("2006-01-02T15:04:05Z07:00")
		lastActive = &formatted
	}

	return &dto.UserDTO{
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
	}
}

func normalizeDepartmentValue(value *string) string {
	if value == nil {
		return ""
	}
	return strings.ToLower(strings.TrimSpace(*value))
}

func chairIDValue(user *domain.User) string {
	if user == nil || user.AssignedProgramChairID == nil {
		return ""
	}
	return strings.TrimSpace(*user.AssignedProgramChairID)
}

func (uc *userUseCase) GetAllUsers(ctx context.Context) ([]*dto.UserDTO, error) {
	users, err := uc.userRepo.GetAllUsers(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get all users: %w", err)
	}

	userDTOs := make([]*dto.UserDTO, 0, len(users))
	for _, user := range users {
		userDTOs = append(userDTOs, toUserDTO(user))
	}

	return userDTOs, nil
}

func (uc *userUseCase) GetUserByID(ctx context.Context, userID string) (*dto.UserDTO, error) {
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return toUserDTO(user), nil
}

func (uc *userUseCase) GetUsersByRole(ctx context.Context, role string, requesterID string, requesterRole string) ([]*dto.UserDTO, error) {
	targetRole := strings.TrimSpace(strings.ToLower(role))
	if targetRole == "" {
		return nil, fmt.Errorf("role is required")
	}

	users, err := uc.userRepo.GetUsersByRole(ctx, targetRole)
	if err != nil {
		return nil, fmt.Errorf("failed to get users by role: %w", err)
	}

	if requesterRole == domain.RoleAdmin {
		userDTOs := make([]*dto.UserDTO, 0, len(users))
		for _, user := range users {
			userDTOs = append(userDTOs, toUserDTO(user))
		}
		return userDTOs, nil
	}

	if strings.TrimSpace(requesterID) == "" {
		return nil, fmt.Errorf("requester id is required")
	}

	requester, err := uc.userRepo.GetByID(ctx, requesterID)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve requesting user: %w", err)
	}

	filtered := make([]*domain.User, 0, len(users))
	appendIfMatch := func(candidate *domain.User) {
		if candidate != nil {
			filtered = append(filtered, candidate)
		}
	}

	switch requesterRole {
	case domain.RoleProgramChair:
		switch targetRole {
		case domain.RoleProgramChair:
			for _, candidate := range users {
				if candidate.ID == requesterID {
					appendIfMatch(candidate)
				}
			}
		case domain.RoleProjectHead, domain.RoleStaff:
			for _, candidate := range users {
				if chairIDValue(candidate) == requesterID {
					appendIfMatch(candidate)
				}
			}
		}
	case domain.RoleProjectHead:
		switch targetRole {
		case domain.RoleProgramChair:
			requiredChairID := chairIDValue(requester)
			for _, candidate := range users {
				if candidate.ID == requiredChairID {
					appendIfMatch(candidate)
				}
			}
		case domain.RoleProjectHead:
			for _, candidate := range users {
				if candidate.ID == requesterID {
					appendIfMatch(candidate)
				}
			}
		case domain.RoleStaff:
			requiredChairID := chairIDValue(requester)
			requiredDepartment := normalizeDepartmentValue(requester.Department)
			for _, candidate := range users {
				if requiredChairID != "" && chairIDValue(candidate) != requiredChairID {
					continue
				}
				if requiredDepartment != "" && normalizeDepartmentValue(candidate.Department) != requiredDepartment {
					continue
				}
				appendIfMatch(candidate)
			}
		}
	case domain.RoleStaff:
		switch targetRole {
		case domain.RoleProgramChair:
			requiredChairID := chairIDValue(requester)
			for _, candidate := range users {
				if candidate.ID == requiredChairID {
					appendIfMatch(candidate)
				}
			}
		case domain.RoleProjectHead:
			requiredChairID := chairIDValue(requester)
			requiredDepartment := normalizeDepartmentValue(requester.Department)
			for _, candidate := range users {
				if requiredChairID != "" && chairIDValue(candidate) != requiredChairID {
					continue
				}
				if requiredDepartment != "" && normalizeDepartmentValue(candidate.Department) != requiredDepartment {
					continue
				}
				appendIfMatch(candidate)
			}
		case domain.RoleStaff:
			for _, candidate := range users {
				if candidate.ID == requesterID {
					appendIfMatch(candidate)
				}
			}
		}
	}

	userDTOs := make([]*dto.UserDTO, 0, len(filtered))
	for _, user := range filtered {
		userDTOs = append(userDTOs, toUserDTO(user))
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

func (uc *userUseCase) UpdateOwnAvatar(ctx context.Context, userID string, avatarURL *string) (*dto.UserDTO, error) {
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	user.AvatarURL = avatarURL
	if err := uc.userRepo.Update(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to update avatar: %w", err)
	}
	updatedUser, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to load updated user: %w", err)
	}
	return toUserDTO(updatedUser), nil
}

func (uc *userUseCase) UpdateOwnProfile(ctx context.Context, userID string, updates *dto.UpdateOwnProfileDTO) (*dto.UserDTO, error) {
	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	if updates.FirstName != nil {
		trimmed := strings.TrimSpace(*updates.FirstName)
		if trimmed == "" {
			return nil, fmt.Errorf("first_name cannot be empty")
		}
		user.FirstName = trimmed
	}

	if updates.LastName != nil {
		trimmed := strings.TrimSpace(*updates.LastName)
		if trimmed == "" {
			return nil, fmt.Errorf("last_name cannot be empty")
		}
		user.LastName = trimmed
	}

	if updates.Email != nil {
		email := strings.TrimSpace(*updates.Email)
		if email == "" {
			return nil, fmt.Errorf("email cannot be empty")
		}
		if email != user.Email {
			existingUser, _ := uc.userRepo.GetByEmail(ctx, email)
			if existingUser != nil && existingUser.ID != userID {
				return nil, fmt.Errorf("email is already taken")
			}
		}
		user.Email = email
	}

	if updates.ContactNumber != nil {
		contact := strings.TrimSpace(*updates.ContactNumber)
		if contact == "" {
			user.ContactNumber = nil
		} else {
			user.ContactNumber = &contact
		}
	}

	if err := uc.userRepo.Update(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to update user profile: %w", err)
	}

	updatedUser, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to load updated user: %w", err)
	}

	return toUserDTO(updatedUser), nil
}
