package dto

// LoginRequest represents the login request body
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// RegisterRequest represents the registration request body
type RegisterRequest struct {
	FirstName string `json:"first_name" validate:"required,min=1,max=75"`
	LastName  string `json:"last_name" validate:"required,min=1,max=75"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	Role      string `json:"role,omitempty"`    // Optional, defaults to public_user
	Section   string `json:"section,omitempty"` // Optional, required for certain roles
}

// AuthResponse represents the authentication response
type AuthResponse struct {
	Token        string   `json:"token"`
	RefreshToken string   `json:"refresh_token,omitempty"`
	User         *UserDTO `json:"user"`
	ExpiresIn    int64    `json:"expires_in"`
}

// UserDTO represents user data in responses
type UserDTO struct {
	ID            string  `json:"id"`
	FirstName     string  `json:"first_name"`
	LastName      string  `json:"last_name"`
	Email         string  `json:"email"`
	Role          string  `json:"role"`
	Section       *string `json:"section,omitempty"`
	AccountStatus string  `json:"account_status"`
	AvatarURL     *string `json:"avatar_url,omitempty"`
	CreatedAt     string  `json:"created_at"`
}
