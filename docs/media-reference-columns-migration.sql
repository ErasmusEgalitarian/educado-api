BEGIN;

ALTER TABLE IF EXISTS courses
  RENAME COLUMN "imageUrl" TO "imageMediaId";

ALTER TABLE IF EXISTS sections
  RENAME COLUMN "videoUrl" TO "videoMediaId";

ALTER TABLE IF EXISTS sections
  RENAME COLUMN "thumbnailUrl" TO "thumbnailMediaId";

ALTER TABLE IF EXISTS activities
  RENAME COLUMN "imageUrl" TO "imageMediaId";

COMMIT;
