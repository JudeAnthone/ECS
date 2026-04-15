package notification

import (
	"context"
	"fmt"
	"time"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/repository"
	"github.com/jackc/pgx/v5"
)

type notificationUseCase struct {
	notificationRepo repository.NotificationRepository
}

func NewNotificationUseCase(notificationRepo repository.NotificationRepository) UseCase {
	return &notificationUseCase{notificationRepo: notificationRepo}
}

func (uc *notificationUseCase) ListNotifications(ctx context.Context, userID string, limit int, offset int, unreadOnly bool) ([]*NotificationDTO, error) {
	if userID == "" {
		return nil, fmt.Errorf("user id is required")
	}
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	items, err := uc.notificationRepo.ListByUser(ctx, userID, limit, offset, unreadOnly)
	if err != nil {
		return nil, fmt.Errorf("failed to list notifications: %w", err)
	}

	result := make([]*NotificationDTO, 0, len(items))
	for _, item := range items {
		result = append(result, &NotificationDTO{
			ID:         item.ID,
			UserID:     item.UserID,
			Title:      item.Title,
			Message:    item.Message,
			Type:       item.Type,
			EntityType: item.EntityType,
			EntityID:   item.EntityID,
			IsRead:     item.IsRead,
			CreatedAt:  item.CreatedAt.Format(time.RFC3339),
		})
	}

	return result, nil
}

func (uc *notificationUseCase) GetUnreadCount(ctx context.Context, userID string) (int, error) {
	if userID == "" {
		return 0, fmt.Errorf("user id is required")
	}
	count, err := uc.notificationRepo.GetUnreadCount(ctx, userID)
	if err != nil {
		return 0, fmt.Errorf("failed to get unread count: %w", err)
	}
	return count, nil
}

func (uc *notificationUseCase) MarkAsRead(ctx context.Context, userID string, notificationID string) error {
	if userID == "" || notificationID == "" {
		return fmt.Errorf("user id and notification id are required")
	}
	if err := uc.notificationRepo.MarkAsRead(ctx, notificationID, userID); err != nil {
		if err == pgx.ErrNoRows {
			return fmt.Errorf("notification not found")
		}
		return fmt.Errorf("failed to mark notification as read: %w", err)
	}
	return nil
}

func (uc *notificationUseCase) MarkAllAsRead(ctx context.Context, userID string) error {
	if userID == "" {
		return fmt.Errorf("user id is required")
	}
	if err := uc.notificationRepo.MarkAllAsRead(ctx, userID); err != nil {
		return fmt.Errorf("failed to mark all notifications as read: %w", err)
	}
	return nil
}

func (uc *notificationUseCase) DeleteNotification(ctx context.Context, userID string, notificationID string) error {
	if userID == "" || notificationID == "" {
		return fmt.Errorf("user id and notification id are required")
	}
	if err := uc.notificationRepo.Delete(ctx, notificationID, userID); err != nil {
		if err == pgx.ErrNoRows {
			return fmt.Errorf("notification not found")
		}
		return fmt.Errorf("failed to delete notification: %w", err)
	}
	return nil
}
