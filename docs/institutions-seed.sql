INSERT INTO institutions (id, name, domain, "secondaryDomain", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Universidade de Brasilia', 'unb.br', NULL, true, now(), now()),
  (gen_random_uuid(), 'Universidade de Sao Paulo', 'usp.br', NULL, true, now(), now())
ON CONFLICT (domain) DO NOTHING;
