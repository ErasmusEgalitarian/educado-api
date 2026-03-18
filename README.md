# educado-api

Backend REST API do Educado — plataforma de educacao para criadores de conteudo e alunos.

## Stack

- **Node.js 20** + Express.js
- **TypeScript** (strict mode)
- **PostgreSQL 16** (Sequelize ORM)
- **MinIO** (S3-compatible, armazenamento de midia)
- **Redis 7** + BullMQ (fila de emails)
- **Resend** (provedor de email)
- **JWT** (autenticacao)
- **bcryptjs** (hashing de senhas)
- **Jest** + ts-jest (testes)

## Setup

### Docker Compose (recomendado)

```bash
cp .env.example .env     # Editar com suas credenciais
sudo docker compose up -d --build
```

Sobe: API (5001), PostgreSQL (5431), Redis (6379), MinIO (9000/9001), email worker.

O bucket `educado-media` e criado automaticamente pelo servico `minio-setup`.

### Desenvolvimento Local

```bash
cp .env.example .env
npm install
sudo docker compose up -d postgres redis minio minio-setup   # Apenas dependencias
npm run dev                                                    # API com hot reload
```

## Comandos

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor com hot reload (nodemon) |
| `npm run build` | Compila TypeScript para `build/` |
| `npm start` | Inicia servidor compilado |
| `npm test` | Roda todos os testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Testes com relatorio de cobertura |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint com auto-fix |
| `npm run seed` | Popula banco com cursos de exemplo |

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
    media/               # Upload, listagem, acesso a midia
    courses/             # Validacao e acesso a cursos
    activities/          # Validacao e payload de atividades
    email/               # Templates de email
    tags/                # Validacao de tags
    institutions/        # Validacao de instituicoes
    common/              # AppError
  config/                # Database (Sequelize), JWT
  domain/                # Enums (RegistrationStatus, UserRole)
  infrastructure/
    storage/s3/          # MinIO/S3 client
    security/            # bcrypt password hasher
    email/               # Resend provider + factory
    queue/               # Redis + BullMQ
  interface/http/
    middlewares/          # auth-jwt, request-id, require-https
  models/                # 16 Sequelize models
  routes/                # 13 modulos de rotas Express
  types/                 # TypeScript types
  workers/               # Email worker (BullMQ)
```

### Camadas

| Camada | Responsabilidade |
|--------|------------------|
| **routes/** | Thin controllers — req/res, validacao, chama servico |
| **application/** | Logica de negocio pura, sem acesso a req/res |
| **models/** | Sequelize ORM, associacoes em `index.ts` |
| **infrastructure/** | Servicos externos (S3, email, Redis, bcrypt) |
| **interface/** | Middleware Express (auth, request-id) |

## Models

| Model | Tabela | Descricao |
|-------|--------|-----------|
| User | users | Usuarios (nome, email, senha, role, avatar) |
| Course | courses | Cursos (titulo, descricao, dificuldade, imagem) |
| Section | sections | Secoes de um curso (titulo, video, thumbnail) |
| Activity | activities | Atividades (video, texto, multipla escolha, V/F) |
| CourseProgress | course_progress | Progresso do aluno no curso |
| SectionProgress | section_progress | Progresso do aluno na secao |
| Certificate | certificates | Certificados emitidos |
| MediaAsset | media_assets | Metadados de midia (s3Key, tipo, tamanho) |
| RegistrationProfile | registration_profiles | Perfil de registro (motivacoes, formacao) |
| RegistrationReview | registration_reviews | Revisao admin (aprovar/rejeitar) |
| PasswordReset | password_resets | Tokens de reset de senha |
| EmailVerification | email_verifications | Tokens de verificacao de email |
| Tag | tags | Tags reutilizaveis |
| CourseTag | course_tags | Relacao curso-tag |
| Institution | institutions | Instituicoes com dominios confiáveis |

## API Endpoints

### Autenticacao (`/auth`)

```
POST   /auth/registrations                  # Registrar
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
GET    /me/profile              # Obter perfil
PUT    /me/profile              # Atualizar perfil
PUT    /me/avatar               # Definir avatar (mediaId)
DELETE /me/avatar               # Remover avatar
DELETE /me/account              # Deletar conta
GET    /me/courses              # Meus cursos
GET    /me/media                # Minhas midias
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
POST   /media/images              # Upload imagem (max 10MB)
POST   /media/videos              # Upload video (max 500MB)
GET    /media/:id/stream           # Stream (aceita ?token=jwt)
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

### Outros

```
GET/POST /tags                   # CRUD de tags
GET/POST /institutions           # CRUD de instituicoes
POST     /account/email-verification/send     # Enviar codigo
POST     /account/email-verification/confirm  # Confirmar codigo
GET/POST /progress               # Progresso de cursos
GET      /certificates           # Certificados
GET      /docs                   # Swagger UI
```

## Variaveis de Ambiente

```env
NODE_ENV=development
PORT=5001

# PostgreSQL
POSTGRES_URI=postgresql://educado:educado@postgres:5432/educado_dev
POSTGRES_URI_DEV=postgresql://educado:educado@localhost:5432/educado_dev

# JWT
ACCESS_TOKEN_SECRET=replace-with-a-strong-secret

# S3 / MinIO
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=educado-media

# Email (Resend)
EMAIL_API_KEY=re_xxx
EMAIL_FROM=noreply@educado.com

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend (CORS)
FRONTEND_ORIGIN=http://localhost:3000
```

Docker Compose sobrescreve `S3_ENDPOINT` para `http://minio:9000` e `POSTGRES_URI_DEV` para `postgresql://educado:educado@postgres:5432/educado_dev`.

## Testes

```bash
npm test                          # Todos os testes
npm run test:coverage             # Com cobertura
npx jest src/application/media    # Modulo especifico
```

### Cobertura

| Metrica | Valor |
|---------|-------|
| Suites | 23 |
| Testes | 413 |
| Statements | 98.6% |
| Branches | 96.5% |
| Functions | 100% |
| Lines | 99.0% |

Todos os 24 arquivos com cobertura individual acima de 80%.

### Estrutura de testes

```
src/application/registration/__tests__/registration-service.test.ts
src/application/registration/__tests__/registration-validation.test.ts
src/application/password-reset/__tests__/password-reset-service.test.ts
src/application/verification/__tests__/email-verification-service.test.ts
src/application/media/__tests__/media-service.test.ts
src/application/courses/__tests__/course-validation.test.ts
src/infrastructure/storage/s3/__tests__/s3-client.test.ts
src/interface/http/middlewares/__tests__/auth-jwt.test.ts
...
```

## Banco de Dados

O Sequelize sincroniza automaticamente na inicializacao (`sequelize.sync()`). Sem migration files.

Para resetar (CUIDADO — apaga tudo):
```bash
# Via Docker
sudo docker compose exec postgres psql -U educado -d educado_dev -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
sudo docker compose restart api
```

## Documentacao da API

Swagger UI disponivel em `http://localhost:5001/docs`.

## Licenca

ISC
