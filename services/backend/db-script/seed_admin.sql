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

-- Program Chair 2 (Flexible)
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
    'chair2',
    'Program Chair',
    'Two',
    'chair2@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'program_chair',
    'Academic Programs',
    'active'
);

-- Chair2 CCS Project Head
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
    'ccsprojecthead2',
    'CCS',
    'Head Two',
    'ccsprojecthead2@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'project_head',
    'College of Computer Studies',
    'active'
);

-- Chair2 CEA Project Head
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
    'ceaprojecthead2',
    'CEA',
    'Head Two',
    'ceaprojecthead2@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'project_head',
    'College of Engineering and Architecture',
    'active'
);

-- Chair2 CCS Staff
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
    'ccsstaff2',
    'CCS',
    'Staff Two',
    'ccsstaff2@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'staff',
    'College of Computer Studies',
    'active'
);

-- Chair2 CEA Staff
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
    'ceastaff2',
    'CEA',
    'Staff Two',
    'ceastaff2@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'staff',
    'College of Engineering and Architecture',
    'active'
);

-- Program Chair 3 (Flexible)
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
    'chair3',
    'Program Chair',
    'Three',
    'chair3@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'program_chair',
    'Extension Services',
    'active'
);

-- Chair3 CCS Project Head
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
    'ccsprojecthead3',
    'CCS',
    'Head Three',
    'ccsprojecthead3@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'project_head',
    'College of Computer Studies',
    'active'
);

-- Chair3 CEA Project Head
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
    'ceaprojecthead3',
    'CEA',
    'Head Three',
    'ceaprojecthead3@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'project_head',
    'College of Engineering and Architecture',
    'active'
);

-- Chair3 CCS Staff
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
    'ccsstaff3',
    'CCS',
    'Staff Three',
    'ccsstaff3@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'staff',
    'College of Computer Studies',
    'active'
);

-- Chair3 CEA Staff
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
    'ceastaff3',
    'CEA',
    'Staff Three',
    'ceastaff3@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'staff',
    'College of Engineering and Architecture',
    'active'
);

-- Assign seeded team members to the seeded program chairs
UPDATE users
SET assigned_program_chair_id = (
    SELECT id
    FROM users
    WHERE username = 'programchair'
    LIMIT 1
)
WHERE username IN ('projecthead', 'departmentstaff');

UPDATE users
SET assigned_program_chair_id = (
    SELECT id
    FROM users
    WHERE username = 'chair2'
    LIMIT 1
)
WHERE username IN ('ccsprojecthead2', 'ceaprojecthead2', 'ccsstaff2', 'ceastaff2');

UPDATE users
SET assigned_program_chair_id = (
    SELECT id
    FROM users
    WHERE username = 'chair3'
    LIMIT 1
)
WHERE username IN ('ccsprojecthead3', 'ceaprojecthead3', 'ccsstaff3', 'ceastaff3');

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
    created_by_role,
    created_by_first_name,
    created_by_last_name,
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
    'project_head',
    'Project',
    'Head',
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
    created_by_role,
    created_by_first_name,
    created_by_last_name,
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
    'project_head',
    'Project',
    'Head',
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1)
);

-- ========== Chair2 Programs and Projects ==========

-- Chair2's CCS Program
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
    'Chair2 CCS Program',
    'Approved program managed by Chair2 for CCS.',
    'Technology Outreach',
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'chair2' LIMIT 1),
    'Deliver technology outreach initiatives.',
    'Students and community tech enthusiasts',
    220000.00,
    0,
    DATE '2026-01-20',
    DATE '2026-12-20',
    'active',
    'approved',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    true,
    (SELECT id FROM users WHERE username = 'chair2' LIMIT 1)
);

-- Chair2's CEA Program
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
    'Chair2 CEA Program',
    'Approved program managed by Chair2 for CEA.',
    'Infrastructure Development',
    (SELECT id FROM departments WHERE department_name = 'College of Engineering and Architecture' LIMIT 1),
    (SELECT id FROM users WHERE username = 'chair2' LIMIT 1),
    'Develop sustainable infrastructure solutions.',
    'Engineering firms and community organizations',
    280000.00,
    0,
    DATE '2026-02-01',
    DATE '2026-12-31',
    'active',
    'approved',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    true,
    (SELECT id FROM users WHERE username = 'chair2' LIMIT 1)
);

-- Chair2 CCS Project
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
    created_by_role,
    created_by_first_name,
    created_by_last_name,
    updated_by
)
VALUES (
    'Chair2 CCS Approved Project',
    'Approved project under Chair2''s CCS program.',
    'Deliver CCS tech initiatives.',
    (SELECT id FROM programs WHERE program_name = 'Chair2 CCS Program' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsprojecthead2' LIMIT 1),
    80000.00,
    0,
    DATE '2026-03-15',
    DATE '2026-11-30',
    25,
    'in_progress',
    'approved',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    true,
    'internal_proposal',
    (SELECT id FROM users WHERE username = 'ccsprojecthead2' LIMIT 1),
    'project_head',
    'CCS',
    'Head Two',
    (SELECT id FROM users WHERE username = 'ccsprojecthead2' LIMIT 1)
);

-- Chair2 CEA Project
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
    created_by_role,
    created_by_first_name,
    created_by_last_name,
    updated_by
)
VALUES (
    'Chair2 CEA Approved Project',
    'Approved project under Chair2''s CEA program.',
    'Deliver CEA infrastructure solutions.',
    (SELECT id FROM programs WHERE program_name = 'Chair2 CEA Program' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Engineering and Architecture' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ceaprojecthead2' LIMIT 1),
    110000.00,
    0,
    DATE '2026-04-01',
    DATE '2026-12-15',
    30,
    'in_progress',
    'approved',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    true,
    'internal_proposal',
    (SELECT id FROM users WHERE username = 'ceaprojecthead2' LIMIT 1),
    'project_head',
    'CEA',
    'Head Two',
    (SELECT id FROM users WHERE username = 'ceaprojecthead2' LIMIT 1)
);

-- ========== Chair3 Programs and Projects ==========

-- Chair3's CCS Program
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
    'Chair3 CCS Program',
    'Approved program managed by Chair3 for CCS.',
    'Digital Innovation',
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'chair3' LIMIT 1),
    'Foster digital innovation and entrepreneurship.',
    'Startups and tech entrepreneurs',
    190000.00,
    0,
    DATE '2026-01-10',
    DATE '2026-12-10',
    'active',
    'approved',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    true,
    (SELECT id FROM users WHERE username = 'chair3' LIMIT 1)
);

-- Chair3's CEA Program
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
    'Chair3 CEA Program',
    'Approved program managed by Chair3 for CEA.',
    'Sustainable Engineering',
    (SELECT id FROM departments WHERE department_name = 'College of Engineering and Architecture' LIMIT 1),
    (SELECT id FROM users WHERE username = 'chair3' LIMIT 1),
    'Promote sustainable engineering practices.',
    'Environmental organizations and industries',
    260000.00,
    0,
    DATE '2026-02-15',
    DATE '2026-12-15',
    'active',
    'approved',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    true,
    (SELECT id FROM users WHERE username = 'chair3' LIMIT 1)
);

-- Chair3 CCS Project
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
    created_by_role,
    created_by_first_name,
    created_by_last_name,
    updated_by
)
VALUES (
    'Chair3 CCS Innovation Project',
    'Approved project under Chair3''s CCS program.',
    'Drive digital innovation initiatives.',
    (SELECT id FROM programs WHERE program_name = 'Chair3 CCS Program' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsprojecthead3' LIMIT 1),
    70000.00,
    0,
    DATE '2026-03-20',
    DATE '2026-11-20',
    10,
    'planning',
    'approved',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    true,
    'internal_proposal',
    (SELECT id FROM users WHERE username = 'ccsprojecthead3' LIMIT 1),
    'project_head',
    'CCS',
    'Head Three',
    (SELECT id FROM users WHERE username = 'ccsprojecthead3' LIMIT 1)
);

-- Chair3 CEA Project
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
    created_by_role,
    created_by_first_name,
    created_by_last_name,
    updated_by
)
VALUES (
    'Chair3 CEA Sustainability Project',
    'Approved project under Chair3''s CEA program.',
    'Implement sustainable engineering practices.',
    (SELECT id FROM programs WHERE program_name = 'Chair3 CEA Program' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Engineering and Architecture' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ceaprojecthead3' LIMIT 1),
    100000.00,
    0,
    DATE '2026-04-10',
    DATE '2026-12-20',
    35,
    'in_progress',
    'approved',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    true,
    'internal_proposal',
    (SELECT id FROM users WHERE username = 'ceaprojecthead3' LIMIT 1),
    'project_head',
    'CEA',
    'Head Three',
    (SELECT id FROM users WHERE username = 'ceaprojecthead3' LIMIT 1)
);


-- Verify admin user
SELECT id, username, email, role, account_status, created_at
FROM users
WHERE username = 'admin';

-- Verify other users
SELECT id, username, email, role, department, account_status, assigned_program_chair_id, created_at
FROM users
WHERE username IN ('programchair', 'publicuser', 'projecthead', 'departmentstaff');