-- Drop existing admin user
DELETE FROM users WHERE username = 'admin';

-- Drop existing users for other roles
DELETE FROM users WHERE username = 'programchair';
DELETE FROM users WHERE username = 'publicuser';
DELETE FROM users WHERE username = 'projecthead';
DELETE FROM users WHERE username = 'departmentstaff';

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

INSERT INTO users (
    username,
    first_name,
    last_name,
    email,
    password_hash,
    role,
    account_status
) VALUES (
    'programchair',
    'Program',
    'Chair',
    'programchair@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'program_chair',
    'active'
);


INSERT INTO users (
    username,
    first_name,
    last_name,
    email,
    password_hash,
    role,
    account_status
) VALUES (
    'publicuser',
    'Public',
    'User',
    'publicuser@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'public_user',
    'active'
);


INSERT INTO users (
    username,
    first_name,
    last_name,
    email,
    password_hash,
    role,
    department,
    account_status
) VALUES (
    'projecthead',
    'Project',
    'Head',
    'projecthead@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'project_head',
    'CCS',
    'active'
);

INSERT INTO users (
    username,
    first_name,
    last_name,
    email,
    password_hash,
    role,
    department,
    account_status
) VALUES (
    'departmentstaff',
    'Department',
    'Staff',
    'departmentstaff@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'staff',
    'CCS',
    'active'
);


-- Verify admin user
SELECT id, username, email, role, account_status, created_at
FROM users
WHERE username = 'admin';

-- Verify other users
SELECT id, username, email, role, account_status, created_at FROM users WHERE username IN ('programchair', 'publicuser', 'projecthead', 'departmentstaff');