-- Corrige limite de tamanho para imageUrl em cursos
-- Evita erro: value too long for type character varying(255)

ALTER TABLE courses
  ALTER COLUMN "imageUrl" TYPE text;
