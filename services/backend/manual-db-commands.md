# Database Reset
   ```
   psql -U postgres -d ecs_db -f "db-script/database.sql"
   psql -U postgres -d ecs_db -f "db-script/seed_admin.sql"
   ```

# Incremental Migration For Existing DB
   ```sql
   -- 1) Add user-to-program-chair ownership column
   ALTER TABLE users
   ADD COLUMN IF NOT EXISTS assigned_program_chair_id UUID REFERENCES users(id) ON DELETE SET NULL;

   CREATE INDEX IF NOT EXISTS idx_users_assigned_program_chair ON users(assigned_program_chair_id);

   -- 2) Enforce assigned_program_chair_id integrity
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

   DROP TRIGGER IF EXISTS trg_check_user_assigned_program_chair ON users;
   CREATE TRIGGER trg_check_user_assigned_program_chair
   BEFORE INSERT OR UPDATE OF assigned_program_chair_id, role ON users
   FOR EACH ROW EXECUTE FUNCTION check_user_assigned_program_chair();

   -- 3) Enforce global cap of 3 active program chairs
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

   DROP TRIGGER IF EXISTS trg_check_active_program_chair_limit ON users;
   CREATE TRIGGER trg_check_active_program_chair_limit
   BEFORE INSERT OR UPDATE OF role, account_status ON users
   FOR EACH ROW EXECUTE FUNCTION check_active_program_chair_limit();
   ```

