CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM (
    'admin',
    'program_chair',
    'project_head',
    'staff',
    'public_user'
);

CREATE TYPE section_type AS ENUM (
    'section_a',
    'section_b',
    'section_c'
);

CREATE TYPE project_status AS ENUM (
    'proposed',
    'pending',
    'ongoing',
    'completed',
    'cancelled'
);

CREATE TYPE proposal_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE task_status AS ENUM (
    'assigned',
    'in_progress',
    'completed',
    'overdue'
);

CREATE TYPE report_status AS ENUM (
    'submitted',
    'reviewed',
    'resolved'
);

CREATE TYPE auth_provider AS ENUM (
    'local',
    'google'
);

CREATE TYPE account_status AS ENUM (
    'pending_approval',
    'active',
    'rejected',
    'deactivated'
);

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name          VARCHAR(75) NOT NULL,
    last_name           VARCHAR(75) NOT NULL,
    email               VARCHAR(150) UNIQUE NOT NULL,
    username            VARCHAR(50) UNIQUE NOT NULL,
    password_hash       TEXT,
    auth_provider       auth_provider NOT NULL DEFAULT 'local',
    google_id           VARCHAR(255) UNIQUE,
    avatar_url          TEXT,
    role                user_role NOT NULL DEFAULT 'public_user',
    department          VARCHAR(100),
    contact_number      VARCHAR(15),
    account_status      account_status NOT NULL DEFAULT 'pending_approval',
    approved_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at         TIMESTAMPTZ,
    last_active         TIMESTAMPTZ,
    is_active           BOOLEAN NOT NULL GENERATED ALWAYS AS (account_status = 'active') STORED,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_department_role CHECK (
        (role IN ('program_chair', 'project_head', 'staff') AND department IS NOT NULL)
        OR
        (role IN ('admin', 'public_user'))
    ),
    CONSTRAINT chk_username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,50}$'),
    CONSTRAINT chk_local_auth CHECK (
        (auth_provider = 'local' AND password_hash IS NOT NULL)
        OR
        (auth_provider = 'google' AND google_id IS NOT NULL)
    )
);

CREATE TABLE projects (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    status              project_status NOT NULL DEFAULT 'pending',
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_head_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    start_date          DATE,
    end_date            DATE,
    is_public_visible   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE project_proposals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposed_by     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          proposal_status NOT NULL DEFAULT 'pending',
    reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_by     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          task_status NOT NULL DEFAULT 'assigned',
    due_date        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id         UUID REFERENCES tasks(id) ON DELETE SET NULL,
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    submitted_by    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    status          report_status NOT NULL DEFAULT 'submitted',
    reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    is_published    BOOLEAN NOT NULL DEFAULT FALSE,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE analytics_snapshots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generated_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    scope           VARCHAR(50) NOT NULL,
    data            JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_admin') THEN
        CREATE ROLE app_admin NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_program_chair') THEN
        CREATE ROLE app_program_chair NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_project_head') THEN
        CREATE ROLE app_project_head NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_staff') THEN
        CREATE ROLE app_staff NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_public_user') THEN
        CREATE ROLE app_public_user NOLOGIN;
    END IF;
END $$;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;

GRANT SELECT, INSERT, UPDATE, DELETE ON users TO app_program_chair;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO app_program_chair;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_proposals TO app_program_chair;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO app_program_chair;
GRANT SELECT, INSERT, UPDATE, DELETE ON reports TO app_program_chair;
GRANT SELECT ON analytics_snapshots TO app_program_chair;
GRANT SELECT ON blog_posts TO app_program_chair;

GRANT SELECT, INSERT, UPDATE ON projects TO app_project_head;
GRANT SELECT, INSERT ON project_proposals TO app_project_head;
GRANT SELECT, INSERT, UPDATE ON tasks TO app_project_head;
GRANT SELECT, INSERT, UPDATE ON reports TO app_project_head;
GRANT SELECT ON users TO app_project_head;

GRANT SELECT ON tasks TO app_staff;
GRANT SELECT, INSERT, UPDATE ON reports TO app_staff;
GRANT SELECT ON projects TO app_staff;

GRANT SELECT ON projects TO app_public_user;
GRANT SELECT ON blog_posts TO app_public_user;
GRANT SELECT, INSERT ON project_proposals TO app_public_user;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_all_users ON users
    TO app_admin
    USING (true)
    WITH CHECK (true);

-- Program chairs can view and manage users (application will filter by department)
CREATE POLICY chair_manage_users ON users
    TO app_program_chair
    USING (true)
    WITH CHECK (role IN ('project_head', 'staff'));

CREATE POLICY head_view_users ON users
    TO app_project_head
    USING (true);

CREATE POLICY staff_own_user ON users
    TO app_staff
    USING (id = current_setting('app.current_user_id')::UUID);

CREATE POLICY admin_all_projects ON projects
    TO app_admin
    USING (true)
    WITH CHECK (true);

-- Program chairs can view and manage all projects (application will filter by department)
CREATE POLICY chair_manage_projects ON projects
    TO app_program_chair
    USING (true)
    WITH CHECK (true);

CREATE POLICY head_own_projects ON projects
    TO app_project_head
    USING (assigned_head_id = current_setting('app.current_user_id')::UUID)
    WITH CHECK (assigned_head_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY staff_view_projects ON projects
    TO app_staff
    USING (
        is_public_visible = TRUE
        OR id IN (
            SELECT DISTINCT project_id FROM tasks
            WHERE assigned_to = current_setting('app.current_user_id')::UUID
        )
    );

CREATE POLICY public_view_projects ON projects
    TO app_public_user
    USING (is_public_visible = TRUE AND status NOT IN ('cancelled'));

CREATE POLICY admin_all_proposals ON project_proposals
    TO app_admin USING (true) WITH CHECK (true);

-- Program chairs can view and manage all proposals (application will filter by department)
CREATE POLICY chair_manage_proposals ON project_proposals
    TO app_program_chair
    USING (true)
    WITH CHECK (true);

CREATE POLICY head_own_proposals ON project_proposals
    TO app_project_head
    USING (proposed_by = current_setting('app.current_user_id')::UUID)
    WITH CHECK (proposed_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY public_own_proposals ON project_proposals
    TO app_public_user
    USING (proposed_by = current_setting('app.current_user_id')::UUID)
    WITH CHECK (proposed_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY admin_all_tasks ON tasks
    TO app_admin USING (true) WITH CHECK (true);

-- Program chairs can view all tasks (application will filter by department)
CREATE POLICY chair_view_tasks ON tasks
    TO app_program_chair
    USING (true);

CREATE POLICY head_own_tasks ON tasks
    TO app_project_head
    USING (assigned_by = current_setting('app.current_user_id')::UUID)
    WITH CHECK (assigned_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY staff_own_tasks ON tasks
    TO app_staff
    USING (assigned_to = current_setting('app.current_user_id')::UUID);

CREATE POLICY admin_all_reports ON reports
    TO app_admin USING (true) WITH CHECK (true);

-- Program chairs can view all reports (application will filter by department)
CREATE POLICY chair_view_reports ON reports
    TO app_program_chair
    USING (true);

CREATE POLICY head_section_reports ON reports
    TO app_project_head
    USING (
        project_id IN (
            SELECT id FROM projects
            WHERE assigned_head_id = current_setting('app.current_user_id')::UUID
        )
    );

CREATE POLICY staff_own_reports ON reports
    TO app_staff
    USING (submitted_by = current_setting('app.current_user_id')::UUID)
    WITH CHECK (submitted_by = current_setting('app.current_user_id')::UUID);

CREATE POLICY admin_all_blog ON blog_posts
    TO app_admin USING (true) WITH CHECK (true);

CREATE POLICY public_read_blog ON blog_posts
    TO app_program_chair, app_project_head, app_staff, app_public_user
    USING (is_published = TRUE);

CREATE POLICY admin_all_analytics ON analytics_snapshots
    TO app_admin USING (true) WITH CHECK (true);

-- Program chairs can view global analytics (application will filter by department for specific data)
CREATE POLICY chair_view_analytics ON analytics_snapshots
    TO app_program_chair
    USING (scope = 'global');

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_last_active ON users(last_active);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_assigned_head ON projects(assigned_head_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_reports_submitted_by ON reports(submitted_by);
CREATE INDEX idx_reports_project ON reports(project_id);
CREATE INDEX idx_proposals_proposed_by ON project_proposals(proposed_by);
CREATE INDEX idx_blog_published ON blog_posts(is_published, published_at);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_proposals_updated BEFORE UPDATE ON project_proposals
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_blog_updated BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

INSERT INTO users (first_name, last_name, email, username, password_hash, auth_provider, role, account_status)
VALUES (
    'System',
    'Administrator',
    'admin@extensionservice.com',
    'admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'local',
    'admin',
    'active'
);