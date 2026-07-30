# eMotion deployment

eMotion is deployed as three Vercel projects connected to the same monorepo:

| Product               | Root directory | Initial production address |
| --------------------- | -------------- | -------------------------- |
| eMotion Studio        | `apps/web`     | Vercel project URL         |
| eMotion CMS + OS      | `apps/admin`   | Vercel project URL         |
| eMotion Client Portal | `apps/portal`  | Vercel project URL         |

Custom domains are intentionally deferred until eMotion owns a domain and DNS
access is confirmed. `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADMIN_URL` and
`NEXT_PUBLIC_PORTAL_URL` make the temporary Vercel addresses the canonical
runtime values without hard-coding a domain claim.

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
application builds, then starts those builds on isolated ports and runs the
desktop/mobile Playwright smoke suite. Husky runs `lint-staged` before local
commits; GitHub installs the matching Chromium runtime and runs the full gate
independently, so bypassing a local hook cannot bypass CI.
