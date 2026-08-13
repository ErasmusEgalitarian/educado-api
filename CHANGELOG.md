# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `LICENSE` with the full Apache License 2.0 text.
- `CONTRIBUTING.md` with local setup, branching, Conventional Commits and the
  lint/test/typecheck quality gate.
- `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1).
- `CHANGELOG.md` following Keep a Changelog.
- GitHub issue templates (bug report, feature request) and a pull request
  template under `.github/`.

### Changed

- `package.json`: `name` corrected from the scaffold leftover
  `fast-forward-dev-server` to `educado-api`, `description` filled in, and
  `license` changed from `ISC` to `Apache-2.0`.
- `SECURITY.md` replaced the unedited GitHub template with a real policy:
  supported version `1.0.x`, private reporting channel, response targets and
  scope.
- `README.md` corrected: Docker Compose starts only the backing services
  (PostgreSQL, Redis, MinIO and the bucket setup job), real host ports
  documented (PostgreSQL 5431, Redis 6380, MinIO 9002 and 9003), `NODE_ENV`
  behavior in deployment, the previously undocumented `REDIS_PASSWORD`
  variable, the production API URL, and the license section.

## [1.0.1] - 2026-08-13

First documented release of the Educado backend REST API, an educational
platform for waste pickers in Brazil built as a partnership between the
University of Brasilia (UnB) and Aalborg University.

### Added

- REST API on Node.js 20 and Express 5, written in TypeScript in strict mode,
  compiled to `build/`.
- PostgreSQL 16 persistence through Sequelize, with `underscored` column naming
  and schema synchronization on startup (`sequelize.sync()`).
- Authentication and authorization with JWT and password hashing with bcryptjs.
- Registration flow with profile submission, email verification by one-time
  code, and admin approval or rejection.
- Password reset flow with a one-time code.
- Phone based login for students.
- Course catalog: courses, sections and activities, including video, text,
  multiple choice, true or false, and image association activities.
- Enrollment, course and section progress, experience points, leaderboard, and
  certificate issuing as PDF with a QR code verification endpoint.
- Media pipeline on MinIO or any S3 compatible storage, with image and video
  upload, metadata, presigned access and range request streaming for large
  videos.
- Tags and institutions, including trusted email domains for institutions.
- Asynchronous email delivery through a BullMQ queue on Redis 7.2, with a
  dedicated worker process and Resend as the email provider.
- Rate limiting, request id middleware, HTTPS enforcement in production and
  configurable CORS origins.
- OpenAPI documentation served by Swagger UI at `GET /docs`.
- Jest and ts-jest test suite with supertest for HTTP level tests.
- ESLint 9 flat config (google base plus prettier) and a `npm run lint`,
  `npm test`, `npx tsc --noEmit` quality gate.
- Docker Compose file for local infrastructure (PostgreSQL, Redis, MinIO and a
  one-shot job that creates the `educado-media` bucket).
- Deployment on Coolify with Nixpacks (`nixpacks.toml`) and a `Procfile`
  declaring the `web` and `worker` processes. Production API at
  https://api-educado.tominho.com.
- Seed scripts for sample courses and for an admin user.

[Unreleased]: https://github.com/ErasmusEgalitarian/educado-api/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/ErasmusEgalitarian/educado-api/releases/tag/v1.0.1
