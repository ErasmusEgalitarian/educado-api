-- Migration: Add PENDING status to media_assets enum
-- Required for the presigned-URL upload flow: a row is created with status=PENDING
-- before the client uploads the bytes directly to MinIO, then promoted to ACTIVE
-- once the upload is confirmed.
--
-- Safe to run multiple times (idempotent).
--
-- Usage:
--   psql $POSTGRES_URI -f migrations/003-add-media-pending-status.sql

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'enum_media_assets_status'
      AND e.enumlabel = 'PENDING'
  ) THEN
    ALTER TYPE "enum_media_assets_status" ADD VALUE 'PENDING' BEFORE 'ACTIVE';
  END IF;
END $$;

COMMIT;
