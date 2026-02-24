package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/pkg/jwt"
)

func jsonError(w http.ResponseWriter, message string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// AuthMiddleware validates JWT tokens and extracts user information
func AuthMiddleware(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				jsonError(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			// Extract token from "Bearer <token>"
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				jsonError(w, "Invalid authorization header format", http.StatusUnauthorized)
				return
			}

			tokenString := parts[1]

			// Validate token
			claims, err := jwt.ValidateToken(tokenString, jwtSecret)
			if err != nil {
				jsonError(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}

			// Add user information to context
			ctx := context.WithValue(r.Context(), "user_id", claims.UserID)
			ctx = context.WithValue(ctx, "email", claims.Email)
			ctx = context.WithValue(ctx, "role", claims.Role)
			ctx = context.WithValue(ctx, "account_status", claims.AccountStatus)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// AdminOnlyMiddleware ensures only admin users can access the endpoint
func AdminOnlyMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		role, ok := r.Context().Value("role").(string)
		if !ok || role != "admin" {
			jsonError(w, "Admin access required", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// RequireRolesMiddleware allows access to any of the specified roles
func RequireRolesMiddleware(roles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]bool, len(roles))
	for _, r := range roles {
		allowed[r] = true
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := r.Context().Value("role").(string)
			if !ok || !allowed[role] {
				jsonError(w, "Access denied", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
