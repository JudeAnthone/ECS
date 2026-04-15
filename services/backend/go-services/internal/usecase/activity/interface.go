package activity

import "context"

type UseCase interface {
	CreateActivity(ctx context.Context, actorUserID string, input *CreateActivityInput) (*ActivityLogDTO, error)
	ListActivities(ctx context.Context, limit int, offset int) ([]*ActivityLogDTO, error)
}

type CreateActivityInput struct {
	Action     string                 `json:"action"`
	ActionType string                 `json:"action_type"`
	Metadata   map[string]interface{} `json:"metadata"`
}

type ActivityLogDTO struct {
	ID             string                 `json:"id"`
	UserID         string                 `json:"user_id"`
	UserName       string                 `json:"user_name"`
	UserAvatarURL  *string                `json:"user_avatar_url,omitempty"`
	UserRole       string                 `json:"user_role"`
	UserDepartment string                 `json:"user_department"`
	Action         string                 `json:"action"`
	ActionType     string                 `json:"action_type"`
	Metadata       map[string]interface{} `json:"metadata,omitempty"`
	Timestamp      string                 `json:"timestamp"`
}
