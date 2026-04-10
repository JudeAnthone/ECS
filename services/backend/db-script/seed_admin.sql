-- Drop existing admin user
DELETE FROM users WHERE username = 'admin';

-- Drop existing users for other roles
DELETE FROM users WHERE username = 'programchair';
DELETE FROM users WHERE username = 'publicuser';
DELETE FROM users WHERE username = 'projecthead';
DELETE FROM users WHERE username = 'departmentstaff';
DELETE FROM users WHERE username = 'cedechair';
DELETE FROM users WHERE username = 'cedeprojecthead';
DELETE FROM users WHERE username = 'cedestaff';
DELETE FROM users WHERE username IN ('chair2', 'chair3', 'ccsprojecthead2', 'ceaprojecthead2', 'ccsstaff2', 'ceastaff2', 'ccsprojecthead3', 'ceaprojecthead3', 'ccsstaff3', 'ceastaff3');

-- Email:admin@extensionservice.com
-- Password: password
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
    'admin',
    'System',
    'Administrator',
    'admin@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'System Administration',
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
    'programchair',
    'Program',
    'Chair',
    'programchair@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'program_chair',
    'Program Management',
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
    'College of Computer Studies',
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
    'College of Computer Studies',
    'active'
);

-- Assign original seeded team members to the default program chair
UPDATE users
SET assigned_program_chair_id = (
    SELECT id
    FROM users
    WHERE username = 'programchair'
    LIMIT 1
)
WHERE username IN ('projecthead', 'departmentstaff');

-- Set default program chair for CCS department
UPDATE departments
SET program_chair_id = (
    SELECT id
    FROM users
    WHERE username = 'programchair'
    LIMIT 1
),
updated_at = NOW()
WHERE department_name = 'College of Computer Studies';

-- Clean install seed: remove all existing projects and programs
DELETE FROM projects;
DELETE FROM programs;

-- Insert one approved program for CCS
INSERT INTO programs (
    program_name,
    program_description,
    program_category,
    department_id,
    program_chair_id,
    objectives,
    target_beneficiaries,
    budget_allocation,
    spent_budget,
    start_date,
    end_date,
    status,
    approval_status,
    approved_by,
    approved_at,
    is_published,
    created_by
)
VALUES (
    'CCS Approved Seed Program',
    'Approved seeded program for CCS.',
    'Technology Outreach',
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    'Deliver approved CCS extension activities.',
    'Local schools and community organizations',
    300000.00,
    0,
    DATE '2026-01-01',
    DATE '2026-12-31',
    'active',
    'approved',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    true,
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1)
);


-- Verify admin user
SELECT id, username, email, role, account_status, created_at
FROM users
WHERE username = 'admin';

-- Verify other users
SELECT id, username, email, role, department, account_status, assigned_program_chair_id, created_at
FROM users
WHERE username IN ('programchair', 'publicuser', 'projecthead', 'departmentstaff');