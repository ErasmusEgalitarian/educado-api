INSERT INTO users (
  id,
  "firstName",
  "lastName",
  email,
  "emailNormalized",
  "passwordHash",
  status,
  role,
  "createdAt",
  "updatedAt"
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'System',
  'Reviewer',
  'system@educado.local',
  'system@educado.local',
  '$2b$10$K8RTLTLseHnEfWWG8p.OZeEzKttwbYGUgztHctv6iJ6NphAGN/lSC',
  'APPROVED',
  'ADMIN',
  now(),
  now()
)
ON CONFLICT ("emailNormalized") DO NOTHING;
