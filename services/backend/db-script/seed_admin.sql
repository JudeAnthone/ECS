-- Drop existing admin user
DELETE FROM users WHERE username = 'admin';

-- Email:admin@extensionservice.com
-- Password: password
INSERT INTO users (
    username,
    first_name,
    last_name,
    email,
    password_hash,
    role,
    account_status
) VALUES (
    'admin',
    'System',
    'Administrator',
    'admin@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'active'
);


-- Verify admin user
SELECT id, username, email, role, account_status, created_at
FROM users
WHERE username = 'admin';