---
name: Bug report
about: Report something in the API that does not work as expected
title: "fix: <short description>"
labels: bug
assignees: ''
---

## Description

A clear description of what is broken.

## Affected area

- [ ] Auth and registration (`/auth`, `/admin/registrations`)
- [ ] Profile (`/me`)
- [ ] Courses, sections, activities
- [ ] Media upload or streaming (`/media`, MinIO/S3)
- [ ] Progress, certificates, leaderboard
- [ ] Email queue or worker (Redis, BullMQ, Resend)
- [ ] Database or migrations (Sequelize)
- [ ] API docs (`/docs`, Swagger)
- [ ] Build, deploy or tooling
- [ ] Other, described below

## Endpoint

Method and path, for example `POST /media/videos`. Leave blank if not applicable.

## Steps to reproduce

1.
2.
3.

Request used, with secrets redacted:

```bash
curl -i -X GET http://localhost:5001/... \
  -H "Authorization: Bearer <redacted>"
```

## Expected behavior

What you expected to happen.

## Actual behavior

What actually happened. Include the HTTP status code and the response body.

```json

```

## Logs

Relevant server or worker output, with secrets redacted.

```

```

## Environment

- Where it happened: local / production (https://api-educado.tominho.com)
- Commit or version:
- Node.js version (`node -v`):
- OS:
- `NODE_ENV`:
- Running the API with `npm run dev` or the compiled build?
- Infrastructure via `docker compose up -d`? yes / no

## Regression

Did this work before? If so, on which commit or version?

## Additional context

Anything else that helps, such as a screenshot, a related issue or a suspected
root cause.

## Checklist

- [ ] I searched existing issues and this is not a duplicate
- [ ] I removed all tokens, passwords and personal data from this report
- [ ] This is not a security vulnerability (those go to 190091681@aluno.unb.br,
      see SECURITY.md)
