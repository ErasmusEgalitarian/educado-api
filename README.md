# educado-api

Backend REST API do Educado, plataforma de educacao para catadores de lixo no
Brasil, desenvolvida em parceria entre a Universidade de Brasilia (UnB) e a
Aalborg University (Dinamarca).

Criadores de conteudo publicam cursos organizados em secoes e atividades; alunos
se matriculam, acompanham progresso, ganham pontos e badges, e recebem
certificados.

| Ambiente | URL |
|----------|-----|
| API (producao) | https://api-educado.tominho.com |
| Swagger (producao) | https://api-educado.tominho.com/docs/ |
| Frontend web | https://educado.tominho.com |

## Stack

- **Node.js 20** + Express 5
- **TypeScript** (strict mode)
- **PostgreSQL 16** (Sequelize ORM)
- **MinIO** (S3-compatible, armazenamento de midia)
- **Redis 7** + BullMQ (fila de emails)
- **Resend** (provedor de email)
- **JWT** (autenticacao)
- **bcryptjs** (hashing de senhas)
- **Jest** + ts-jest + supertest (testes)
- **ESLint 9** (flat config, base google + prettier)
- **Deploy**: Coolify + Nixpacks (`nixpacks.toml`, sem Dockerfile), processos
  declarados no `Procfile`

## Setup

### 1. Infraestrutura local (Docker Compose)

```bash
cp .env.example .env     # Editar com suas credenciais
npm install
sudo docker compose up -d
```

**Atencao:** o `docker-compose.yml` sobe **apenas** as dependencias. Ele define
os servicos `postgres`, `redis`, `minio` e o job one-shot `minio-setup` (que cria
o bucket `educado-media`). Ele **nao** sobe a API e **nao** sobe o worker de
email: os dois rodam direto no Node.

Portas de host expostas pelo compose:

| Servico | Porta do host | Porta do container |
|---------|---------------|--------------------|
| PostgreSQL | 5431 | 5432 |
| Redis | 6380 | 6379 |
| MinIO (API S3) | 9002 | 9000 |
| MinIO (console web) | 9003 | 9001 |

Credenciais default do ambiente local: Postgres `educado:educado` no banco
`educado_dev`; MinIO `minioadmin:minioadmin`.

### 2. API e worker

Dois processos, dois terminais:

```bash
npm run dev            # API com hot reload (nodemon + ts-node, NODE_ENV=development)
npm run worker:email   # Worker BullMQ de email
```

A API sobe na porta definida em `PORT` (default do `.env.example`: 5001).
Swagger local em `http://localhost:5001/docs`.

Ciclo de vida da infra:

```bash
sudo docker compose down       # Para a infra
sudo docker compose down -v    # Para e apaga volumes (zera os dados locais)
```

## Comandos

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor com hot reload (nodemon) |
| `npm run worker:email` | Worker BullMQ de email |
| `npm run build` | Compila TypeScript para `build/` |
| `npm run build:watch` | Compila em modo watch |
| `npm start` | Inicia servidor compilado (`node build/index.js`) |
| `npm test` | Roda todos os testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Testes com relatorio de cobertura |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint com auto-fix |
| `npm run seed` | Popula banco com cursos de exemplo |
| `npx ts-node src/scripts/seed-admin.ts` | Cria um usuario admin |

### Checklist obrigatorio antes de qualquer entrega

```bash
npm run lint && npm test && npx tsc --noEmit
```

## Arquitetura

```
src/
  application/           # Logica de negocio
    registration/        # Registro, login, aprovacao
    password-reset/      # Redefinicao de senha (OTP 4 digitos)
    verification/        # Verificacao de email (OTP 6 digitos)
    student/             # Fluxos do aluno
    student-activities/  # Resolucao de atividades pelo aluno
    student-progress/    # Progresso do aluno
    enrollment/          # Matricula e cancelamento
    gamification/        # Pontos, badges, XP
    leaderboard/         # Ranking
    catalog/             # Catalogo publico de cursos
    certificates/        # Emissao e verificacao de certificado
    reviews/             # Avaliacoes de curso
    media/               # Upload, listagem, acesso a midia
    courses/             # Validacao e acesso a cursos
    activities/          # Validacao e payload de atividades
    email/               # Templates de email
    tags/                # Validacao de tags
    institutions/        # Validacao de instituicoes
    common/              # AppError
  config/                # Database (Sequelize), JWT
  domain/                # Enums (RegistrationStatus, UserRole)
  docs/                  # Documento OpenAPI servido no /docs
  infrastructure/
    storage/s3/          # MinIO/S3 client
    security/            # bcrypt password hasher
    email/               # Resend provider + factory
    queue/               # Redis + BullMQ
  interface/http/
    middlewares/         # auth-jwt, request-id, require-https, require-role
  models/                # 22 Sequelize models
  routes/                # 16 modulos de rotas Express
  scripts/               # Seeds (cursos, admin)
  types/                 # TypeScript types
  workers/               # Email worker (BullMQ)
```

### Camadas

| Camada | Responsabilidade |
|--------|------------------|
| **routes/** | Thin controllers: req/res, validacao, chama servico |
| **application/** | Logica de negocio pura, sem acesso a req/res |
| **models/** | Sequelize ORM, associacoes em `index.ts` |
| **infrastructure/** | Servicos externos (S3, email, Redis, bcrypt) |
| **interface/** | Middleware Express (auth, role, request-id, https) |

## Models

| Model | Tabela |
|-------|--------|
| User | users |
| Course | courses |
| Section | sections |
| Activity | activities |
| ActivityProgress | activity_progress |
| CourseProgress | course_progress |
| SectionProgress | section_progress |
| Enrollment | enrollments |
| CourseReview | course_reviews |
| Certificate | certificates |
| MediaAsset | media_assets |
| RegistrationProfile | registration_profiles |
| RegistrationReview | registration_reviews |
| PasswordReset | password_resets |
| EmailVerification | email_verifications |
| Tag | tags |
| CourseTag | course_tags |
| Institution | institutions |
| Badge | badges |
| StudentBadge | student_badges |
| StudentStats | student_stats |
| PointsLedger | points_ledger |

## API Endpoints

A referencia completa e sempre o Swagger (`/docs`). Resumo dos grupos montados
em `src/index.ts`:

### Autenticacao (`/auth`)

```
POST   /auth/registrations                   # Registrar
PUT    /auth/registrations/:userId/profile   # Submeter perfil
PUT    /auth/registrations/me/profile        # Atualizar perfil (auth)
GET    /auth/registrations/me/status         # Status do registro (auth)
POST   /auth/login                           # Login
POST   /auth/password-reset/request          # Solicitar reset
POST   /auth/password-reset/verify           # Verificar OTP
POST   /auth/password-reset/reset            # Redefinir senha
```

### Perfil (`/me`)

```
GET    /me/profile               # Obter perfil
PUT    /me/profile               # Atualizar perfil
PUT    /me/avatar                # Definir avatar (mediaId)
DELETE /me/avatar                # Remover avatar
DELETE /me/account               # Deletar conta
GET    /me/courses               # Meus cursos
GET    /me/media                 # Minhas midias
POST   /me/password/request-code # Codigo para alterar senha
```

### Cursos (`/courses`)

```
GET    /courses          # Listar (filtros: status, category, difficulty)
GET    /courses/:id      # Obter com secoes e atividades
POST   /courses          # Criar
PUT    /courses/:id      # Atualizar
POST   /courses/:id/activate    # Ativar
POST   /courses/:id/deactivate  # Desativar
DELETE /courses/:id      # Deletar
```

### Secoes (`/sections`)

```
GET    /sections          # Listar todas
GET    /sections/:id      # Obter secao
POST   /sections          # Criar
PUT    /sections/:id      # Atualizar
DELETE /sections/:id      # Deletar
```

### Atividades (`/activities`)

```
GET    /activities/section/:sectionId  # Listar por secao
POST   /activities                     # Criar
PUT    /activities/:id                 # Atualizar
DELETE /activities/:id                 # Deletar
```

### Midia (`/media`)

```
POST   /media/images               # Upload imagem (max 10MB)
POST   /media/videos               # Upload video (max 500MB)
GET    /media/:id/stream           # Stream com range request (aceita ?token=jwt)
GET    /media/images/:id           # Metadados imagem
GET    /media/videos/:id           # Metadados video
POST   /media/images/:id/metadata  # Criar metadados
PUT    /media/images/:id/metadata  # Atualizar metadados
DELETE /media/images/:id           # Deletar imagem
DELETE /media/videos/:id           # Deletar video
```

### Administracao (`/admin`)

```
GET    /admin/users                         # Listar usuarios
GET    /admin/users/:userId                 # Detalhes
DELETE /admin/users/:userId                 # Deletar
PATCH  /admin/users/:userId/role            # Alternar USER/ADMIN
GET    /admin/registrations?status=         # Cadastros por status
POST   /admin/registrations/:userId/approve # Aprovar
POST   /admin/registrations/:userId/reject  # Rejeitar
```

### Outros grupos

```
/user                    # Usuarios
/student                 # Fluxos do aluno (inclui login por telefone)
/catalog                 # Catalogo publico de cursos
/leaderboard             # Ranking / gamificacao
/progress                # Progresso de cursos
/certificates            # Certificados + verificacao publica (QR code)
/tags                    # CRUD de tags
/institutions            # CRUD de instituicoes
/account/email-verification/send     # Enviar codigo de verificacao
/account/email-verification/confirm  # Confirmar codigo
/docs                    # Swagger UI
```

## Variaveis de Ambiente

Base em `.env.example`. Valores abaixo sao os de desenvolvimento local, ja
apontando para as portas de host reais do compose:

```env
# Server
NODE_ENV=development
PORT=5001

# PostgreSQL
POSTGRES_URI_DEV=postgresql://educado:educado@localhost:5431/educado_dev
POSTGRES_URI=postgresql://user:password@host:5432/educado

# JWT
ACCESS_TOKEN_SECRET=replace-with-a-strong-secret

# S3 / MinIO
S3_ENDPOINT=http://localhost:9002
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=educado-media

# Email (Resend)
EMAIL_API_KEY=re_xxx
EMAIL_FROM=noreply@educado.com

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380
# REDIS_PASSWORD=            # Obrigatoria quando o Redis exige senha

# Frontend (CORS)
FRONTEND_ORIGIN=http://localhost:3000
```

### Referencia

| Variavel | Obrigatoria | Descricao |
|----------|-------------|-----------|
| `NODE_ENV` | sim | `production` em deploy. Qualquer outro valor e tratado como nao-producao (ver aviso abaixo) |
| `PORT` | nao | Porta HTTP da API. Default no codigo: 5000; o `.env.example` usa 5001 |
| `POSTGRES_URI` | so em producao | String de conexao lida **apenas** quando `NODE_ENV === 'production'` |
| `POSTGRES_URI_DEV` | fora de producao | String de conexao usada quando `NODE_ENV` nao e `production` |
| `ACCESS_TOKEN_SECRET` | sim | Segredo de assinatura do JWT. Gerar com `openssl rand -base64 48` |
| `S3_ENDPOINT` | sim | Endpoint do MinIO/S3. Local: `http://localhost:9002` |
| `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET` | sim | Credenciais e bucket de midia |
| `EMAIL_API_KEY` | sim | API key do Resend |
| `EMAIL_FROM` | sim | Remetente dos emails transacionais |
| `REDIS_HOST` | sim | Host do Redis. Default no codigo: `127.0.0.1` |
| `REDIS_PORT` | sim | Porta do Redis. Default no codigo: `6379`; local via compose: `6380` |
| `REDIS_PASSWORD` | quando o Redis tem senha | Lida em `src/infrastructure/queue/redis.ts` e repassada a conexao do BullMQ. Sem ela, a API e o worker nao autenticam num Redis protegido |
| `FRONTEND_ORIGIN` | sim em producao | Origens permitidas no CORS, separadas por virgula. Em producao a lista e aplicada de fato; fora de producao o CORS e liberado |

### Aviso: `NODE_ENV` precisa ser exatamente `production` em deploy

`src/config/database.ts` decide a string de conexao com
`process.env.NODE_ENV === 'production'`. A comparacao e literal e sem
normalizacao:

- `NODE_ENV=production`: usa `POSTGRES_URI`.
- **Qualquer outro valor** (inclusive `staging`, `Production`, `prod` ou vazio):
  usa `POSTGRES_URI_DEV`.

Num servidor onde so `POSTGRES_URI` esta configurada, um `NODE_ENV` diferente de
`production` faz o Sequelize tentar conectar com `POSTGRES_URI_DEV` (vazia), o
`testDatabaseConnection()` falhar, e o `src/index.ts` encerrar o processo com
`process.exit(1)` antes de subir o servidor. O mesmo valor tambem controla o
`sync({ alter })`, o CORS restrito e o middleware `require-https`.

Nao existe ambiente "staging" do ponto de vista do codigo: se o deploy e um
servidor real, `NODE_ENV=production`.

## Testes

```bash
npm test                          # Todos os testes
npm run test:coverage             # Com cobertura
npx jest src/application/media    # Modulo especifico
```

Testes ficam ao lado do codigo, em pastas `__tests__`, com sufixo `.test.ts`:

```
src/application/registration/__tests__/registration-service.test.ts
src/application/password-reset/__tests__/password-reset-service.test.ts
src/application/media/__tests__/media-service.test.ts
src/infrastructure/storage/s3/__tests__/s3-client.test.ts
src/interface/http/middlewares/__tests__/auth-jwt.test.ts
...
```

Para os numeros atuais de cobertura, rode `npm run test:coverage` (o relatorio
sai em `coverage/`).

## Banco de Dados

O Sequelize sincroniza automaticamente na inicializacao (`sequelize.sync()`).
Fora de producao o sync roda com `alter: true`. Nao ha framework de migrations:
mudancas manuais de schema ficam como scripts SQL em `docs/`.

Para resetar o ambiente local (CUIDADO, apaga tudo):

```bash
sudo docker compose exec postgres psql -U educado -d educado_dev \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

Depois reinicie o `npm run dev` para o sync recriar as tabelas.

## Deploy

Deploy em Coolify usando Nixpacks (`nixpacks.toml`, Node 20). Nao ha Dockerfile.
O `Procfile` declara dois processos:

```
web: node build/index.js
worker: node build/workers/email-worker.js
```

Checklist de producao:

- `NODE_ENV=production` (exato, ver aviso acima)
- `POSTGRES_URI` apontando para o banco real
- `ACCESS_TOKEN_SECRET` forte e unico
- `FRONTEND_ORIGIN` restrito ao dominio real
- `REDIS_HOST`, `REDIS_PORT` e `REDIS_PASSWORD` do Redis gerenciado
- Credenciais S3/MinIO de producao e bucket criado
- `EMAIL_API_KEY` do Resend com dominio verificado

## Documentacao da API

Swagger UI local em `http://localhost:5001/docs` e em producao em
https://api-educado.tominho.com/docs/.

## Contribuindo

Leia o [CONTRIBUTING.md](CONTRIBUTING.md) (setup, fluxo de branch e PR,
Conventional Commits, gate de lint/test/typecheck) e o
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). O branch default e `master`; o
desenvolvimento e integrado em `dev`.

Historico de mudancas: [CHANGELOG.md](CHANGELOG.md).
Politica de seguranca e reporte de vulnerabilidade: [SECURITY.md](SECURITY.md).

## Licenca

Apache License 2.0. Texto completo em [LICENSE](LICENSE).

```
Copyright 2026 Educado Project (University of Brasilia and Aalborg University)
```
