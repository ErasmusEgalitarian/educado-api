-- Migration: Add missing columns to users table
-- The users table was created with an older model that only had (id, email, status, role, username, phone).
-- The current model requires additional columns. This migration adds them safely for existing rows.
--
-- Safe to run multiple times (idempotent).
-- MUST be run before deploying the updated Sequelize models.
--
-- Usage:
--   psql $POSTGRES_URI -f migrations/002-add-missing-users-columns.sql

BEGIN;

-- Step 1: Add missing columns as NULLABLE first (so existing rows don't break)

ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_normalized VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_media_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Step 2: Fill default values for existing rows that have NULLs

-- first_name: extract from email (part before @, replace dots/hyphens with spaces)
UPDATE users SET first_name = initcap(split_part(split_part(email, '@', 1), '.', 1))
WHERE first_name IS NULL;

-- last_name: extract second part from email, or use '-' if no dot
UPDATE users SET last_name = CASE
  WHEN split_part(split_part(email, '@', 1), '.', 2) != ''
    THEN initcap(split_part(split_part(email, '@', 1), '.', 2))
  ELSE '-'
END
WHERE last_name IS NULL;

-- email_normalized: lowercase email
UPDATE users SET email_normalized = lower(email)
WHERE email_normalized IS NULL;

-- password_hash: placeholder — these users MUST go through password reset
-- This value will never match any bcrypt.compare() call
UPDATE users SET password_hash = 'MIGRATED_NO_PASSWORD'
WHERE password_hash IS NULL;

-- created_at / updated_at: default to now
UPDATE users SET created_at = NOW() WHERE created_at IS NULL;
UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;

-- Step 3: Add NOT NULL constraints on required columns

ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN last_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN email_normalized SET NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE users ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE users ALTER COLUMN updated_at SET NOT NULL;

-- Step 4: Add unique constraint on email_normalized if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_normalized_key'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'user_email_normalized_uq'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_normalized_key UNIQUE (email_normalized);
  END IF;
END $$;

COMMIT;
