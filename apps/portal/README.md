# eMotion Client Portal

Private client-facing surface for engagements, milestones, deliverables,
feedback, approvals, files and notifications.

Without Supabase public environment variables the application displays a
clearly labelled investor demo. With Supabase configured, authentication and
row-level policies restrict every record to explicitly granted engagements.

```bash
pnpm --filter @emotion/portal dev
pnpm --filter @emotion/portal lint
pnpm --filter @emotion/portal check-types
pnpm --filter @emotion/portal build
```

Local development runs on port `3002`. Production client accounts are separate
from internal staff accounts and can access only engagements explicitly granted
through `client_portal_access`.
