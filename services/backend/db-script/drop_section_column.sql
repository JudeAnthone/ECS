-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_number VARCHAR(15);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ;

-- Add constraints
ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

-- Update existing users with temporary values
UPDATE users SET 
    username = LOWER(REPLACE(SPLIT_PART(email, '@', 1), '.', ''))
WHERE username IS NULL;

UPDATE users SET first_name = 'User', last_name = 'Name' WHERE first_name IS NULL;

-- Make required fields NOT NULL
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN last_name SET NOT NULL;