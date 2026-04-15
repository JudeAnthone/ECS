package activity

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository"
)

type activityUseCase struct {
	repo repository.ActivityLogRepository
}

func NewActivityUseCase(repo repository.ActivityLogRepository) UseCase {
	return &activityUseCase{repo: repo}
}

func (uc *activityUseCase) CreateActivity(ctx context.Context, actorUserID string, input *CreateActivityInput) (*ActivityLogDTO, error) {
	if strings.TrimSpace(actorUserID) == "" {
		return nil, fmt.Errorf("user id is required")
	}
	if input == nil {
		return nil, fmt.Errorf("activity payload is required")
	}
	if strings.TrimSpace(input.Action) == "" {
		return nil, fmt.Errorf("action is required")
	}

	actionType := strings.ToLower(strings.TrimSpace(input.ActionType))
	switch actionType {
	case "submission", "approval", "upload", "other":
	default:
		actionType = "other"
	}

	entry := &domain.ActivityLog{
		UserID:     actorUserID,
		Action:     strings.TrimSpace(input.Action),
		ActionType: actionType,
		Metadata:   input.Metadata,
	}

	if err := uc.repo.Create(ctx, entry); err != nil {
		return nil, err
	}

	return &ActivityLogDTO{
		ID:             entry.ID,
		UserID:         entry.UserID,
		UserName:       entry.UserName,
		UserAvatarURL:  entry.UserAvatarURL,
		UserRole:       entry.UserRole,
		UserDepartment: entry.UserDepartment,
		Action:         entry.Action,
		ActionType:     entry.ActionType,
		Metadata:       entry.Metadata,
		Timestamp:      entry.Timestamp.Format(time.RFC3339),
	}, nil
}

func (uc *activityUseCase) ListActivities(ctx context.Context, limit int, offset int) ([]*ActivityLogDTO, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	entries, err := uc.repo.List(ctx, limit, offset)
	if err != nil {
		return nil, err
	}

	result := make([]*ActivityLogDTO, 0, len(entries))
	for _, entry := range entries {
		result = append(result, &ActivityLogDTO{
			ID:             entry.ID,
			UserID:         entry.UserID,
			UserName:       entry.UserName,
			UserAvatarURL:  entry.UserAvatarURL,
			UserRole:       entry.UserRole,
			UserDepartment: entry.UserDepartment,
			Action:         entry.Action,
			ActionType:     entry.ActionType,
			Metadata:       entry.Metadata,
			Timestamp:      entry.Timestamp.Format(time.RFC3339),
		})
	}

	return result, nil
}
