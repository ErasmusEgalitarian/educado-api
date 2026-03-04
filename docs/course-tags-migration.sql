-- Tags reutilizáveis para categorização de cursos

CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL UNIQUE,
  slug varchar(255) NOT NULL UNIQUE,
  description text NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tag_active_idx ON tags ("isActive");

CREATE TABLE IF NOT EXISTS course_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" varchar(255) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  "tagId" uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_tag_unique_idx UNIQUE ("courseId", "tagId")
);

CREATE INDEX IF NOT EXISTS course_tag_course_idx ON course_tags ("courseId");
CREATE INDEX IF NOT EXISTS course_tag_tag_idx ON course_tags ("tagId");
