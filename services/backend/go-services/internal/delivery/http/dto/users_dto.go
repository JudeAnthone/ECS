package dto

// UpdateUserDTO represents the fields that can be updated for a user
type UpdateUserDTO struct {
	Username               *string `json:"username,omitempty"`
	FirstName              *string `json:"first_name,omitempty"`
	LastName               *string `json:"last_name,omitempty"`
	Email                  *string `json:"email,omitempty"`
	Role                   *string `json:"role,omitempty"`
	Department             *string `json:"department,omitempty"`
	AssignedProgramChairID *string `json:"assigned_program_chair_id,omitempty"`
	ContactNumber          *string `json:"contact_number,omitempty"`
	AccountStatus          *string `json:"account_status,omitempty"`
}

// UpdateOwnProfileDTO restricts updates for authenticated self-service profile edits.
type UpdateOwnProfileDTO struct {
	FirstName     *string `json:"first_name,omitempty"`
	LastName      *string `json:"last_name,omitempty"`
	Email         *string `json:"email,omitempty"`
	ContactNumber *string `json:"contact_number,omitempty"`
}
