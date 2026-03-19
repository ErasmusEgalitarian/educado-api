# Deploy — educado-api (Coolify + Nixpacks)

## Visao geral

O educado-api usa **Nixpacks** como build pack — nao ha Dockerfile. O Coolify detecta automaticamente o `nixpacks.toml` e constroi a imagem do container.

**Arquitetura de deploy:**

```
Git push → Coolify detecta → Nixpacks build → Container rodando
```

O projeto tem dois processos:
- **web** — API Express.js (`node build/index.js`)
- **worker** — Worker de email BullMQ (`node build/workers/email-worker.js`)

---

## 1. Pre-requisitos

- Coolify instalado e acessivel (https://coolify.io/docs/installation)
- Servidor com Docker
- Repositorio Git acessivel pelo Coolify (GitHub, GitLab, etc.)

---

## 2. Servicos de infraestrutura no Coolify

Antes de deployar a API, provisione os servicos dependentes. O Coolify permite criar servicos Docker direto pelo painel.

### PostgreSQL

1. No Coolify: **New Resource → Database → PostgreSQL**
2. Versao: `16` (Alpine)
3. Configurar:
   - Database name: `educado` (producao) ou `educado_staging` (teste)
   - User: escolher um usuario seguro
   - Password: gerar senha forte
4. Anotar a **connection string interna**: `postgresql://user:pass@<container-name>:5432/educado`

### Redis

1. No Coolify: **New Resource → Database → Redis**
2. Versao: `7` (Alpine)
3. Configurar senha se desejado
4. Anotar hostname interno e porta

### MinIO (Storage S3)

1. No Coolify: **New Resource → Service → Docker Compose** ou container customizado
2. Imagem: `minio/minio:latest`
3. Command: `server /data --console-address ":9001"`
4. Portas: 9000 (API), 9001 (Console)
5. Variaveis: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`
6. Criar o bucket `educado-media` via console MinIO ou CLI:
   ```bash
   mc alias set coolify http://<minio-host>:9000 <user> <password>
   mc mb coolify/educado-media
   ```

> **Dica**: No Coolify, servicos na mesma rede Docker podem se comunicar pelo nome do container (ex: `educado-postgres`, `educado-redis`).

---

## 3. Deploy da API (web)

### 3.1 Criar aplicacao no Coolify

1. **New Resource → Application**
2. Source: **Git Repository** (conectar ao repo do educado-api)
3. Branch: `main` (producao) ou `staging` (teste)
4. Build Pack: **Nixpacks** (detectado automaticamente pelo `nixpacks.toml`)

### 3.2 Configurar variaveis de ambiente

No painel do Coolify, em **Environment Variables**, adicionar:

| Variavel              | Staging                              | Producao                             |
|-----------------------|--------------------------------------|--------------------------------------|
| `NODE_ENV`            | `staging`                            | `production`                         |
| `PORT`                | `5001`                               | `5001`                               |
| `POSTGRES_URI`        | `postgresql://user:pass@host:5432/educado_staging` | `postgresql://user:pass@host:5432/educado` |
| `ACCESS_TOKEN_SECRET` | gerar com `openssl rand -base64 48`  | gerar com `openssl rand -base64 48`  |
| `FRONTEND_ORIGIN`     | `https://staging.educado.app`        | `https://educado.app`                |
| `S3_ENDPOINT`         | `http://educado-minio:9000`          | `http://educado-minio:9000`          |
| `S3_REGION`           | `us-east-1`                          | `us-east-1`                          |
| `S3_ACCESS_KEY`       | credencial MinIO                     | credencial MinIO                     |
| `S3_SECRET_KEY`       | credencial MinIO                     | credencial MinIO                     |
| `S3_BUCKET`           | `educado-media`                      | `educado-media`                      |
| `EMAIL_API_KEY`       | key Resend (teste)                   | key Resend (producao)                |
| `EMAIL_FROM`          | `noreply@staging.educado.app`        | `noreply@educado.app`                |
| `REDIS_HOST`          | hostname interno Redis               | hostname interno Redis               |
| `REDIS_PORT`          | `6379`                               | `6379`                               |

> **Nota**: Se os servicos estao na mesma rede Docker do Coolify, use o nome do container como hostname (ex: `educado-postgres`).

### 3.3 Configurar dominio e HTTPS

1. Em **Domains**, adicionar o dominio (ex: `api.educado.app` ou `api-staging.educado.app`)
2. O Coolify gera certificado SSL automaticamente via Let's Encrypt
3. Porta do container: `5001`

### 3.4 Deploy

Clicar em **Deploy** ou configurar deploy automatico via webhook no push.

---

## 4. Deploy do Worker de Email

O worker e um **processo separado** que consome a fila Redis.

### Opcao A: Segundo servico no Coolify (recomendado)

1. **New Resource → Application**
2. Mesmo repositorio Git, mesma branch
3. Build Pack: **Nixpacks**
4. Em **General → Custom Start Command**, alterar para:
   ```
   node build/workers/email-worker.js
   ```
5. Configurar as mesmas variaveis de ambiente (DB, Redis, Email)
6. **Nao** configurar dominio (o worker nao recebe HTTP)

### Opcao B: Usar o Procfile

Se o Coolify suportar multi-process via Procfile:
1. O arquivo `Procfile` na raiz ja define:
   ```
   web: node build/index.js
   worker: node build/workers/email-worker.js
   ```
2. Configurar scale: 1 web, 1 worker

---

## 5. Pos-deploy

### Seed de dados (primeira vez)

Para popular dados iniciais, conecte ao terminal do container no Coolify:

```bash
# No terminal do Coolify (Execute Command) ou via SSH
npm run seed
```

### Health check

A API responde em `GET /docs` (Swagger). Configure no Coolify:
- Path: `/docs`
- Porta: `5001`
- Intervalo: `30s`

---

## 6. Variaveis de ambiente — Referencia completa

| Variavel              | Descricao                                    | Obrigatorio | Default           |
|-----------------------|----------------------------------------------|-------------|-------------------|
| `NODE_ENV`            | Ambiente de execucao                         | Sim         | `development`     |
| `PORT`                | Porta do servidor HTTP                       | Nao         | `5001`            |
| `POSTGRES_URI`        | Connection string PostgreSQL (prod/staging)  | Sim (prod)  | -                 |
| `POSTGRES_URI_DEV`    | Connection string PostgreSQL (dev)           | Sim (dev)   | -                 |
| `ACCESS_TOKEN_SECRET` | Segredo JWT para tokens de acesso            | Sim         | -                 |
| `FRONTEND_ORIGIN`     | Origens CORS permitidas (virgula-separado)   | Sim (prod)  | `*` em dev        |
| `S3_ENDPOINT`         | URL do MinIO/S3                              | Sim         | -                 |
| `S3_REGION`           | Regiao S3                                    | Nao         | `us-east-1`       |
| `S3_ACCESS_KEY`       | Access key MinIO/S3                          | Sim         | -                 |
| `S3_SECRET_KEY`       | Secret key MinIO/S3                          | Sim         | -                 |
| `S3_BUCKET`           | Nome do bucket                               | Sim         | `educado-media`   |
| `EMAIL_API_KEY`       | API key do Resend                            | Sim         | -                 |
| `EMAIL_FROM`          | Endereco de remetente                        | Sim         | -                 |
| `REDIS_HOST`          | Hostname Redis                               | Sim         | `localhost`       |
| `REDIS_PORT`          | Porta Redis                                  | Nao         | `6379`            |

---

## 7. Troubleshooting

### Build falhou no Coolify

- Verificar logs de build no painel do Coolify
- Confirmar que `nixpacks.toml` esta na raiz do repo
- Verificar que `package.json` tem os scripts `build` e `start`

### API nao conecta ao banco

- Verificar se PostgreSQL esta rodando no Coolify
- Confirmar que `POSTGRES_URI` usa o hostname interno correto
- Verificar se os servicos estao na mesma network Docker

### MinIO access denied

- Confirmar credenciais `S3_ACCESS_KEY` e `S3_SECRET_KEY`
- Verificar se o bucket `educado-media` foi criado
- Confirmar que `S3_ENDPOINT` usa o hostname interno do MinIO

### Emails nao estao sendo enviados

- Verificar se o worker esta rodando (servico separado)
- Confirmar `EMAIL_API_KEY` valida no Resend
- Verificar conexao Redis entre API e worker (mesmo `REDIS_HOST`)

### Container reiniciando em loop

- Verificar logs: pode ser variavel de ambiente faltando
- Em producao, `ACCESS_TOKEN_SECRET` e obrigatorio (a API lanca erro se ausente)
