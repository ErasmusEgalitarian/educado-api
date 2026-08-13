---
name: Feature request
about: Suggest a new capability or an improvement to the API
title: "feat: <short description>"
labels: enhancement
assignees: ''
---

## Problem

What problem does this solve, and for whom? Educado serves waste pickers,
content creators, and administrators, so say which of them is affected and how.

## Proposed solution

Describe what you would like the API to do.

## Scope

- [ ] New endpoint or change to an existing endpoint
- [ ] Data model change (new model, new column, new association)
- [ ] Business logic in `application/`
- [ ] Infrastructure (storage, email, queue)
- [ ] Documentation or Swagger
- [ ] Tooling, build or deploy

## API sketch

If this adds or changes an endpoint, sketch the contract.

```
METHOD /path
```

Request body:

```json

```

Response body:

```json

```

## Impact

- Does it break existing clients (web frontend, mobile app)? yes / no
- Does it require a database change or a data migration? yes / no
- Does it need a new environment variable or a new dependency? yes / no, which
  one and why

## Alternatives considered

Other approaches you thought about, and why you prefer this one.

## Additional context

Links, mockups, related issues, or references from the partner institutions.

## Checklist

- [ ] I searched existing issues and this is not a duplicate
- [ ] I described the problem, not only the solution
- [ ] I am willing to work on this: yes / no
