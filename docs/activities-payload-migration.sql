-- Adequação para payload discriminado de atividades

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS title varchar(255) NULL;

ALTER TABLE activities
  ALTER COLUMN "imageUrl" TYPE text;
