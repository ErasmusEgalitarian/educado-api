# Ambiente de Desenvolvimento — educado-api

## Pre-requisitos

- **Node.js 20+** ([download](https://nodejs.org/))
- **Docker e Docker Compose** (para PostgreSQL, Redis e MinIO)
- **npm** (incluido com Node.js)

## Setup inicial

### 1. Clonar e instalar dependencias

```bash
cd educado-api
npm install
```

### 2. Configurar variaveis de ambiente

```bash
cp .env.example .env
```

Os valores padrao do `.env.example` ja funcionam para desenvolvimento local com docker-compose.

### 3. Subir infraestrutura (PostgreSQL, Redis, MinIO)

```bash
sudo docker compose up -d
```

Isso sobe:

| Servico    | Porta local | Credenciais             |
|------------|-------------|-------------------------|
| PostgreSQL | 5431        | educado / educado       |
| Redis      | 6379        | sem senha               |
| MinIO API  | 9000        | minioadmin / minioadmin  |
| MinIO Console | 9001     | minioadmin / minioadmin  |

O bucket `educado-media` e criado automaticamente pelo servico `minio-setup`.

### 4. (Opcional) Popular dados iniciais

```bash
npm run seed
```

## Rodar em desenvolvimento

### API (terminal 1)

```bash
npm run dev
```

Inicia com **nodemon** na porta **5001**. Reinicia automaticamente ao salvar arquivos.

### Worker de email (terminal 2)

```bash
npm run worker:email
```

Processa a fila de envio de emails via BullMQ + Redis.

## Acessos locais

| Recurso         | URL                           |
|-----------------|-------------------------------|
| API             | http://localhost:5001         |
| Swagger (docs)  | http://localhost:5001/docs    |
| MinIO Console   | http://localhost:9001         |

## Comandos uteis

```bash
npm test              # Rodar testes (Jest)
npm run test:watch    # Testes em modo watch
npm run test:coverage # Testes com cobertura
npm run lint          # Verificar lint (ESLint)
npm run lint:fix      # Corrigir lint automaticamente
npm run build         # Compilar TypeScript → build/
npx tsc --noEmit      # Type-check sem compilar
```

## Parar infraestrutura

```bash
sudo docker compose down
```

Para remover os volumes (apaga dados do banco, redis e minio):

```bash
sudo docker compose down -v
```

## Notas

- O projeto **nao usa Dockerfile**. O deploy em staging/producao e feito via **Nixpacks** no Coolify.
- O `docker-compose.yml` contem **apenas infraestrutura** (postgres, redis, minio). A API e o worker rodam diretamente no Node.js local.
- Consulte `DEPLOY.md` para instrucoes de deploy em staging e producao.
