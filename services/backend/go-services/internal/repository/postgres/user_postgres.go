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
		INSERT INTO users (username, first_name, last_name, email, password_hash, auth_provider, role, department, contact_number, account_status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		ctx,
		query,
		user.Username,
		user.FirstName,
		user.LastName,
		user.Email,
		user.PasswordHash,
		user.AuthProvider,
		user.Role,
		user.Department,
		user.ContactNumber,
		user.AccountStatus,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, username, first_name, last_name, email, password_hash, auth_provider, google_id, avatar_url,
		       role, department, contact_number, account_status, approved_by, approved_at, is_active, last_active,
		       created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Username,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.PasswordHash,
		&user.AuthProvider,
		&user.GoogleID,
		&user.AvatarURL,
		&user.Role,
		&user.Department,
		&user.ContactNumber,
		&user.AccountStatus,
		&user.ApprovedBy,
		&user.ApprovedAt,
		&user.IsActive,
		&user.LastActive,
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
		SELECT id, username, first_name, last_name, email, password_hash, auth_provider, google_id, avatar_url,
		       role, department, contact_number, account_status, approved_by, approved_at, is_active, last_active,
		       created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Username,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.PasswordHash,
		&user.AuthProvider,
		&user.GoogleID,
		&user.AvatarURL,
		&user.Role,
		&user.Department,
		&user.ContactNumber,
		&user.AccountStatus,
		&user.ApprovedBy,
		&user.ApprovedAt,
		&user.IsActive,
		&user.LastActive,
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
		SET username = $1, first_name = $2, last_name = $3, email = $4, role = $5, department = $6, 
		    contact_number = $7, account_status = $8, avatar_url = $9
		WHERE id = $10
	`

	_, err := r.db.Exec(
		ctx,
		query,
		user.Username,
		user.FirstName,
		user.LastName,
		user.Email,
		user.Role,
		user.Department,
		user.ContactNumber,
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

	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		// Check if it's a foreign key constraint error
		if err.Error() != "" {
			return fmt.Errorf("cannot delete user: user has related records (tasks, reports, or proposals). Please remove or reassign those first, or the system will cascade delete them: %w", err)
		}
		return fmt.Errorf("failed to delete user: %w", err)
	}

	// Check if any rows were affected
	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

func (r *UserRepository) GetAllUsers(ctx context.Context) ([]*domain.User, error) {
	query := `
		SELECT id, username, first_name, last_name, email, password_hash, auth_provider, google_id, avatar_url,
		       role, department, contact_number, account_status, approved_by, approved_at, is_active, last_active,
		       created_at, updated_at
		FROM users
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get all users: %w", err)
	}
	defer rows.Close()

	var users []*domain.User
	for rows.Next() {
		user := &domain.User{}
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.FirstName,
			&user.LastName,
			&user.Email,
			&user.PasswordHash,
			&user.AuthProvider,
			&user.GoogleID,
			&user.AvatarURL,
			&user.Role,
			&user.Department,
			&user.ContactNumber,
			&user.AccountStatus,
			&user.ApprovedBy,
			&user.ApprovedAt,
			&user.IsActive,
			&user.LastActive,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return users, nil
}

func (r *UserRepository) UpdateAccountStatus(ctx context.Context, userID string, status string, approvedByID *string) error {
	query := `
		UPDATE users
		SET account_status = $1::account_status,
		    approved_by = $2,
		    approved_at = CASE WHEN $1::text = 'active' THEN NOW() ELSE NULL END,
		    updated_at = NOW()
		WHERE id = $3
	`

	_, err := r.db.Exec(ctx, query, status, approvedByID, userID)
	if err != nil {
		return fmt.Errorf("failed to update account status: %w", err)
	}

	return nil
}

func (r *UserRepository) GetByUsername(ctx context.Context, username string) (*domain.User, error) {
	query := `
		SELECT id, username, first_name, last_name, email, password_hash, auth_provider, google_id, avatar_url,
		       role, department, contact_number, account_status, approved_by, approved_at, is_active, last_active,
		       created_at, updated_at
		FROM users
		WHERE username = $1
	`

	user := &domain.User{}
	err := r.db.QueryRow(ctx, query, username).Scan(
		&user.ID,
		&user.Username,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.PasswordHash,
		&user.AuthProvider,
		&user.GoogleID,
		&user.AvatarURL,
		&user.Role,
		&user.Department,
		&user.ContactNumber,
		&user.AccountStatus,
		&user.ApprovedBy,
		&user.ApprovedAt,
		&user.IsActive,
		&user.LastActive,
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

func (r *UserRepository) UpdateLastActive(ctx context.Context, userID string) error {
	query := `UPDATE users SET last_active = NOW() WHERE id = $1`
	_, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to update last active: %w", err)
	}
	return nil
}
