-- Extension Service System Database Schema
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and types if they exist (for clean setup)
DROP VIEW IF EXISTS vw_department_budget_summary CASCADE;
DROP VIEW IF EXISTS vw_program_summary CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS sla_metrics CASCADE;
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS project_requests CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS creation_source_type CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS program_status CASCADE;
DROP TYPE IF EXISTS account_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS proposal_status CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS auth_provider CASCADE;
DROP TYPE IF EXISTS request_workflow_stage CASCADE;

-- Create ENUM types
CREATE TYPE auth_provider AS ENUM ('local', 'google');

CREATE TYPE user_role AS ENUM (
    'admin',
    'program_chair', 
    'project_head',
    'staff',
    'public_user',
    'college',
    'beneficiary'
);

CREATE TYPE account_status AS ENUM (
    'active',
    'deactivated',
    'suspended',
    'pending_approval',
    'rejected'
);

CREATE TYPE program_status AS ENUM (
    'draft',
    'active',
    'completed',
    'cancelled'
);

CREATE TYPE project_status AS ENUM (
    'draft',
    'planning',
    'pending_approval',
    'approved',
    'in_progress',
    'on_hold',
    'completed',
    'cancelled'
);

CREATE TYPE approval_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE creation_source_type AS ENUM (
    'internal_proposal',
    'public_request'
);

CREATE TYPE proposal_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE task_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'cancelled'
);

CREATE TYPE task_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

CREATE TYPE request_workflow_stage AS ENUM (
    'submitted',                    -- Public user just submitted
    'under_program_chair_review',   -- Program chair reviewing
    'feedback_provided',            -- Program chair gave feedback to public user
    'assigned_to_department',       -- Assigned to department, waiting for project head
    'project_head_reviewing',       -- Project head is reviewing the recommendation
    'project_head_accepted',        -- Project head accepted, creating proposal
    'project_head_declined',        -- Project head declined the recommendation
    'proposal_submitted',           -- Proposal created and submitted for review
    'proposal_under_review',        -- Program chair reviewing the proposal
    'proposal_changes_requested',   -- Program chair requested changes to proposal
    'pending_final_approval',       -- Waiting for admin final approval
    'approved',                     -- Final approval granted (ready to convert to project)
    'rejected'                      -- Rejected at any stage
);

-- ==========================================
-- Users Table
-- ==========================================
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username            VARCHAR(50) UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9_]+$'),
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(150) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    role                user_role NOT NULL DEFAULT 'public_user',
    department          VARCHAR(100),
    contact_number      VARCHAR(15),
    account_status      account_status NOT NULL DEFAULT 'pending_approval',
    avatar_url          VARCHAR(255),
    last_active         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_department_role CHECK (
        (role IN ('program_chair', 'project_head', 'staff') AND department IS NOT NULL)
        OR
        (role IN ('admin', 'public_user'))
    )
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_last_active ON users(last_active);

-- ==========================================
-- Departments/Colleges Table
-- ==========================================
CREATE TABLE departments (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_name         VARCHAR(100) NOT NULL UNIQUE,
    department_code         VARCHAR(20) UNIQUE,
    program_chair_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    budget_allocation       DECIMAL(12, 2) DEFAULT 0,
    spent_budget            DECIMAL(12, 2) DEFAULT 0,
    description             TEXT,
    is_active               BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT chk_budget CHECK (spent_budget <= budget_allocation)
);

CREATE INDEX idx_departments_program_chair ON departments(program_chair_id);
CREATE INDEX idx_departments_active ON departments(is_active);

-- ==========================================
-- Programs Table
-- ==========================================
CREATE TABLE programs (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_name            VARCHAR(200) NOT NULL,
    program_description     VARCHAR(1000),
    program_category        VARCHAR(100),
    department_id           UUID REFERENCES departments(id) ON DELETE SET NULL,
    program_chair_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    objectives              VARCHAR(2000),
    target_beneficiaries    VARCHAR(500),
    budget_allocation       DECIMAL(12, 2),
    spent_budget            DECIMAL(12, 2) DEFAULT 0,
    start_date              DATE,
    end_date                DATE,
    status                  program_status NOT NULL DEFAULT 'draft',
    approval_status         approval_status NOT NULL DEFAULT 'pending',
    approved_by             UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at             TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT chk_program_budget CHECK (spent_budget <= budget_allocation),
    CONSTRAINT chk_program_dates CHECK (end_date >= start_date OR end_date IS NULL)
);

CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_approval_status ON programs(approval_status);
CREATE INDEX idx_programs_program_chair ON programs(program_chair_id);
CREATE INDEX idx_programs_category ON programs(program_category);
CREATE INDEX idx_programs_department ON programs(department_id);

-- ==========================================
-- Project Requests Table
-- ==========================================
CREATE TABLE project_requests (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_title               VARCHAR(200) NOT NULL,
    request_description         VARCHAR(2000) NOT NULL,
    requested_by                UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    requested_department        VARCHAR(100),
    estimated_budget            DECIMAL(12, 2),
    target_beneficiaries        VARCHAR(500),
    justification               VARCHAR(2000),
    status                      approval_status NOT NULL DEFAULT 'pending',
    reviewed_by                 UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at                 TIMESTAMPTZ,
    review_notes                TEXT,
    assigned_program_id         UUID REFERENCES programs(id) ON DELETE SET NULL,
    
    -- Department assignment tracking
    assigned_department_id      UUID REFERENCES departments(id) ON DELETE SET NULL,
    assigned_to_project_head    UUID REFERENCES users(id) ON DELETE SET NULL,
    department_assignment_date  TIMESTAMPTZ,
    assignment_notes            TEXT,
    
    -- Project Head response tracking
    project_head_response       VARCHAR(20) CHECK (project_head_response IN ('accepted', 'declined', 'pending')),
    project_head_response_date  TIMESTAMPTZ,
    project_head_notes          TEXT,
    
    -- Proposal tracking
    proposal_document_url       VARCHAR(500),
    proposal_submitted_date     TIMESTAMPTZ,
    proposal_reviewed_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    proposal_review_date        TIMESTAMPTZ,
    proposal_review_notes       TEXT,
    
    -- Workflow stage tracking
    workflow_stage              request_workflow_stage NOT NULL DEFAULT 'submitted',
    
    -- Program chair feedback tracking
    program_chair_feedback      TEXT,
    feedback_provided_date      TIMESTAMPTZ,
    
    -- Final approval tracking (admin)
    final_approved_by           UUID REFERENCES users(id) ON DELETE SET NULL,
    final_approval_date         TIMESTAMPTZ,
    final_approval_notes        TEXT,
    
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_requests_status ON project_requests(status);
CREATE INDEX idx_project_requests_requested_by ON project_requests(requested_by);
CREATE INDEX idx_project_requests_department ON project_requests(requested_department);
CREATE INDEX idx_project_requests_workflow_stage ON project_requests(workflow_stage);
CREATE INDEX idx_project_requests_assigned_dept ON project_requests(assigned_department_id);
CREATE INDEX idx_project_requests_assigned_project_head ON project_requests(assigned_to_project_head);
CREATE INDEX idx_project_requests_project_head_response ON project_requests(project_head_response);
CREATE INDEX idx_project_requests_proposal_reviewed_by ON project_requests(proposal_reviewed_by);
CREATE INDEX idx_project_requests_final_approved_by ON project_requests(final_approved_by);

-- Comments for documentation
COMMENT ON COLUMN project_requests.workflow_stage IS 'Current stage in the request approval workflow';
COMMENT ON COLUMN project_requests.assigned_department_id IS 'Department assigned by program chair for this request';
COMMENT ON COLUMN project_requests.assigned_to_project_head IS 'Specific project head assigned to handle this request';
COMMENT ON COLUMN project_requests.project_head_response IS 'Whether project head accepted or declined the recommendation';
COMMENT ON COLUMN project_requests.proposal_document_url IS 'URL/path to uploaded proposal document';
COMMENT ON COLUMN project_requests.program_chair_feedback IS 'Feedback provided to public user by program chair';
COMMENT ON COLUMN project_requests.final_approved_by IS 'Admin who gave final approval (can be different from reviewed_by)';

-- ==========================================
-- Projects Table
-- ==========================================
CREATE TABLE projects (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name            VARCHAR(200) NOT NULL,
    project_description     VARCHAR(2000),
    program_id              UUID REFERENCES programs(id) ON DELETE SET NULL,
    department_id           UUID REFERENCES departments(id) ON DELETE SET NULL,
    project_head_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    department              VARCHAR(100),
    objectives              VARCHAR(2000),
    budget                  DECIMAL(12, 2),
    start_date              DATE,
    end_date                DATE,
    progress_percentage     INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status                  project_status NOT NULL DEFAULT 'draft',
    approval_status         approval_status NOT NULL DEFAULT 'pending',
    approved_by             UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at             TIMESTAMPTZ,
    creation_source         creation_source_type,
    request_id              UUID REFERENCES project_requests(id) ON DELETE SET NULL,
    created_by              UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    updated_by              UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT chk_project_dates CHECK (end_date >= start_date OR end_date IS NULL)
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_department ON projects(department);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_program_id ON projects(program_id);
CREATE INDEX idx_projects_department_id ON projects(department_id);
CREATE INDEX idx_projects_project_head_id ON projects(project_head_id);
CREATE INDEX idx_projects_approval_status ON projects(approval_status);
CREATE INDEX idx_projects_creation_source ON projects(creation_source);
CREATE INDEX idx_projects_request_id ON projects(request_id);

-- ==========================================
-- Tasks Table
-- ==========================================
CREATE TABLE tasks (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    status              task_status NOT NULL DEFAULT 'pending',
    priority            task_priority NOT NULL DEFAULT 'medium',
    assigned_to         UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by          UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    due_date            DATE,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ==========================================
-- Task Assignments Table
-- ==========================================
CREATE TABLE task_assignments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id             UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at         TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, user_id)
);

CREATE INDEX idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_user ON task_assignments(user_id);

-- ==========================================
-- Blog Posts Table
-- ==========================================
CREATE TABLE blog_posts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               VARCHAR(255) NOT NULL,
    content             TEXT NOT NULL,
    author_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    published           BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_author ON blog_posts(author_id);
CREATE INDEX idx_blog_published ON blog_posts(published);

-- ==========================================
-- SLA Metrics Table
-- ==========================================
CREATE TABLE sla_metrics (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    metric_name         VARCHAR(100) NOT NULL,
    target_value        DECIMAL(10, 2),
    current_value       DECIMAL(10, 2),
    measured_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sla_project ON sla_metrics(project_id);

-- ==========================================
-- Activity Logs Table
-- ==========================================
CREATE TABLE activity_logs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    action              VARCHAR(100) NOT NULL,
    entity_type         VARCHAR(50),
    entity_id           UUID,
    details             JSONB,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at);

-- ==========================================
-- Views for Reporting
-- ==========================================

-- View: Department Budget Summary
CREATE VIEW vw_department_budget_summary AS
SELECT 
    d.id,
    d.department_name,
    d.department_code,
    d.budget_allocation,
    d.spent_budget,
    d.budget_allocation - d.spent_budget AS remaining_budget,
    CASE 
        WHEN d.budget_allocation > 0 THEN ROUND((d.spent_budget / d.budget_allocation * 100)::numeric, 2)
        ELSE 0
    END AS budget_utilization_percentage,
    COUNT(DISTINCT p.id) AS total_programs,
    COUNT(DISTINCT pr.id) AS total_projects,
    u.first_name || ' ' || u.last_name AS program_chair_name
FROM departments d
LEFT JOIN programs p ON d.id = p.department_id
LEFT JOIN projects pr ON d.id = pr.department_id
LEFT JOIN users u ON d.program_chair_id = u.id
GROUP BY d.id, d.department_name, d.department_code, d.budget_allocation, d.spent_budget, u.first_name, u.last_name;

-- View: Program Summary
CREATE VIEW vw_program_summary AS
SELECT 
    p.id,
    p.program_name,
    p.program_category,
    p.status,
    p.approval_status,
    d.department_name,
    u.first_name || ' ' || u.last_name AS program_chair_name,
    COUNT(pr.id) AS total_projects,
    SUM(CASE WHEN pr.status = 'completed' THEN 1 ELSE 0 END) AS completed_projects,
    SUM(CASE WHEN pr.status = 'in_progress' THEN 1 ELSE 0 END) AS active_projects,
    p.budget_allocation,
    p.spent_budget,
    p.start_date,
    p.end_date
FROM programs p
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN users u ON p.program_chair_id = u.id
LEFT JOIN projects pr ON p.id = pr.program_id
GROUP BY p.id, d.department_name, u.first_name, u.last_name;

-- ==========================================
-- Row Level Security Setup
-- ==========================================

-- Create application roles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_admin') THEN
        CREATE ROLE app_admin;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_program_chair') THEN
        CREATE ROLE app_program_chair;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_project_head') THEN
        CREATE ROLE app_project_head;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_staff') THEN
        CREATE ROLE app_staff;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_public_user') THEN
        CREATE ROLE app_public_user;
    END IF;
END $$;

-- Grant permissions

-- Admin: Full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- Program Chair: Full access to programs, departments, projects
GRANT SELECT, INSERT, UPDATE ON departments, programs, projects, project_requests TO app_program_chair;
GRANT SELECT ON users TO app_program_chair;

-- Project Head: Read programs, full access to projects
GRANT SELECT ON departments, programs TO app_project_head;
GRANT SELECT, INSERT, UPDATE ON projects, tasks TO app_project_head;
GRANT SELECT ON users, project_requests TO app_project_head;

-- Staff: View and update tasks
GRANT SELECT ON departments, programs, projects, users TO app_staff;
GRANT SELECT, UPDATE ON tasks TO app_staff;

-- Public User: View projects, submit requests
GRANT SELECT ON projects TO app_public_user;
GRANT SELECT, INSERT ON project_requests TO app_public_user;

-- ==========================================
-- Seed Data
-- ==========================================

-- Insert default departments
INSERT INTO departments (department_name, department_code, description, is_active) VALUES
    ('College of Arts, Sciences and Education', 'CASE', 'Liberal arts, sciences, and teacher education programs', true),
    ('College of Engineering and Architecture', 'CEA', 'Engineering and architecture disciplines', true),
    ('College of Business and Public Administration', 'CBPA', 'Business, accounting, and public administration programs', true),
    ('College of Hospitality and Tourism Management', 'CHTM', 'Hospitality, tourism, and culinary programs', true),
    ('College of Criminal Justice Education', 'CCJE', 'Criminology and law enforcement education', true),
    ('College of Information Technology', 'CIT', 'Computer science and IT programs', true),
    ('College of Computer Studies', 'CCS', 'Software development and computing programs', true);

-- Insert admin user
-- Password: 'password' (hashed with bcrypt)
INSERT INTO users (
    id,
    username,
    first_name,
    last_name,
    email,
    password_hash,
    role,
    department,
    contact_number,
    account_status
) VALUES (
    uuid_generate_v4(),
    'admin',
    'System',
    'Administrator',
    'admin@extensionservice.com',
    '$2a$10$8jy3mYZ0z3QxJxKJ3K3QxJxKJ3K3QxJxKJ3K3QxJxKJ3K3QxJxKJ3',
    'admin',
    NULL,
    NULL,
    'active'
);

-- ==========================================
-- Triggers for updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_requests_updated_at BEFORE UPDATE ON project_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();