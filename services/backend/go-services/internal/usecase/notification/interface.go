package notification

import "context"

type UseCase interface {
	ListNotifications(ctx context.Context, userID string, limit int, offset int, unreadOnly bool) ([]*NotificationDTO, error)
	GetUnreadCount(ctx context.Context, userID string) (int, error)
	MarkAsRead(ctx context.Context, userID string, notificationID string) error
	MarkAllAsRead(ctx context.Context, userID string) error
	DeleteNotification(ctx context.Context, userID string, notificationID string) error
}

type NotificationDTO struct {
	ID         string  `json:"id"`
	UserID     string  `json:"user_id"`
	Title      string  `json:"title"`
	Message    string  `json:"message"`
	Type       string  `json:"type"`
	EntityType *string `json:"entity_type,omitempty"`
	EntityID   *string `json:"entity_id,omitempty"`
	IsRead     bool    `json:"is_read"`
	CreatedAt  string  `json:"created_at"`
}
