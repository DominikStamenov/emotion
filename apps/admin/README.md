# eMotion Admin

Private Next.js administration application for eMotion. It is a custom Agency
OS connected to Supabase PostgreSQL, Auth and Storage. It includes the content
workspace, media upload, inbox, CRM, proposal/delivery operations, AI center and
governance settings.

```bash
pnpm --filter @emotion/admin dev
pnpm --filter @emotion/admin lint
pnpm --filter @emotion/admin check-types
pnpm --filter @emotion/admin build
```

Local development runs on port `3001`.

Without valid Supabase values the application deliberately renders a locked
setup screen. After migrations are applied, create the first Auth user and
activate its `owner` profile as described in `supabase/README.md`.
