-- Extension Service System Database Schema
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and types
DROP VIEW IF EXISTS vw_department_budget_summary CASCADE;
DROP VIEW IF EXISTS vw_program_summary CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS sla_metrics CASCADE;
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS budget_requests CASCADE;
DROP TABLE IF EXISTS kpi_reports CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS program_feedback CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
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
DROP TYPE IF EXISTS document_type CASCADE;
DROP TYPE IF EXISTS budget_request_status CASCADE;
DROP TYPE IF EXISTS feedback_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- ==========================================
-- ENUM Types
-- ==========================================

CREATE TYPE auth_provider AS ENUM ('local', 'google');

CREATE TYPE user_role AS ENUM (
    'admin',
    'program_chair',
    'project_head',
    'staff',
    'public_user'
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
    'draft',
    'submitted',
    'under_review',
    'changes_requested',
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
    'submitted',
    'under_program_chair_review',
    'feedback_provided',
    'assigned_to_department',
    'project_head_reviewing',
    'project_head_accepted',
    'project_head_declined',
    'proposal_submitted',
    'proposal_under_review',
    'proposal_changes_requested',
    'pending_final_approval',
    'approved',
    'rejected'
);

CREATE TYPE document_type AS ENUM (
    'proposal',
    'accomplishment_report',
    'market_research',
    'revision',
    'budget_report',
    'kpi_report',
    'other'
);

CREATE TYPE budget_request_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE notification_type AS ENUM (
    'request_submitted',
    'request_updated',
    'request_approved',
    'request_rejected',
    'task_assigned',
    'task_completed',
    'proposal_submitted',
    'proposal_approved',
    'proposal_rejected',
    'budget_request',
    'budget_approved',
    'project_assigned',
    'program_chair_assigned',
    'feedback_received',
    'general'
);

-- ==========================================
-- Users Table
-- ==========================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(50) UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9_]+$'),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'public_user',
    department      VARCHAR(100),
    assigned_program_chair_id UUID REFERENCES users(id) ON DELETE SET NULL,
    contact_number  VARCHAR(15),
    account_status  account_status NOT NULL DEFAULT 'pending_approval',
    avatar_url      VARCHAR(255),
    last_active     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    -- department required for college-based roles only;
    -- program_chair is in Administration, not tied to a college department
    CONSTRAINT chk_department_role CHECK (
        (role IN ('project_head', 'staff') AND department IS NOT NULL)
        OR (role IN ('admin', 'program_chair', 'public_user'))
    )
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_assigned_program_chair ON users(assigned_program_chair_id);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_last_active ON users(last_active);

-- ==========================================
-- Departments/Colleges Table
-- ==========================================
CREATE TABLE departments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_name     VARCHAR(100) NOT NULL UNIQUE,
    department_code     VARCHAR(20) UNIQUE,
    -- program_chair_id is set when admin assigns a program chair to a department
    program_chair_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    budget_allocation   DECIMAL(12, 2) DEFAULT 0,
    spent_budget        DECIMAL(12, 2) DEFAULT 0,
    description         TEXT,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_dept_budget CHECK (
        spent_budget <= budget_allocation
        OR budget_allocation = 0
    )
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
    -- department this program belongs to
    department_id           UUID REFERENCES departments(id) ON DELETE SET NULL,
    -- program chair assigned to manage this program (admin assigns)
    program_chair_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    objectives              VARCHAR(2000),
    target_beneficiaries    VARCHAR(500),
    -- parent budget — project budgets cannot exceed this
    budget_allocation       DECIMAL(12, 2),
    -- sum of approved project budgets auto-updated by trigger
    spent_budget            DECIMAL(12, 2) DEFAULT 0,
    start_date              DATE,
    end_date                DATE,
    status                  program_status NOT NULL DEFAULT 'draft',
    -- admin-created programs are auto-approved
    approval_status         approval_status NOT NULL DEFAULT 'pending',
    approved_by             UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at             TIMESTAMPTZ,
    is_published            BOOLEAN DEFAULT FALSE, -- controls public visibility
    created_by              UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_program_dates CHECK (end_date >= start_date OR end_date IS NULL),
    CONSTRAINT chk_program_budget CHECK (
        spent_budget <= budget_allocation
        OR budget_allocation IS NULL
    )
);

CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_approval_status ON programs(approval_status);
CREATE INDEX idx_programs_program_chair ON programs(program_chair_id);
CREATE INDEX idx_programs_category ON programs(program_category);
CREATE INDEX idx_programs_department ON programs(department_id);
CREATE INDEX idx_programs_published ON programs(is_published);

-- ==========================================
-- Project Requests Table (Public User → System)
-- ==========================================
CREATE TABLE project_requests (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_title               VARCHAR(200) NOT NULL,
    request_description         VARCHAR(2000) NOT NULL,
    requested_by                UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    requested_department        VARCHAR(100),
    -- UUID FK set when public user selects a department from the dropdown
    requested_department_id     UUID REFERENCES departments(id) ON DELETE SET NULL,
    estimated_budget            DECIMAL(12, 2),
    target_beneficiaries        VARCHAR(500),
    justification               VARCHAR(2000),
    status                      approval_status NOT NULL DEFAULT 'pending',

    -- Program Chair review
    reviewed_by                 UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at                 TIMESTAMPTZ,
    review_notes                TEXT,
    assigned_program_id         UUID REFERENCES programs(id) ON DELETE SET NULL,
    program_chair_feedback      TEXT,
    feedback_provided_date      TIMESTAMPTZ,

    -- Department assignment (Program Chair assigns)
    assigned_department_id      UUID REFERENCES departments(id) ON DELETE SET NULL,
    assigned_to_project_head    UUID REFERENCES users(id) ON DELETE SET NULL,
    department_assignment_date  TIMESTAMPTZ,
    assignment_notes            TEXT,

    -- Project Head response
    project_head_response       VARCHAR(20) CHECK (
        project_head_response IN ('accepted', 'declined', 'pending')
    ),
    project_head_response_date  TIMESTAMPTZ,
    project_head_notes          TEXT,

    -- Proposal tracking
    proposal_document_url       VARCHAR(500),
    proposal_submitted_date     TIMESTAMPTZ,
    proposal_reviewed_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    proposal_review_date        TIMESTAMPTZ,
    proposal_review_notes       TEXT,

    -- Workflow
    workflow_stage              request_workflow_stage NOT NULL DEFAULT 'submitted',

    -- Final Admin approval
    final_approved_by           UUID REFERENCES users(id) ON DELETE SET NULL,
    final_approval_date         TIMESTAMPTZ,
    final_approval_notes        TEXT,

    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_requests_status ON project_requests(status);
CREATE INDEX idx_project_requests_requested_by ON project_requests(requested_by);
CREATE INDEX idx_project_requests_workflow_stage ON project_requests(workflow_stage);
CREATE INDEX idx_project_requests_assigned_dept ON project_requests(assigned_department_id);
CREATE INDEX idx_project_requests_assigned_head ON project_requests(assigned_to_project_head);

-- ==========================================
-- Projects Table
-- ==========================================
CREATE TABLE projects (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name            VARCHAR(200) NOT NULL,
    project_description     VARCHAR(2000),
    objectives              VARCHAR(2000),
    -- parent program (budget constraint enforced by trigger)
    program_id              UUID REFERENCES programs(id) ON DELETE SET NULL,
    -- department this project belongs to
    department_id           UUID REFERENCES departments(id) ON DELETE SET NULL,
    -- project head assigned to manage this project
    project_head_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    -- budget allocated to this project — cannot exceed parent program remaining budget
    budget_allocated        DECIMAL(12, 2),
    budget_used             DECIMAL(12, 2) DEFAULT 0,
    start_date              DATE,
    end_date                DATE,
    progress_percentage     INTEGER DEFAULT 0 CHECK (
        progress_percentage >= 0 AND progress_percentage <= 100
    ),
    status                  project_status NOT NULL DEFAULT 'planning',
    -- admin/program_chair creates = auto approved
    -- project_head proposes = pending
    approval_status         approval_status NOT NULL DEFAULT 'pending',
    approved_by             UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at             TIMESTAMPTZ,
    is_published            BOOLEAN DEFAULT FALSE, -- public visibility
    creation_source         creation_source_type NOT NULL DEFAULT 'internal_proposal',
    -- if created from a public request
    request_id              UUID REFERENCES project_requests(id) ON DELETE SET NULL,
    created_by              UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    updated_by              UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_project_dates CHECK (end_date >= start_date OR end_date IS NULL),
    CONSTRAINT chk_project_budget CHECK (
        budget_used <= budget_allocated
        OR budget_allocated IS NULL
    )
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_program_id ON projects(program_id);
CREATE INDEX idx_projects_department_id ON projects(department_id);
CREATE INDEX idx_projects_project_head_id ON projects(project_head_id);
CREATE INDEX idx_projects_approval_status ON projects(approval_status);
CREATE INDEX idx_projects_creation_source ON projects(creation_source);
CREATE INDEX idx_projects_request_id ON projects(request_id);
CREATE INDEX idx_projects_published ON projects(is_published);

-- ==========================================
-- Tasks Table
-- ==========================================
CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          task_status NOT NULL DEFAULT 'pending',
    priority        task_priority NOT NULL DEFAULT 'medium',
    -- assigned_to: staff member assigned by project head
    assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    due_date        DATE,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ==========================================
-- Task Assignments Table (many staff per task)
-- ==========================================
CREATE TABLE task_assignments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(task_id, user_id)
);

CREATE INDEX idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_user ON task_assignments(user_id);

-- ==========================================
-- Documents Table
-- (proposals, accomplishment reports, market research, revisions)
-- uploaded by project_head or staff, reviewed by program_chair or admin
-- ==========================================
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
    request_id      UUID REFERENCES project_requests(id) ON DELETE CASCADE,
    uploaded_by     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    document_type   document_type NOT NULL,
    title           VARCHAR(200) NOT NULL,
    file_url        VARCHAR(500) NOT NULL,
    status          proposal_status NOT NULL DEFAULT 'submitted',
    reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes    TEXT,
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    -- must belong to either a project or a request
    CONSTRAINT chk_document_parent CHECK (
        project_id IS NOT NULL OR request_id IS NOT NULL
    )
);

CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_request ON documents(request_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);

-- ==========================================
-- Budget Requests Table
-- (project_head requests more funding from admin/program_chair)
-- ==========================================
CREATE TABLE budget_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    requested_by    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount          DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    reason          TEXT NOT NULL,
    status          budget_request_status NOT NULL DEFAULT 'pending',
    reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes    TEXT,
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_requests_project ON budget_requests(project_id);
CREATE INDEX idx_budget_requests_requested_by ON budget_requests(requested_by);
CREATE INDEX idx_budget_requests_status ON budget_requests(status);

-- ==========================================
-- KPI Reports Table
-- (project_head creates, program_chair reviews, admin sees all)
-- ==========================================
CREATE TABLE kpi_reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_by      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    title           VARCHAR(200) NOT NULL,
    -- flexible JSON: { "beneficiaries": 100, "completion_rate": 85, ... }
    metrics         JSONB NOT NULL DEFAULT '{}',
    period_start    DATE,
    period_end      DATE,
    status          proposal_status NOT NULL DEFAULT 'draft',
    review_notes    TEXT,
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpi_project ON kpi_reports(project_id);
CREATE INDEX idx_kpi_department ON kpi_reports(department_id);
CREATE INDEX idx_kpi_created_by ON kpi_reports(created_by);
CREATE INDEX idx_kpi_status ON kpi_reports(status);

-- ==========================================
-- Program Feedback Table
-- (public users rate/review completed programs)
-- ==========================================
CREATE TABLE program_feedback (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id      UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    submitted_by    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating          INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text   TEXT,
    -- program_chair/admin can publish to public view
    is_published    BOOLEAN DEFAULT FALSE,
    -- program chair response to feedback
    response_text   TEXT,
    responded_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    responded_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    -- one feedback per user per program
    UNIQUE(program_id, submitted_by)
);

CREATE INDEX idx_feedback_program ON program_feedback(program_id);
CREATE INDEX idx_feedback_submitted_by ON program_feedback(submitted_by);
CREATE INDEX idx_feedback_published ON program_feedback(is_published);

-- ==========================================
-- Notifications Table
-- (all roles receive notifications on status changes)
-- ==========================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    type            notification_type NOT NULL DEFAULT 'general',
    -- which entity triggered this notification
    entity_type     VARCHAR(50), -- 'project', 'project_request', 'task', 'document', etc.
    entity_id       UUID,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ==========================================
-- Blog Posts Table (public-facing news/updates)
-- ==========================================
CREATE TABLE blog_posts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL,
    author_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    published   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_author ON blog_posts(author_id);
CREATE INDEX idx_blog_published ON blog_posts(published);

-- ==========================================
-- SLA Metrics Table
-- ==========================================
CREATE TABLE sla_metrics (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    metric_name     VARCHAR(100) NOT NULL,
    target_value    DECIMAL(10, 2),
    current_value   DECIMAL(10, 2),
    measured_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sla_project ON sla_metrics(project_id);

-- ==========================================
-- Activity Logs Table (audit trail for admin)
-- ==========================================
CREATE TABLE activity_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),  -- 'program', 'project', 'user', 'request', etc.
    entity_id   UUID,
    old_values  JSONB,        -- snapshot before change
    new_values  JSONB,        -- snapshot after change
    details     JSONB,        -- extra context
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(500),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- 1. Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_requests_updated_at BEFORE UPDATE ON project_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_requests_updated_at BEFORE UPDATE ON budget_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kpi_reports_updated_at BEFORE UPDATE ON kpi_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Project budget cannot exceed remaining program budget
CREATE OR REPLACE FUNCTION check_project_budget()
RETURNS TRIGGER AS $$
DECLARE
    prog_budget     DECIMAL(12,2);
    total_allocated DECIMAL(12,2);
    remaining       DECIMAL(12,2);
BEGIN
    -- skip if no budget or no program
    IF NEW.budget_allocated IS NULL OR NEW.program_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT budget_allocation INTO prog_budget
    FROM programs WHERE id = NEW.program_id;

    -- skip if program has no budget set
    IF prog_budget IS NULL THEN RETURN NEW; END IF;

    -- sum of all OTHER approved projects under this program
    SELECT COALESCE(SUM(budget_allocated), 0) INTO total_allocated
    FROM projects
    WHERE program_id = NEW.program_id
      AND approval_status = 'approved'
      AND id != COALESCE(NEW.id, uuid_generate_v4()); -- exclude self on UPDATE

    remaining := prog_budget - total_allocated;

    IF NEW.budget_allocated > remaining THEN
        RAISE EXCEPTION 
            'Project budget (₱%) exceeds remaining program budget (₱%). Reduce the budget.',
            NEW.budget_allocated, remaining;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_project_budget
BEFORE INSERT OR UPDATE OF budget_allocated, approval_status, program_id ON projects
FOR EACH ROW EXECUTE FUNCTION check_project_budget();

-- 3. Project dates must be within parent program dates
CREATE OR REPLACE FUNCTION check_project_dates()
RETURNS TRIGGER AS $$
DECLARE
    prog_start DATE;
    prog_end   DATE;
BEGIN
    IF NEW.program_id IS NULL THEN RETURN NEW; END IF;

    SELECT start_date, end_date INTO prog_start, prog_end
    FROM programs WHERE id = NEW.program_id;

    IF prog_start IS NOT NULL AND NEW.start_date IS NOT NULL THEN
        IF NEW.start_date < prog_start THEN
            RAISE EXCEPTION 'Project start date (%) cannot be before program start date (%)',
                NEW.start_date, prog_start;
        END IF;
    END IF;

    IF prog_end IS NOT NULL AND NEW.end_date IS NOT NULL THEN
        IF NEW.end_date > prog_end THEN
            RAISE EXCEPTION 'Project end date (%) cannot exceed program end date (%)',
                NEW.end_date, prog_end;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_project_dates
BEFORE INSERT OR UPDATE OF start_date, end_date, program_id ON projects
FOR EACH ROW EXECUTE FUNCTION check_project_dates();

-- 4. Auto update program spent_budget when project approved
CREATE OR REPLACE FUNCTION sync_program_spent_budget()
RETURNS TRIGGER AS $$
BEGIN
    -- recalculate spent_budget for the affected program
    UPDATE programs
    SET spent_budget = (
        SELECT COALESCE(SUM(budget_allocated), 0)
        FROM projects
        WHERE program_id = COALESCE(NEW.program_id, OLD.program_id)
          AND approval_status = 'approved'
    )
    WHERE id = COALESCE(NEW.program_id, OLD.program_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_program_budget
AFTER INSERT OR UPDATE OF budget_allocated, approval_status OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION sync_program_spent_budget();

-- 5. Program chair must have role = 'program_chair'
CREATE OR REPLACE FUNCTION check_program_chair_role()
RETURNS TRIGGER AS $$
DECLARE
    chair_role user_role;
BEGIN
    IF NEW.program_chair_id IS NULL THEN RETURN NEW; END IF;

    SELECT role INTO chair_role FROM users WHERE id = NEW.program_chair_id;

    IF chair_role != 'program_chair' THEN
        RAISE EXCEPTION 'Assigned user must have role program_chair, got: %', chair_role;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_program_chair_role
BEFORE INSERT OR UPDATE OF program_chair_id ON programs
FOR EACH ROW EXECUTE FUNCTION check_program_chair_role();

-- 6. Project head must have role = 'project_head'
CREATE OR REPLACE FUNCTION check_project_head_role()
RETURNS TRIGGER AS $$
DECLARE
    head_role user_role;
BEGIN
    IF NEW.project_head_id IS NULL THEN RETURN NEW; END IF;

    SELECT role INTO head_role FROM users WHERE id = NEW.project_head_id;

    IF head_role != 'project_head' THEN
        RAISE EXCEPTION 'Assigned user must have role project_head, got: %', head_role;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_project_head_role
BEFORE INSERT OR UPDATE OF project_head_id ON projects
FOR EACH ROW EXECUTE FUNCTION check_project_head_role();

-- 7. assigned_program_chair_id must reference a program_chair and only be used by project_head/staff
CREATE OR REPLACE FUNCTION check_user_assigned_program_chair()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role user_role;
BEGIN
    IF NEW.assigned_program_chair_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.role NOT IN ('project_head', 'staff') THEN
        RAISE EXCEPTION 'Only project_head and staff can have assigned_program_chair_id';
    END IF;

    SELECT role INTO assigned_role FROM users WHERE id = NEW.assigned_program_chair_id;

    IF assigned_role IS NULL OR assigned_role != 'program_chair' THEN
        RAISE EXCEPTION 'assigned_program_chair_id must reference a user with role program_chair';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_user_assigned_program_chair
BEFORE INSERT OR UPDATE OF assigned_program_chair_id, role ON users
FOR EACH ROW EXECUTE FUNCTION check_user_assigned_program_chair();

-- 8. Enforce global cap of 3 active program chairs
CREATE OR REPLACE FUNCTION check_active_program_chair_limit()
RETURNS TRIGGER AS $$
DECLARE
    active_chair_count INT;
BEGIN
    IF NEW.role != 'program_chair' OR NEW.account_status != 'active' THEN
        RETURN NEW;
    END IF;

    SELECT COUNT(*) INTO active_chair_count
    FROM users
    WHERE role = 'program_chair'
      AND account_status = 'active'
      AND id <> NEW.id;

    IF active_chair_count >= 3 THEN
        RAISE EXCEPTION 'program chair limit reached: only 3 active program chairs are allowed';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_active_program_chair_limit
BEFORE INSERT OR UPDATE OF role, account_status ON users
FOR EACH ROW EXECUTE FUNCTION check_active_program_chair_limit();

-- 9. Auto-create notification on project_request status change
CREATE OR REPLACE FUNCTION notify_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.workflow_stage IS DISTINCT FROM NEW.workflow_stage THEN
        INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
        VALUES (
            NEW.requested_by,
            'Project Request Updated',
            'Your request "' || NEW.request_title || '" status changed to: ' || NEW.workflow_stage,
            'request_updated',
            'project_request',
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_request_change
AFTER UPDATE OF workflow_stage ON project_requests
FOR EACH ROW EXECUTE FUNCTION notify_request_status_change();

-- ==========================================
-- VIEWS
-- ==========================================

CREATE VIEW vw_department_budget_summary AS
SELECT
    d.id,
    d.department_name,
    d.department_code,
    d.budget_allocation,
    d.spent_budget,
    d.budget_allocation - d.spent_budget AS remaining_budget,
    CASE
        WHEN d.budget_allocation > 0
        THEN ROUND((d.spent_budget / d.budget_allocation * 100)::numeric, 2)
        ELSE 0
    END AS budget_utilization_percentage,
    COUNT(DISTINCT p.id)   AS total_programs,
    COUNT(DISTINCT pr.id)  AS total_projects,
    SUM(CASE WHEN pr.status = 'in_progress' THEN 1 ELSE 0 END) AS active_projects,
    SUM(CASE WHEN pr.status = 'completed'   THEN 1 ELSE 0 END) AS completed_projects,
    u.first_name || ' ' || u.last_name AS program_chair_name
FROM departments d
LEFT JOIN programs p  ON d.id = p.department_id
LEFT JOIN projects pr ON d.id = pr.department_id
LEFT JOIN users u     ON d.program_chair_id = u.id
GROUP BY d.id, d.department_name, d.department_code,
         d.budget_allocation, d.spent_budget,
         u.first_name, u.last_name;

CREATE VIEW vw_program_summary AS
SELECT
    p.id,
    p.program_name,
    p.program_category,
    p.status,
    p.approval_status,
    p.is_published,
    d.department_name,
    u.first_name || ' ' || u.last_name AS program_chair_name,
    COUNT(pr.id)  AS total_projects,
    SUM(CASE WHEN pr.status = 'completed'   THEN 1 ELSE 0 END) AS completed_projects,
    SUM(CASE WHEN pr.status = 'in_progress' THEN 1 ELSE 0 END) AS active_projects,
    p.budget_allocation,
    p.spent_budget,
    p.budget_allocation - p.spent_budget AS remaining_budget,
    p.start_date,
    p.end_date
FROM programs p
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN users u       ON p.program_chair_id = u.id
LEFT JOIN projects pr   ON p.id = pr.program_id
GROUP BY p.id, d.department_name, u.first_name, u.last_name;

-- Public-facing view (only published, approved, active programs + projects)
CREATE VIEW vw_public_programs AS
SELECT
    p.id,
    p.program_name,
    p.program_description,
    p.program_category,
    p.objectives,
    p.target_beneficiaries,
    p.start_date,
    p.end_date,
    p.status,
    d.department_name,
    COUNT(pr.id) AS total_projects,
    SUM(CASE WHEN pr.status = 'in_progress' THEN 1 ELSE 0 END) AS active_projects,
    SUM(CASE WHEN pr.status = 'completed'   THEN 1 ELSE 0 END) AS completed_projects
FROM programs p
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN projects pr   ON p.id = pr.program_id AND pr.is_published = TRUE
WHERE p.is_published = TRUE
  AND p.approval_status = 'approved'
  AND p.status IN ('active', 'completed')
GROUP BY p.id, d.department_name;

-- ==========================================
-- Row Level Security
-- ==========================================
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

GRANT ALL ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_admin;

GRANT SELECT, INSERT, UPDATE ON departments, programs, projects, project_requests, documents, kpi_reports TO app_program_chair;
GRANT SELECT ON users TO app_program_chair;
GRANT SELECT, INSERT ON notifications TO app_program_chair;

GRANT SELECT ON departments, programs TO app_project_head;
GRANT SELECT, INSERT, UPDATE ON projects, tasks, documents, kpi_reports, budget_requests TO app_project_head;
GRANT SELECT ON users, project_requests TO app_project_head;
GRANT SELECT, INSERT ON notifications TO app_project_head;

GRANT SELECT ON departments, programs, projects, users TO app_staff;
GRANT SELECT, UPDATE ON tasks TO app_staff;
GRANT SELECT, INSERT ON documents TO app_staff;
GRANT SELECT ON notifications TO app_staff;

GRANT SELECT ON vw_public_programs TO app_public_user;
GRANT SELECT, INSERT ON project_requests TO app_public_user;
GRANT SELECT, INSERT ON program_feedback TO app_public_user;
GRANT SELECT ON notifications TO app_public_user;

-- ==========================================
-- Seed Data
-- ==========================================

INSERT INTO departments (department_name, department_code, description, is_active) VALUES
    ('College of Architecture and Fine Arts',      'CAFA', 'Architecture and fine arts programs', true),
    ('College of Arts and Sciences',               'CAS',  'Liberal arts and sciences programs', true),
    ('College of Business and Public Administration','CBPA','Business, accounting, and public administration programs', true),
    ('College of Computer Studies',                'CCS',  'Software development and computing programs', true),
    ('College of Criminal Justice Education',      'CCJE', 'Criminology and law enforcement education', true),
    ('College of Education',                       'CED',  'Teacher education and education programs', true),
    ('College of Engineering',                     'CEN',  'Engineering disciplines', true),
    ('College of Hospitality and Tourism Management','CHITM','Hospitality, tourism, and culinary programs', true),
    ('College of Industrial Technology',           'CIT',  'Industrial technology and applied technology programs', true),
    ('Extension Coordination Center',              'ECC',  'Extension coordination center and services', true),
    ('Graduate School',                            'GRAD', 'Graduate-level programs and research', true),
    ('Program Management',                         'PM',   'Program management office for program chairs', true),
    ('System Administration',                      'ADMIN','System administration and central services', true)
;