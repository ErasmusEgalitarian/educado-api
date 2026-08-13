# Contributing to educado-api

Thanks for your interest in contributing. Educado is an educational platform for
waste pickers in Brazil, built as a partnership between the University of
Brasilia (UnB) and Aalborg University. This repository holds the backend REST
API.

By participating in this project you agree to follow our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Table of contents

- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Running the API and the worker](#running-the-api-and-the-worker)
- [Branching and pull requests](#branching-and-pull-requests)
- [Commit messages](#commit-messages)
- [Quality gate: lint, tests, typecheck](#quality-gate-lint-tests-typecheck)
- [Code standards](#code-standards)
- [Reporting bugs and requesting features](#reporting-bugs-and-requesting-features)
- [Security issues](#security-issues)

## Prerequisites

- Node.js 20 or newer (`engines.node >= 20.0.0`, `.node-version` pins 20)
- npm
- Docker and Docker Compose (for PostgreSQL, Redis and MinIO)

## Local setup

```bash
git clone https://github.com/ErasmusEgalitarian/educado-api.git
cd educado-api
cp .env.example .env
npm install
```

Bring up the local infrastructure:

```bash
sudo docker compose up -d
```

Important: `docker-compose.yml` only defines the backing services. It starts
`postgres`, `redis`, `minio` and the one-shot `minio-setup` job (which creates
the `educado-media` bucket). It does NOT start the API and it does NOT start the
email worker. You run both of those directly with Node.

Host ports exposed by Docker Compose:

| Service | Host port | Container port |
|---------|-----------|----------------|
| PostgreSQL | 5431 | 5432 |
| Redis | 6380 | 6379 |
| MinIO (S3 API) | 9002 | 9000 |
| MinIO (web console) | 9003 | 9001 |

Make sure your `.env` points at those host ports, for example:

```env
POSTGRES_URI_DEV=postgresql://educado:educado@localhost:5431/educado_dev
REDIS_HOST=localhost
REDIS_PORT=6380
S3_ENDPOINT=http://localhost:9002
```

Useful lifecycle commands:

```bash
sudo docker compose down      # stop the infrastructure
sudo docker compose down -v   # stop and wipe volumes (resets all local data)
```

## Running the API and the worker

Two processes, two terminals:

```bash
npm run dev            # API with hot reload (nodemon + ts-node, NODE_ENV=development)
npm run worker:email   # BullMQ email worker
```

The API listens on `PORT` (default `5001`). Swagger UI is served at
`http://localhost:5001/docs`.

Optional seeding:

```bash
npm run seed                              # sample courses
npx ts-node src/scripts/seed-admin.ts     # create an admin user
```

Note on `NODE_ENV`: `src/config/database.ts` reads `POSTGRES_URI` only when
`NODE_ENV === 'production'`. For any other value it reads `POSTGRES_URI_DEV`.
Keep `NODE_ENV=development` locally.

## Branching and pull requests

The default branch of this repository is `main`. There is also a long lived
`dev` branch used to integrate work before it reaches `main`.

1. Create your branch from `dev` unless a maintainer tells you otherwise.
2. Name it with a type prefix and a short kebab-case description:
   - `feat/course-tags-filter`
   - `fix/media-stream-range-header`
   - `chore/bump-sequelize`
   - `docs/contributing-guide`
3. Keep the branch focused. One concern per pull request.
4. Rebase or merge the target branch into yours before asking for review, so the
   diff is clean.
5. Open the pull request against `dev` (or `main` for a release or hotfix,
   when a maintainer asks for it) and fill in the pull request template.
6. Pull requests need at least one approving review. Do not merge your own pull
   request without one.
7. The quality gate below must pass before review.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<optional scope>): <short imperative description>

<optional body>

<optional footer, e.g. Closes #123>
```

Types in use in this repository: `feat`, `fix`, `chore`, `docs`, `refactor`,
`test`, `build`, `perf`, `ci`, `style`.

Examples taken from the project history:

```
feat(activities): accept association activity (image_association)
fix(tests,lint): fix pending prettier and dropEnrollment test
chore: stop versioning CLAUDE.md
build(deps): bump js-yaml from 4.1.1 to 4.2.0
```

Guidelines:

- Subject line in the imperative mood, no trailing period, ideally under 72
  characters.
- Use the scope to name the affected module (`auth`, `media`, `courses`,
  `progress`, `deps`).
- A breaking change is marked with `!` after the type or scope
  (`feat(auth)!: ...`) and explained in the body.

## Quality gate: lint, tests, typecheck

Run all three before pushing. This is the same checklist maintainers run on
review:

```bash
npm run lint       # ESLint 9 (flat config: @eslint/js + typescript-eslint + eslint-config-prettier)
npm test           # Jest + ts-jest
npx tsc --noEmit   # TypeScript type check without emitting
```

Extra commands:

```bash
npm run lint:fix        # ESLint with auto-fix
npm run test:watch      # Jest in watch mode
npm run test:coverage   # Jest with coverage report
npx jest src/application/media   # a single module or file
npm run build           # compile TypeScript to build/
```

Any pull request that changes behaviour should come with tests. Test files live
next to the code they cover, in `__tests__` folders, named `*.test.ts`.

## Code standards

- **TypeScript strict mode.** Do not introduce `any` to silence the compiler.
  If a type is genuinely unknown, use `unknown` and narrow it.
- **Layering.** Keep the existing separation:
  - `routes/` are thin controllers: parse the request, validate, call a service,
    shape the response. No business logic.
  - `application/` holds business logic and must not touch `req` or `res`.
  - `models/` are Sequelize models, with associations declared in
    `models/index.ts`.
  - `infrastructure/` wraps external services (S3/MinIO, Resend, Redis, bcrypt).
  - `interface/http/middlewares/` holds Express middleware.
- **Errors.** Use the shared `AppError` from `application/common` instead of
  throwing bare strings or leaking driver errors to the client.
- **Formatting.** Prettier runs through ESLint. Run `npm run lint:fix` rather
  than hand-formatting.
- **Naming.** Files in kebab-case, classes in PascalCase, functions and
  variables in camelCase. Database columns are snake_case (Sequelize is
  configured with `underscored: true`).
- **Secrets.** Never commit a real `.env`, an API key, a token or a password. If
  you add a new environment variable, document it in `.env.example` and in the
  README.
- **API docs.** If you add or change an endpoint, update the Swagger document in
  `src/docs/` so `/docs` stays accurate.
- **Dependencies.** Adding a dependency is a design decision. Open an issue or
  raise it in the pull request description explaining why it is needed and what
  alternatives you considered.

## Reporting bugs and requesting features

Open an issue using the bug report or feature request template in
`.github/ISSUE_TEMPLATE/`. Search existing issues first to avoid duplicates.

## Security issues

Do not open a public issue for a security vulnerability. Follow
[SECURITY.md](SECURITY.md) and report it privately to 190091681@aluno.unb.br.
