package domain

import "time"

// ActivityLog represents an audit activity entry shown in admin recent activity.
type ActivityLog struct {
	ID             string                 `json:"id"`
	UserID         string                 `json:"user_id"`
	UserName       string                 `json:"user_name"`
	UserAvatarURL  *string                `json:"user_avatar_url,omitempty"`
	UserRole       string                 `json:"user_role"`
	UserDepartment string                 `json:"user_department"`
	Action         string                 `json:"action"`
	ActionType     string                 `json:"action_type"`
	Metadata       map[string]interface{} `json:"metadata,omitempty"`
	Timestamp      time.Time              `json:"timestamp"`
}
