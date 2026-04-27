-- Reference seed for reports and analytics alignment
-- Safe to rerun for the seeded hierarchy below:
-- admin -> program chair -> project head -> staff

-- Reset only the reference project/program data used by this mock hierarchy.
DELETE FROM projects
WHERE project_name IN (
    'CCS Community Coding Bootcamp',
    'CCS Barangay Data Literacy Drive',
    'CCS Extension Tech Desk',
    'CCS Student Volunteer Helpdesk',
    'CED Reading Recovery Labs',
    'CED Parent Teaching Toolkit'
)
AND created_by IN (
    SELECT id
    FROM users
    WHERE username IN ('projecthead', 'ccsprojecthead2', 'cedeprojecthead')
);

DELETE FROM programs
WHERE program_name IN (
    'CCS Approved Seed Program',
    'CCS Innovation Support Program',
    'CED Literacy and Learning Program'
)
AND created_by IN (
    SELECT id
    FROM users
    WHERE username IN ('programchair', 'cedechair')
);

-- Shared bcrypt hash for password = password
-- This keeps the seeded demo accounts easy to sign into locally.
INSERT INTO users (
    username,
    first_name,
    last_name,
    email,
    password_hash,
    role,
    department,
    account_status
)
VALUES
(
    'admin',
    'System',
    'Administrator',
    'admin@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'System Administration',
    'active'
),
(
    'programchair',
    'Program',
    'Chair',
    'programchair@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'program_chair',
    'Program Management',
    'active'
),
(
    'cedechair',
    'Cede',
    'Chair',
    'cedechair@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'program_chair',
    'Program Management',
    'active'
),
(
    'publicuser',
    'Public',
    'User',
    'publicuser@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'public_user',
    NULL,
    'active'
),
(
    'projecthead',
    'Project',
    'Head',
    'projecthead@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'project_head',
    'College of Computer Studies',
    'active'
),
(
    'ccsprojecthead2',
    'Campus',
    'Lead',
    'ccsprojecthead2@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'project_head',
    'College of Computer Studies',
    'active'
),
(
    'cedeprojecthead',
    'Education',
    'Lead',
    'cedeprojecthead@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'project_head',
    'College of Education',
    'active'
),
(
    'departmentstaff',
    'Department',
    'Staff',
    'departmentstaff@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'staff',
    'College of Computer Studies',
    'active'
),
(
    'ccsstaff2',
    'Community',
    'Support',
    'ccsstaff2@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'staff',
    'College of Computer Studies',
    'active'
),
(
    'ccsstaff3',
    'Volunteer',
    'Coordinator',
    'ccsstaff3@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'staff',
    'College of Computer Studies',
    'active'
),
(
    'cedestaff',
    'Reading',
    'Facilitator',
    'cedestaff@extensionservice.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'staff',
    'College of Education',
    'active'
)
ON CONFLICT (username) DO UPDATE
SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    account_status = EXCLUDED.account_status,
    updated_at = NOW();

UPDATE users
SET assigned_program_chair_id = (
    SELECT id
    FROM users
    WHERE username = 'programchair'
    LIMIT 1
)
WHERE username IN ('projecthead', 'ccsprojecthead2', 'departmentstaff', 'ccsstaff2', 'ccsstaff3');

UPDATE users
SET assigned_program_chair_id = (
    SELECT id
    FROM users
    WHERE username = 'cedechair'
    LIMIT 1
)
WHERE username IN ('cedeprojecthead', 'cedestaff');

UPDATE departments
SET
    program_chair_id = CASE
        WHEN department_name = 'College of Computer Studies' THEN (
            SELECT id
            FROM users
            WHERE username = 'programchair'
            LIMIT 1
        )
        WHEN department_name = 'College of Education' THEN (
            SELECT id
            FROM users
            WHERE username = 'cedechair'
            LIMIT 1
        )
        ELSE program_chair_id
    END,
    updated_at = NOW()
WHERE department_name IN ('College of Computer Studies', 'College of Education');

INSERT INTO program_chair_budgets (
    chair_id,
    allocated_budget,
    spent_budget
)
VALUES
(
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    500000.00,
    120000.00
),
(
    (SELECT id FROM users WHERE username = 'cedechair' LIMIT 1),
    320000.00,
    90000.00
)
ON CONFLICT (chair_id) DO UPDATE
SET
    allocated_budget = EXCLUDED.allocated_budget,
    spent_budget = EXCLUDED.spent_budget,
    updated_at = NOW();

INSERT INTO chair_department_budgets (
    chair_id,
    department_id,
    allocated_budget,
    spent_budget
)
VALUES
(
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    300000.00,
    85000.00
),
(
    (SELECT id FROM users WHERE username = 'cedechair' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Education' LIMIT 1),
    210000.00,
    60000.00
)
ON CONFLICT (chair_id, department_id) DO UPDATE
SET
    allocated_budget = EXCLUDED.allocated_budget,
    spent_budget = EXCLUDED.spent_budget,
    updated_at = NOW();

-- Seed programs for two chairs so admin can see everything,
-- while the program chair accounts only own their respective programs.
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
VALUES
(
    'CCS Approved Seed Program',
    'Approved seeded CCS program used to verify default program chair analytics and reports.',
    'Technology Outreach',
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    'Deliver approved CCS extension activities to partner communities.',
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
),
(
    'CCS Innovation Support Program',
    'Secondary CCS program so the program chair can see more than one active track.',
    'Student Volunteer Development',
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    'Coordinate volunteer-led technical support and student extension services.',
    'Campus volunteers and partner institutions',
    180000.00,
    0,
    DATE '2026-01-15',
    DATE '2026-11-30',
    'active',
    'approved',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    true,
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1)
),
(
    'CED Literacy and Learning Program',
    'Education-side seeded program so admin can confirm cross-chair separation.',
    'Literacy Outreach',
    (SELECT id FROM departments WHERE department_name = 'College of Education' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedechair' LIMIT 1),
    'Run reading support, family learning, and facilitator development efforts.',
    'Parents, reading facilitators, and elementary learners',
    260000.00,
    0,
    DATE '2026-01-15',
    DATE '2026-12-15',
    'active',
    'approved',
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    NOW(),
    true,
    (SELECT id FROM users WHERE username = 'cedechair' LIMIT 1)
);

-- Reference hierarchy for reports and analytics:
-- admin -> program chair -> project head -> staff
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
    created_by,
    created_by_role,
    created_by_first_name,
    created_by_last_name
)
VALUES
(
    'CCS Community Coding Bootcamp',
    'Approved reference project for the primary CCS project head.',
    'Deliver community coding sessions and student mentoring.',
    (SELECT id FROM programs WHERE program_name = 'CCS Approved Seed Program' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    120000.00,
    40000.00,
    DATE '2026-02-01',
    DATE '2026-09-30',
    66,
    'in_progress',
    'approved',
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    NOW(),
    true,
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    'project_head',
    'Project',
    'Head'
),
(
    'CCS Barangay Data Literacy Drive',
    'Pending project head proposal waiting for chair review.',
    'Prepare data literacy training packs for community partners.',
    (SELECT id FROM programs WHERE program_name = 'CCS Approved Seed Program' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    NULL,
    0,
    DATE '2026-04-10',
    DATE '2026-11-15',
    12,
    'planning',
    'pending',
    NULL,
    NULL,
    false,
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    'project_head',
    'Project',
    'Head'
),
(
    'CCS Extension Tech Desk',
    'Approved project without released budget so it appears as a funding gap.',
    'Provide rotating technical help sessions for extension beneficiaries.',
    (SELECT id FROM programs WHERE program_name = 'CCS Approved Seed Program' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    0,
    0,
    DATE '2026-03-01',
    DATE '2026-10-31',
    20,
    'planning',
    'approved',
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    NOW(),
    false,
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    'project_head',
    'Project',
    'Head'
),
(
    'CCS Student Volunteer Helpdesk',
    'Completed reference project managed by the secondary CCS project head.',
    'Coordinate volunteer support for extension-related campus events.',
    (SELECT id FROM programs WHERE program_name = 'CCS Innovation Support Program' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsprojecthead2' LIMIT 1),
    85000.00,
    83000.00,
    DATE '2026-01-20',
    DATE '2026-05-30',
    100,
    'completed',
    'approved',
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    NOW(),
    true,
    (SELECT id FROM users WHERE username = 'ccsprojecthead2' LIMIT 1),
    'project_head',
    'Campus',
    'Lead'
),
(
    'CED Reading Recovery Labs',
    'Active education outreach project under the second program chair chain.',
    'Run reading clinics and facilitator support sessions for families.',
    (SELECT id FROM programs WHERE program_name = 'CED Literacy and Learning Program' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Education' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1),
    95000.00,
    25000.00,
    DATE '2026-02-10',
    DATE '2026-10-20',
    48,
    'in_progress',
    'approved',
    (SELECT id FROM users WHERE username = 'cedechair' LIMIT 1),
    NOW(),
    true,
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1),
    'project_head',
    'Education',
    'Lead'
),
(
    'CED Parent Teaching Toolkit',
    'Approved education project intentionally left unfunded for reference.',
    'Package practical teaching guides for household learning support.',
    (SELECT id FROM programs WHERE program_name = 'CED Literacy and Learning Program' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Education' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1),
    0,
    0,
    DATE '2026-05-01',
    DATE '2026-11-28',
    15,
    'planning',
    'approved',
    (SELECT id FROM users WHERE username = 'cedechair' LIMIT 1),
    NOW(),
    false,
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1),
    'project_head',
    'Education',
    'Lead'
);

INSERT INTO project_staff_assignments (
    project_id,
    staff_id,
    assigned_by
)
VALUES
(
    (SELECT id FROM projects WHERE project_name = 'CCS Community Coding Bootcamp' LIMIT 1),
    (SELECT id FROM users WHERE username = 'departmentstaff' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1)
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Community Coding Bootcamp' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsstaff2' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1)
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Barangay Data Literacy Drive' LIMIT 1),
    (SELECT id FROM users WHERE username = 'departmentstaff' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1)
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Extension Tech Desk' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsstaff2' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1)
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Student Volunteer Helpdesk' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsstaff3' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsprojecthead2' LIMIT 1)
),
(
    (SELECT id FROM projects WHERE project_name = 'CED Reading Recovery Labs' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedestaff' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1)
),
(
    (SELECT id FROM projects WHERE project_name = 'CED Parent Teaching Toolkit' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedestaff' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1)
);

INSERT INTO tasks (
    project_id,
    title,
    description,
    budget_needed,
    status,
    priority,
    assigned_to,
    created_by,
    due_date,
    completed_at
)
VALUES
(
    (SELECT id FROM projects WHERE project_name = 'CCS Community Coding Bootcamp' LIMIT 1),
    'Finalize outreach curriculum',
    'Prepare the teaching outline and reference exercises for the bootcamp.',
    8000.00,
    'completed',
    'high',
    (SELECT id FROM users WHERE username = 'departmentstaff' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    DATE '2026-04-18',
    NOW()
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Community Coding Bootcamp' LIMIT 1),
    'Coordinate community schedule',
    'Lock the final venue schedule and participant slots.',
    5000.00,
    'in_progress',
    'medium',
    (SELECT id FROM users WHERE username = 'departmentstaff' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    CURRENT_DATE + 5,
    NULL
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Community Coding Bootcamp' LIMIT 1),
    'Prepare post-event report template',
    'Draft the accomplishment and participant tracking template.',
    3000.00,
    'pending',
    'low',
    (SELECT id FROM users WHERE username = 'ccsstaff2' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    CURRENT_DATE + 9,
    NULL
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Barangay Data Literacy Drive' LIMIT 1),
    'Draft barangay intake survey',
    'Collect baseline participant needs before the chair review is finalized.',
    4500.00,
    'pending',
    'high',
    (SELECT id FROM users WHERE username = 'departmentstaff' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    CURRENT_DATE + 12,
    NULL
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Extension Tech Desk' LIMIT 1),
    'Inventory support devices',
    'Check available laptops, hotspots, and printer kits for deployment.',
    6500.00,
    'in_progress',
    'urgent',
    (SELECT id FROM users WHERE username = 'ccsstaff2' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    CURRENT_DATE + 4,
    NULL
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Extension Tech Desk' LIMIT 1),
    'Publish support rotation',
    'Prepare the staff rotation schedule once funding is cleared.',
    1500.00,
    'pending',
    'medium',
    (SELECT id FROM users WHERE username = 'ccsstaff2' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    CURRENT_DATE + 7,
    NULL
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Student Volunteer Helpdesk' LIMIT 1),
    'Close volunteer deployment log',
    'Finalize the deployment tracker and sign-off sheet.',
    1200.00,
    'completed',
    'medium',
    (SELECT id FROM users WHERE username = 'ccsstaff3' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsprojecthead2' LIMIT 1),
    DATE '2026-05-18',
    NOW()
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Student Volunteer Helpdesk' LIMIT 1),
    'Archive incident notes',
    'Store the final notes and post-activity highlights.',
    900.00,
    'completed',
    'low',
    (SELECT id FROM users WHERE username = 'ccsstaff3' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsprojecthead2' LIMIT 1),
    DATE '2026-05-24',
    NOW()
),
(
    (SELECT id FROM projects WHERE project_name = 'CED Reading Recovery Labs' LIMIT 1),
    'Prepare facilitator packets',
    'Print and collate session packets for the reading clinics.',
    4000.00,
    'completed',
    'medium',
    (SELECT id FROM users WHERE username = 'cedestaff' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1),
    DATE '2026-04-29',
    NOW()
),
(
    (SELECT id FROM projects WHERE project_name = 'CED Reading Recovery Labs' LIMIT 1),
    'Coordinate parent reading session',
    'Confirm families, facilitators, and venue layout for the next lab day.',
    5200.00,
    'in_progress',
    'high',
    (SELECT id FROM users WHERE username = 'cedestaff' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1),
    CURRENT_DATE + 3,
    NULL
),
(
    (SELECT id FROM projects WHERE project_name = 'CED Parent Teaching Toolkit' LIMIT 1),
    'Upload household teaching checklist',
    'Prepare the toolkit checklist while awaiting funding release.',
    2200.00,
    'pending',
    'medium',
    (SELECT id FROM users WHERE username = 'cedestaff' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1),
    CURRENT_DATE + 11,
    NULL
);

INSERT INTO task_assignments (
    task_id,
    user_id
)
VALUES
(
    (SELECT id FROM tasks WHERE title = 'Finalize outreach curriculum' LIMIT 1),
    (SELECT id FROM users WHERE username = 'departmentstaff' LIMIT 1)
),
(
    (SELECT id FROM tasks WHERE title = 'Coordinate community schedule' LIMIT 1),
    (SELECT id FROM users WHERE username = 'departmentstaff' LIMIT 1)
),
(
    (SELECT id FROM tasks WHERE title = 'Prepare post-event report template' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsstaff2' LIMIT 1)
),
(
    (SELECT id FROM tasks WHERE title = 'Draft barangay intake survey' LIMIT 1),
    (SELECT id FROM users WHERE username = 'departmentstaff' LIMIT 1)
),
(
    (SELECT id FROM tasks WHERE title = 'Inventory support devices' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsstaff2' LIMIT 1)
),
(
    (SELECT id FROM tasks WHERE title = 'Publish support rotation' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsstaff2' LIMIT 1)
),
(
    (SELECT id FROM tasks WHERE title = 'Close volunteer deployment log' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsstaff3' LIMIT 1)
),
(
    (SELECT id FROM tasks WHERE title = 'Archive incident notes' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsstaff3' LIMIT 1)
),
(
    (SELECT id FROM tasks WHERE title = 'Prepare facilitator packets' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedestaff' LIMIT 1)
),
(
    (SELECT id FROM tasks WHERE title = 'Coordinate parent reading session' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedestaff' LIMIT 1)
),
(
    (SELECT id FROM tasks WHERE title = 'Upload household teaching checklist' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedestaff' LIMIT 1)
);

INSERT INTO budget_requests (
    project_id,
    requested_by,
    amount,
    reason,
    needed_by_date,
    status,
    workflow_stage,
    reviewed_by,
    approved_against_chair_department_budget_id,
    review_notes,
    reviewed_at,
    chair_slip_number,
    chair_slip_generated_at
)
VALUES
(
    (SELECT id FROM projects WHERE project_name = 'CCS Community Coding Bootcamp' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    60000.00,
    'Reference approved request for seeded analytics and reporting flows.',
    CURRENT_DATE + 10,
    'approved',
    'approved',
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    (
        SELECT id
        FROM chair_department_budgets
        WHERE chair_id = (SELECT id FROM users WHERE username = 'programchair' LIMIT 1)
          AND department_id = (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1)
        LIMIT 1
    ),
    'Approved as reference funding for analytics.',
    NOW(),
    'PC-REF-2026-001',
    NOW()
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Barangay Data Literacy Drive' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    45000.00,
    'Pending request linked to a proposal still under chair review.',
    CURRENT_DATE + 20,
    'pending',
    'pending',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Student Volunteer Helpdesk' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsprojecthead2' LIMIT 1),
    35000.00,
    'Approved volunteer supplies and transport support.',
    CURRENT_DATE + 2,
    'approved',
    'approved',
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    (
        SELECT id
        FROM chair_department_budgets
        WHERE chair_id = (SELECT id FROM users WHERE username = 'programchair' LIMIT 1)
          AND department_id = (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1)
        LIMIT 1
    ),
    'Approved for completed volunteer deployment work.',
    NOW(),
    'PC-REF-2026-002',
    NOW()
),
(
    (SELECT id FROM projects WHERE project_name = 'CED Reading Recovery Labs' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1),
    55000.00,
    'Approved reading clinic materials and facilitator allowances.',
    CURRENT_DATE + 6,
    'approved',
    'approved',
    (SELECT id FROM users WHERE username = 'cedechair' LIMIT 1),
    (
        SELECT id
        FROM chair_department_budgets
        WHERE chair_id = (SELECT id FROM users WHERE username = 'cedechair' LIMIT 1)
          AND department_id = (SELECT id FROM departments WHERE department_name = 'College of Education' LIMIT 1)
        LIMIT 1
    ),
    'Approved for the current literacy lab cycle.',
    NOW(),
    'CED-REF-2026-001',
    NOW()
),
(
    (SELECT id FROM projects WHERE project_name = 'CED Parent Teaching Toolkit' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1),
    28000.00,
    'Declined request kept as an unfunded reference project for analytics.',
    CURRENT_DATE + 18,
    'declined',
    'declined',
    (SELECT id FROM users WHERE username = 'cedechair' LIMIT 1),
    NULL,
    'Deferred until the next literacy allocation window.',
    NOW(),
    NULL,
    NULL
);

INSERT INTO documents (
    project_id,
    uploaded_by,
    document_type,
    title,
    file_url,
    status,
    reviewed_by,
    review_notes,
    reviewed_at
)
VALUES
(
    (SELECT id FROM projects WHERE project_name = 'CCS Community Coding Bootcamp' LIMIT 1),
    (SELECT id FROM users WHERE username = 'departmentstaff' LIMIT 1),
    'budget_report',
    'Seeded Staff Budget Utilization Report',
    '/uploads/reference/staff-budget-report.pdf',
    'approved',
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    'Reference staff budget report approved for hierarchy testing.',
    NOW()
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Student Volunteer Helpdesk' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsstaff3' LIMIT 1),
    'accomplishment_report',
    'Seeded Volunteer Helpdesk Accomplishment Report',
    '/uploads/reference/volunteer-helpdesk-report.pdf',
    'approved',
    (SELECT id FROM users WHERE username = 'ccsprojecthead2' LIMIT 1),
    'Completed project accomplishment reference.',
    NOW()
),
(
    (SELECT id FROM projects WHERE project_name = 'CED Reading Recovery Labs' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedestaff' LIMIT 1),
    'budget_report',
    'Seeded CED Reading Recovery Budget Report',
    '/uploads/reference/ced-reading-budget-report.pdf',
    'under_review',
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1),
    'Awaiting final note consolidation before chair sign-off.',
    NOW()
);

INSERT INTO kpi_reports (
    project_id,
    department_id,
    created_by,
    reviewed_by,
    title,
    metrics,
    period_start,
    period_end,
    status,
    review_notes,
    reviewed_at
)
VALUES
(
    (SELECT id FROM projects WHERE project_name = 'CCS Community Coding Bootcamp' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'projecthead' LIMIT 1),
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    'Seeded CCS Bootcamp KPI Report',
    '{"beneficiaries": 120, "completion_rate": 66, "sessions_completed": 4, "staff_assigned": 2}'::jsonb,
    DATE '2026-02-01',
    DATE '2026-04-30',
    'approved',
    'Reference KPI report for admin and chair reporting views.',
    NOW()
),
(
    (SELECT id FROM projects WHERE project_name = 'CCS Student Volunteer Helpdesk' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Computer Studies' LIMIT 1),
    (SELECT id FROM users WHERE username = 'ccsprojecthead2' LIMIT 1),
    (SELECT id FROM users WHERE username = 'programchair' LIMIT 1),
    'Seeded CCS Volunteer Helpdesk KPI Report',
    '{"beneficiaries": 80, "completion_rate": 100, "sessions_completed": 6, "staff_assigned": 1}'::jsonb,
    DATE '2026-01-20',
    DATE '2026-05-30',
    'approved',
    'Completed reference KPI report for a second CCS project head.',
    NOW()
),
(
    (SELECT id FROM projects WHERE project_name = 'CED Reading Recovery Labs' LIMIT 1),
    (SELECT id FROM departments WHERE department_name = 'College of Education' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedeprojecthead' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cedechair' LIMIT 1),
    'Seeded CED Reading Recovery KPI Report',
    '{"beneficiaries": 95, "completion_rate": 48, "sessions_completed": 3, "staff_assigned": 1}'::jsonb,
    DATE '2026-02-10',
    DATE '2026-04-30',
    'under_review',
    'Second-chair KPI reference still under review.',
    NOW()
);

-- Verification queries for alignment checks after seeding
SELECT
    u.username,
    u.role,
    u.department,
    COALESCE(chair.username, '-') AS assigned_program_chair,
    u.account_status
FROM users u
LEFT JOIN users chair ON chair.id = u.assigned_program_chair_id
WHERE u.username IN (
    'admin',
    'programchair',
    'cedechair',
    'projecthead',
    'ccsprojecthead2',
    'cedeprojecthead',
    'departmentstaff',
    'ccsstaff2',
    'ccsstaff3',
    'cedestaff'
)
ORDER BY
    CASE u.role
        WHEN 'admin' THEN 1
        WHEN 'program_chair' THEN 2
        WHEN 'project_head' THEN 3
        WHEN 'staff' THEN 4
        ELSE 5
    END,
    u.username;

SELECT
    d.department_code,
    chair.username AS program_chair_username,
    p.program_name,
    p.status,
    p.approval_status
FROM programs p
LEFT JOIN departments d ON d.id = p.department_id
LEFT JOIN users chair ON chair.id = p.program_chair_id
ORDER BY d.department_code, p.program_name;

SELECT
    pr.project_name,
    d.department_code,
    chair.username AS program_chair_username,
    head.username AS project_head_username,
    pr.approval_status,
    pr.status,
    COALESCE(SUM(CASE WHEN br.status = 'approved' THEN br.amount ELSE 0 END), 0) AS approved_budget_reference
FROM projects pr
LEFT JOIN departments d ON d.id = pr.department_id
LEFT JOIN users head ON head.id = pr.project_head_id
LEFT JOIN users chair ON chair.id = head.assigned_program_chair_id
LEFT JOIN budget_requests br ON br.project_id = pr.id
GROUP BY pr.project_name, d.department_code, chair.username, head.username, pr.approval_status, pr.status
ORDER BY d.department_code, project_head_username, pr.project_name;

SELECT
    a.username AS admin_username,
    (SELECT COUNT(*) FROM users u WHERE u.role = 'program_chair' AND u.account_status = 'active') AS total_program_chairs,
    (SELECT COUNT(*) FROM users u WHERE u.role = 'project_head' AND u.account_status = 'active') AS total_project_heads,
    (SELECT COUNT(*) FROM users u WHERE u.role = 'staff' AND u.account_status = 'active') AS total_staff,
    (SELECT COUNT(*) FROM departments d WHERE d.is_active = TRUE) AS total_departments,
    (SELECT COUNT(*) FROM programs p) AS total_programs,
    (SELECT COUNT(*) FROM projects pr) AS total_projects,
    (SELECT COUNT(*) FROM tasks t) AS total_tasks,
    (SELECT COUNT(*) FROM budget_requests br) AS total_budget_requests
FROM users a
WHERE a.username = 'admin'
  AND a.role = 'admin'
  AND a.account_status = 'active';

SELECT
    chair.username AS program_chair_username,
    (
        SELECT COUNT(*)
        FROM users ph
        WHERE ph.role = 'project_head'
          AND ph.account_status = 'active'
          AND ph.assigned_program_chair_id = chair.id
    ) AS total_project_heads,
    (
        SELECT COUNT(*)
        FROM users st
        WHERE st.role = 'staff'
          AND st.account_status = 'active'
          AND st.assigned_program_chair_id = chair.id
    ) AS total_staff,
    (
        SELECT COUNT(*)
        FROM programs p
        WHERE p.program_chair_id = chair.id
    ) AS total_programs,
    (
        SELECT COUNT(*)
        FROM projects pr
        JOIN programs p ON p.id = pr.program_id
        WHERE p.program_chair_id = chair.id
    ) AS total_projects,
    (
        SELECT COUNT(*)
        FROM tasks t
        JOIN projects pr ON pr.id = t.project_id
        JOIN programs p ON p.id = pr.program_id
        WHERE p.program_chair_id = chair.id
    ) AS total_tasks,
    (
        SELECT COUNT(*)
        FROM projects pr
        JOIN programs p ON p.id = pr.program_id
        WHERE p.program_chair_id = chair.id
          AND pr.approval_status = 'pending'
    ) AS pending_projects,
    (
        SELECT COUNT(*)
        FROM projects pr
        JOIN programs p ON p.id = pr.program_id
        WHERE p.program_chair_id = chair.id
          AND pr.approval_status = 'approved'
          AND COALESCE(pr.budget_allocated, 0) <= 0
          AND NOT EXISTS (
              SELECT 1
              FROM budget_requests br
              WHERE br.project_id = pr.id
                AND br.status = 'approved'
          )
    ) AS approved_projects_needing_funding
FROM users chair
WHERE chair.role = 'program_chair'
  AND chair.account_status = 'active'
  AND chair.username IN ('programchair', 'cedechair')
ORDER BY chair.username;

SELECT
    head.username AS project_head_username,
    COALESCE(chair.first_name || ' ' || chair.last_name, '-') AS program_chair_name,
    (
        SELECT COUNT(*)
        FROM users st
        WHERE st.role = 'staff'
          AND st.account_status = 'active'
          AND st.assigned_program_chair_id = head.assigned_program_chair_id
          AND (
              head.department IS NULL
              OR st.department = head.department
          )
    ) AS total_staff,
    (
        SELECT COUNT(*)
        FROM projects pr
        WHERE pr.project_head_id = head.id
    ) AS total_projects,
    (
        SELECT COUNT(*)
        FROM tasks t
        JOIN projects pr ON pr.id = t.project_id
        WHERE pr.project_head_id = head.id
    ) AS total_tasks,
    (
        SELECT COUNT(*)
        FROM tasks t
        JOIN projects pr ON pr.id = t.project_id
        WHERE pr.project_head_id = head.id
          AND t.status NOT IN ('completed', 'cancelled')
          AND t.due_date IS NOT NULL
          AND t.due_date <= CURRENT_DATE + 7
    ) AS due_soon_tasks,
    (
        SELECT COUNT(*)
        FROM projects pr
        WHERE pr.project_head_id = head.id
          AND pr.approval_status = 'pending'
    ) AS pending_projects
FROM users head
LEFT JOIN users chair ON chair.id = head.assigned_program_chair_id
WHERE head.role = 'project_head'
  AND head.account_status = 'active'
  AND head.username IN ('projecthead', 'ccsprojecthead2', 'cedeprojecthead')
ORDER BY head.username;
