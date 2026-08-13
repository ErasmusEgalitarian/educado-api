## Summary

What does this pull request change, and why?

## Related issues

Closes #

## Type of change

- [ ] `feat` new feature
- [ ] `fix` bug fix
- [ ] `refactor` no behavior change
- [ ] `test` tests only
- [ ] `docs` documentation only
- [ ] `chore` / `build` / `ci` tooling and dependencies
- [ ] `perf` performance

## Breaking change

- [ ] No
- [ ] Yes, described below (affected clients, migration path)

## How it was tested

Describe what you ran and what you observed. Include requests, test names or
screenshots where useful.

```bash

```

## Quality gate

All three must pass locally before review:

- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npx tsc --noEmit`

## Checklist

- [ ] Branch created from `dev` and targeting the right branch
- [ ] Commits follow Conventional Commits
- [ ] Tests added or updated for the behavior I changed
- [ ] Swagger document in `src/docs/` updated if an endpoint changed
- [ ] `.env.example` and README updated if a new environment variable was added
- [ ] No secrets, tokens or personal data in the diff
- [ ] Database change: `sequelize.sync()` handles it, or a migration script was
      added under `docs/` and the plan is described below
- [ ] New dependency: justified in this description, or none added
- [ ] I read CONTRIBUTING.md and agree to the Code of Conduct

## Deployment notes

Anything a maintainer needs to do when this ships (new environment variable,
one-off script, cache flush, bucket change). Write "none" if there is nothing.
