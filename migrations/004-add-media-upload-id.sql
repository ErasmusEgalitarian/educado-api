-- Migration: Add upload_id column to media_assets
-- Tracks the S3 multipart upload ID for in-flight chunked uploads. NULL once
-- the upload is completed or for rows created via the legacy direct-upload
-- path (where there is no multipart session).
--
-- Safe to run multiple times (idempotent).
--
-- Usage:
--   psql $POSTGRES_URI -f migrations/004-add-media-upload-id.sql

BEGIN;

ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS upload_id VARCHAR(255);

COMMIT;
