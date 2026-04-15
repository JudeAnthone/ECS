package postgres

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ActivityLogRepository struct {
	db *pgxpool.Pool
}

func NewActivityLogRepository(db *pgxpool.Pool) *ActivityLogRepository {
	return &ActivityLogRepository{db: db}
}

func (r *ActivityLogRepository) Create(ctx context.Context, log *domain.ActivityLog) error {
	metadata := log.Metadata
	if metadata == nil {
		metadata = map[string]interface{}{}
	}

	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal activity metadata: %w", err)
	}

	query := `
		INSERT INTO activity_logs (user_id, action, entity_type, details, created_at)
		VALUES ($1, $2, $3, $4::jsonb, NOW())
		RETURNING id, created_at
	`

	err = r.db.QueryRow(ctx, query,
		log.UserID,
		log.Action,
		log.ActionType,
		string(metadataJSON),
	).Scan(&log.ID, &log.Timestamp)
	if err != nil {
		return fmt.Errorf("failed to create activity log: %w", err)
	}

	return nil
}

func (r *ActivityLogRepository) List(ctx context.Context, limit int, offset int) ([]*domain.ActivityLog, error) {
	query := `
		SELECT
			al.id,
			COALESCE(al.user_id::text, ''),
			COALESCE(
				NULLIF(TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')), ''),
				NULLIF(TRIM(al.details->>'actor_user_name'), ''),
				'Unknown User'
			) AS user_name,
			u.avatar_url,
			COALESCE(NULLIF(u.role, ''), NULLIF(al.details->>'actor_user_role', ''), 'unknown') AS user_role,
			COALESCE(
				NULLIF(u.department, ''),
				NULLIF(al.details->>'actor_user_department', ''),
				NULLIF(al.details->>'department', ''),
				'N/A'
			) AS user_department,
			al.action,
			COALESCE(al.entity_type, 'other') AS action_type,
			COALESCE(al.details, '{}'::jsonb) AS metadata,
			al.created_at
		FROM activity_logs al
		LEFT JOIN users u ON u.id = al.user_id
		ORDER BY al.created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list activity logs: %w", err)
	}
	defer rows.Close()

	logs := make([]*domain.ActivityLog, 0)
	for rows.Next() {
		entry := &domain.ActivityLog{}
		var metadataRaw []byte

		err := rows.Scan(
			&entry.ID,
			&entry.UserID,
			&entry.UserName,
			&entry.UserAvatarURL,
			&entry.UserRole,
			&entry.UserDepartment,
			&entry.Action,
			&entry.ActionType,
			&metadataRaw,
			&entry.Timestamp,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan activity log: %w", err)
		}

		if len(metadataRaw) > 0 {
			if err := json.Unmarshal(metadataRaw, &entry.Metadata); err != nil {
				entry.Metadata = map[string]interface{}{}
			}
		} else {
			entry.Metadata = map[string]interface{}{}
		}

		logs = append(logs, entry)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate activity logs: %w", err)
	}

	return logs, nil
}
