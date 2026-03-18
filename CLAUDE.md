# CLAUDE.md — Educado API

## Visao Geral

Backend do Educado: plataforma de educacao que permite criadores de conteudo publicar cursos com secoes, aulas (video, texto, exercicios) e acompanhar o progresso dos alunos. Construido com Express.js + TypeScript, PostgreSQL (Sequelize ORM), MinIO (S3-compatible) para armazenamento de midia, Redis + BullMQ para filas de email.

## Comandos

```bash
npm run dev          # Inicia servidor em modo desenvolvimento (nodemon)
npm run build        # Compila TypeScript para build/
npm start            # Inicia servidor compilado
npm test             # Roda todos os testes (Jest)
npm run test:watch   # Testes em modo watch
npm run test:coverage # Testes com relatorio de cobertura
npm run lint         # ESLint
npm run lint:fix     # ESLint com auto-fix
```

Docker:
```bash
sudo docker compose up -d           # Sobe todos os servicos (api, postgres, redis, minio)
sudo docker compose up -d --build   # Rebuild e sobe
sudo docker compose logs api --tail=50  # Ver logs da API
```

## Arquitetura

```
src/
  application/       # Logica de negocio (services, validations)
    registration/    # Registro, login, aprovacao de usuarios
    password-reset/  # Fluxo de redefinicao de senha (OTP 4 digitos)
    verification/    # Verificacao de email institucional (OTP 6 digitos)
    media/           # Upload, listagem, acesso a midia
    courses/         # Validacao e acesso a cursos
    activities/      # Validacao de atividades
    email/           # Templates de email (verificacao, reset, aprovacao)
    tags/            # Validacao de tags
    institutions/    # Validacao de instituicoes
    common/          # AppError (classe padrao de erro)
  config/            # Configuracao (database, JWT)
  domain/            # Enums e tipos de dominio
    registration/    # RegistrationStatus, UserRole, ReviewDecision
  infrastructure/    # Servicos externos
    storage/s3/      # MinIO/S3 client (upload, download, delete)
    security/        # bcrypt password hasher
    email/           # Resend email provider + factory
    queue/           # Redis + BullMQ email queue
  interface/http/    # Middleware Express
    middlewares/     # auth-jwt, request-id, require-https
  models/            # Sequelize ORM models (16 models)
  routes/            # Express route handlers
    auth/            # POST /auth/login, /registrations, /password-reset/*
    me/              # GET/PUT /me/profile, PUT/DELETE /me/avatar, DELETE /me/account
    courses/         # CRUD /courses
    sections/        # CRUD /sections
    activities/      # CRUD /activities
    media/           # Upload/stream/metadata /media/*
    admin/           # Admin registration review /admin/*
    progress/        # Course progress tracking
    certificates/    # Certificate management
    tags/            # Tag CRUD
    institutions/    # Institution management
    verification/    # Email verification endpoints
  types/             # TypeScript type definitions
  workers/           # Background workers (email-worker)
```

## Padroes de Projeto

### Camada de Servico (application/)
- Funcoes exportadas puras com logica de negocio
- Recebem inputs validados, interagem com models, retornam dados ou lancam AppError
- NAO acessam req/res diretamente
- Exemplo: `registerUser(input)`, `submitRegistrationProfile(userId, profileInput)`

### Camada de Validacao
- Funcoes `validate*()` retornam `{ data: T | null, fieldErrors: Record<string, string> }`
- Se `data` e null, ha erros de validacao
- Validacoes suportam modo `partial` para updates parciais
- Media IDs aceitam tanto UUID quanto MongoDB ObjectId (regex dupla para retrocompatibilidade)

### Camada de Rotas (routes/)
- Cada rota trata req/res, chama validacao, depois servico
- Erros tratados com `handleError()` padrao
- AppError retorna statusCode e payload estruturado
- Respostas de erro: `{ code: 'ERROR_CODE', fieldErrors?: {...} }`

### Modelos (models/)
- Sequelize com PostgreSQL
- `sequelize.sync()` para criar/alterar tabelas (sem migrations)
- Associacoes definidas em `models/index.ts`
- Todos os IDs sao UUID (DataTypes.UUIDV4)

### Autenticacao
- JWT com 12h de expiracao
- Middleware `requireAuth` extrai token do header `Authorization: Bearer`
- Rota de stream aceita token via query param `?token=` (para tags `<img>`)
- `getAuthContext(res)` retorna `{ userId, role }`

### Armazenamento de Midia
- Arquivos binarios no MinIO (S3-compatible) via `@aws-sdk/client-s3`
- Metadados na tabela `media_assets` do PostgreSQL
- Chave S3: `{kind}/{ownerId}/{uuid}-{filename}`
- Streaming: `GET /media/:id/stream?token=jwt`

### Tratamento de Erros
```typescript
throw new AppError(statusCode, { code: 'ERROR_CODE', fieldErrors?: {...} })
```
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict (email duplicado, transicao de status invalida)
- 422: Validation error (com fieldErrors)
- 429: Rate limited
- 500: Internal server error

## Testes

### Estrutura
- Framework: Jest + ts-jest
- Config: `jest.config.ts` (usa `tsconfig.test.json`)
- Pattern: `src/**/__tests__/*.test.ts`
- Mocks: `jest.mock()` para models, servicos externos, S3, email

### Regras de Teste
1. **Todo codigo novo DEVE ter testes unitarios**
2. **Testes devem rodar sem banco de dados** — mockar Sequelize models
3. **Testes devem rodar sem servicos externos** — mockar S3, email, Redis
4. **Cobrir happy path E casos de erro**
5. **Nomes descritivos**: `it('should return 422 when title is less than 3 characters')`
6. **Rodar `npm test` antes de considerar mudanca completa**

### Cobertura Atual
- 7 suites, 174+ testes passando
- Modulos com 100%: validacoes (curso, registro, atividade, midia), acesso a midia, auth-jwt, password-hasher
- Meta: 80%+ em statements/lines para application/

### Executar
```bash
npm test                    # Todos os testes
npm run test:coverage       # Com relatorio de cobertura
npx jest path/to/file.test.ts  # Teste especifico
```

## Variaveis de Ambiente

```env
NODE_ENV=development
PORT=5001
POSTGRES_URI_DEV=postgresql://educado:educado@localhost:5432/educado_dev
ACCESS_TOKEN_SECRET=replace-with-a-strong-secret
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=educado-media
EMAIL_API_KEY=re_xxx
EMAIL_FROM=noreply@educado.com
REDIS_HOST=localhost
REDIS_PORT=6379
```

Docker Compose sobrescreve S3_ENDPOINT para `http://minio:9000` (DNS interno).

## Regras de Contribuicao

### Antes de Implementar
1. Ler os testes existentes do modulo que sera alterado
2. Entender o padrao de validacao e tratamento de erros do modulo
3. Se criar novo endpoint, seguir o padrao de rota existente mais proximo

### Ao Implementar
1. **Validacao primeiro**: criar/atualizar funcao `validate*()` com testes
2. **Servico depois**: logica de negocio em `application/`, nao em routes
3. **Rota por ultimo**: thin controller que chama validacao + servico
4. **Nao hardcodar strings** — usar i18n no frontend, codigos de erro no backend
5. **Media IDs**: aceitar UUID e MongoDB ObjectId (`isValidMediaId()`)
6. **Novos models**: adicionar em `models/index.ts` com associacoes, exportar

### Ao Finalizar
1. Rodar `npm run lint` — zero erros de lint (ESLint)
2. Rodar `npm test` — todos os testes devem passar
3. Rodar `npx tsc --noEmit` — zero erros de TypeScript
4. Rodar `npm run test:coverage` — verificar cobertura do modulo alterado
5. Testes do modulo alterado devem cobrir 80%+ das linhas

**Checklist obrigatorio antes de considerar qualquer mudanca completa:**
```bash
npm run lint && npm test && npx tsc --noEmit
```
Os tres devem passar sem erros.

### O Que NAO Fazer
- NAO usar `sequelize.sync({ force: true })` em producao
- NAO expor stack traces em producao (o handleError ja trata isso)
- NAO armazenar senhas em texto plano — usar `hashPassword()`
- NAO aceitar `any` sem justificativa — usar tipos concretos
- NAO instalar dependencias sem necessidade comprovada
- NAO commitar `.env` ou credenciais
- NAO duplicar logica — reutilizar servicos e validacoes existentes
- NAO criar endpoints sem autenticacao (exceto login, registro, password-reset/request)

## Fluxos de Negocio

### Registro de Usuario
1. `POST /auth/registrations` — cria user com status DRAFT_PROFILE
2. `PUT /auth/registrations/:userId/profile` — submete perfil
3. Se email institucional: status → PENDING_EMAIL_VERIFICATION → confirma codigo → APPROVED
4. Se email nao institucional: status → PENDING_REVIEW → admin aprova/rejeita

### Redefinicao de Senha
1. `POST /auth/password-reset/request` — envia OTP 4 digitos por email
2. `POST /auth/password-reset/verify` — valida codigo
3. `POST /auth/password-reset/reset` — redefine senha (politica: 8+ chars, 1+ letra)

### Gestao de Midia
1. `POST /media/images` — upload binario para S3 + registro em media_assets
2. `POST /media/images/:id/metadata` — adiciona titulo/alt/descricao
3. `GET /media/:id/stream?token=jwt` — streaming do S3
4. `DELETE /media/images/:id` — remove do S3 + PostgreSQL
