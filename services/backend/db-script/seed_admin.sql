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

-- Assign seeded team members to the seeded program chair
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

-- Remove old seeded demo projects/programs if they exist
DELETE FROM projects
WHERE project_name IN (
    'CCS Approved Seed Project',
    'CCS Rejected Seed Project'
);

DELETE FROM programs
WHERE program_name IN (
    'CCS Example Seed Program',
    'CCS Approved Seed Program',
    'CCS Rejected Seed Program'
);

-- Insert example program (draft/pending) for CCS under default program chair
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
    is_published,
    created_by
)
VALUES (
    'CCS Example Seed Program',
    'Example seeded program for CCS workflow testing.',
    'Community Extension',
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    'Provide a baseline seeded program for development testing.',
    'CCS students and partner communities',
    150000.00,
    0,
    DATE '2026-01-01',
    DATE '2026-12-31',
    'draft',
    'pending',
    false,
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1)
);

-- Insert approved program for CCS
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

-- Insert rejected program for CCS
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
    'CCS Rejected Seed Program',
    'Rejected seeded program for CCS.',
    'Pilot Program',
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    'Pilot initiative for rejection-path testing.',
    'Internal pilot participants',
    180000.00,
    0,
    DATE '2026-02-01',
    DATE '2026-11-30',
    'cancelled',
    'rejected',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    false,
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1)
);

-- Insert approved project under approved CCS program
INSERT INTO projects (
    project_name,
    project_description,
    objectives,
    program_id,
    department_id,
    project_head_id,
    budget_allocated,
    budget_used,
    start_date,
    end_date,
    progress_percentage,
    status,
    approval_status,
    approved_by,
    approved_at,
    is_published,
    creation_source,
    created_by,
    updated_by
)
VALUES (
    'CCS Approved Seed Project',
    'Approved project under approved CCS program.',
    'Deliver approved extension project outcomes.',
    (SELECT id FROM programs WHERE program_name = 'CCS Approved Seed Program' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    90000.00,
    0,
    DATE '2026-03-01',
    DATE '2026-09-30',
    15,
    'in_progress',
    'approved',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    true,
    'internal_proposal',
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1)
);

-- Insert rejected project under rejected CCS program
INSERT INTO projects (
    project_name,
    project_description,
    objectives,
    program_id,
    department_id,
    project_head_id,
    budget_allocated,
    budget_used,
    start_date,
    end_date,
    progress_percentage,
    status,
    approval_status,
    approved_by,
    approved_at,
    is_published,
    creation_source,
    created_by,
    updated_by
)
VALUES (
    'CCS Rejected Seed Project',
    'Rejected project under rejected CCS program.',
    'Validate rejected project flow in dashboards.',
    (SELECT id FROM programs WHERE program_name = 'CCS Rejected Seed Program' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    45000.00,
    0,
    DATE '2026-04-01',
    DATE '2026-10-31',
    0,
    'cancelled',
    'rejected',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    false,
    'internal_proposal',
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1)
);


-- Verify admin user
SELECT id, username, email, role, account_status, created_at
FROM users
WHERE username = 'admin';

-- Verify other users
SELECT id, username, email, role, department, account_status, assigned_program_chair_id, created_at
FROM users
WHERE username IN ('programchair', 'publicuser', 'projecthead', 'departmentstaff');