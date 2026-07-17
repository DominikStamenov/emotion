# eMotion deployment

eMotion is deployed as three Vercel projects connected to the same monorepo:

| Product               | Root directory | Production domain    |
| --------------------- | -------------- | -------------------- |
| eMotion Studio        | `apps/web`     | `emotion.com`        |
| eMotion CMS + OS      | `apps/admin`   | `admin.emotion.com`  |
| eMotion Client Portal | `apps/portal`  | `portal.emotion.com` |

## Vercel project setup

Create one Vercel project for each root directory. Configure the same public
Supabase URL and publishable key where needed, but only Studio and OS receive
the server integrations they actually use. All three projects must use Node 22
and pnpm 9.

The GitHub deployment workflow expects these encrypted repository secrets:

- `VERCEL_TOKEN`;
- `VERCEL_ORG_ID`;
- `VERCEL_WEB_PROJECT_ID`;
- `VERCEL_ADMIN_PROJECT_ID`;
- `VERCEL_PORTAL_PROJECT_ID`.

If they are absent, the deployment workflow reports a skipped deployment
instead of exposing or inventing credentials. Pull requests and `main` always
run the independent Quality workflow first.

## Release gates

The repository gate is:

```bash
pnpm quality
```

It verifies formatting, lint, types, unit tests, Storybook and all production
application builds. Husky runs `lint-staged` before local commits; GitHub runs
the full gate independently, so bypassing a local hook cannot bypass CI.
