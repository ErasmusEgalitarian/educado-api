BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'enum_users_status'
      AND e.enumlabel = 'PENDING_EMAIL_VERIFICATION'
  ) THEN
    ALTER TYPE "enum_users_status" ADD VALUE 'PENDING_EMAIL_VERIFICATION';
  END IF;
END $$;

ALTER TABLE IF EXISTS institutions
  ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true;

UPDATE institutions
SET domain = lower(regexp_replace(trim(domain), '^@+', ''))
WHERE domain IS NOT NULL;

UPDATE institutions
SET "secondaryDomain" = lower(regexp_replace(trim("secondaryDomain"), '^@+', ''))
WHERE "secondaryDomain" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS institution_domain_lower_uq
  ON institutions (lower(domain));

CREATE UNIQUE INDEX IF NOT EXISTS institution_secondary_domain_lower_uq
  ON institutions (lower("secondaryDomain"))
  WHERE "secondaryDomain" IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_email_verifications_status'
  ) THEN
    CREATE TYPE "enum_email_verifications_status"
      AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'LOCKED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "codeHash" varchar(255) NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  "maxAttempts" integer NOT NULL DEFAULT 5,
  status "enum_email_verifications_status" NOT NULL DEFAULT 'PENDING',
  "verifiedAt" timestamptz NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_verifications_user_id_idx
  ON email_verifications ("userId");

CREATE INDEX IF NOT EXISTS email_verifications_expires_at_idx
  ON email_verifications ("expiresAt");

COMMIT;
