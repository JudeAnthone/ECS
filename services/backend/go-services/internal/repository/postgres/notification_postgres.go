package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type notificationRepository struct {
	db *pgxpool.Pool
}

func NewNotificationRepository(db *pgxpool.Pool) *notificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) ListByUser(ctx context.Context, userID string, limit int, offset int, unreadOnly bool) ([]*domain.Notification, error) {
	query := `
		SELECT id::text, user_id::text, title, message, type,
			NULLIF(entity_type, ''), NULLIF(entity_id::text, ''), is_read, created_at
		FROM notifications
		WHERE user_id = $1
	`
	args := []interface{}{userID}
	if unreadOnly {
		query += ` AND is_read = false`
	}
	query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query notifications: %w", err)
	}
	defer rows.Close()

	items := make([]*domain.Notification, 0)
	for rows.Next() {
		var item domain.Notification
		if err := rows.Scan(
			&item.ID,
			&item.UserID,
			&item.Title,
			&item.Message,
			&item.Type,
			&item.EntityType,
			&item.EntityID,
			&item.IsRead,
			&item.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan notification: %w", err)
		}
		items = append(items, &item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed while reading notifications: %w", err)
	}

	return items, nil
}

func (r *notificationRepository) GetUnreadCount(ctx context.Context, userID string) (int, error) {
	var count int
	if err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`, userID).Scan(&count); err != nil {
		return 0, fmt.Errorf("failed to count unread notifications: %w", err)
	}
	return count, nil
}

func (r *notificationRepository) MarkAsRead(ctx context.Context, notificationID string, userID string) error {
	result, err := r.db.Exec(ctx, `
		UPDATE notifications
		SET is_read = true
		WHERE id = $1::uuid AND user_id = $2::uuid
	`, notificationID, userID)
	if err != nil {
		return fmt.Errorf("failed to mark notification as read: %w", err)
	}
	if result.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *notificationRepository) MarkAllAsRead(ctx context.Context, userID string) error {
	if _, err := r.db.Exec(ctx, `UPDATE notifications SET is_read = true WHERE user_id = $1::uuid AND is_read = false`, userID); err != nil {
		return fmt.Errorf("failed to mark all notifications as read: %w", err)
	}
	return nil
}

func (r *notificationRepository) Delete(ctx context.Context, notificationID string, userID string) error {
	result, err := r.db.Exec(ctx, `
		DELETE FROM notifications
		WHERE id = $1::uuid AND user_id = $2::uuid
	`, notificationID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete notification: %w", err)
	}
	if result.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *notificationRepository) Create(ctx context.Context, notification *domain.Notification) error {
	if notification == nil {
		return fmt.Errorf("notification payload is required")
	}

	var entityType interface{}
	if notification.EntityType != nil {
		trimmed := strings.TrimSpace(*notification.EntityType)
		if trimmed != "" {
			entityType = trimmed
		}
	}

	var entityID interface{}
	if notification.EntityID != nil {
		trimmed := strings.TrimSpace(*notification.EntityID)
		if trimmed != "" {
			entityID = trimmed
		}
	}

	if _, err := r.db.Exec(ctx, `
		INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, is_read)
		VALUES ($1::uuid, $2, $3, $4, $5, $6, COALESCE($7, false))
	`, notification.UserID, notification.Title, notification.Message, notification.Type, entityType, entityID, notification.IsRead); err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}
	return nil
}
