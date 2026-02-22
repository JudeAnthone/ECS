package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/Xschema-dev/Earist-Extension-Service/internal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	query := `
		INSERT INTO users (first_name, last_name, email, password_hash, auth_provider, role, section, account_status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		user.FirstName,
		user.LastName,
		user.Email,
		user.PasswordHash,
		user.AuthProvider,
		user.Role,
		user.Section,
		user.AccountStatus,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, first_name, last_name, email, password_hash, auth_provider, google_id, avatar_url,
		       role, section, account_status, approved_by, approved_at, is_active,
		       created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.PasswordHash,
		&user.AuthProvider,
		&user.GoogleID,
		&user.AvatarURL,
		&user.Role,
		&user.Section,
		&user.AccountStatus,
		&user.ApprovedBy,
		&user.ApprovedAt,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	query := `
		SELECT id, first_name, last_name, email, password_hash, auth_provider, google_id, avatar_url,
		       role, section, account_status, approved_by, approved_at, is_active,
		       created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.PasswordHash,
		&user.AuthProvider,
		&user.GoogleID,
		&user.AvatarURL,
		&user.Role,
		&user.Section,
		&user.AccountStatus,
		&user.ApprovedBy,
		&user.ApprovedAt,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

func (r *UserRepository) Update(ctx context.Context, user *domain.User) error {
	query := `
		UPDATE users
		SET first_name = $1, last_name = $2, email = $3, role = $4, section = $5, 
		    account_status = $6, avatar_url = $7
		WHERE id = $8
	`

	_, err := r.db.Exec(
		ctx,
		query,
		user.FirstName,
		user.LastName,
		user.Email,
		user.Role,
		user.Section,
		user.AccountStatus,
		user.AvatarURL,
		user.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`

	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return nil
}
