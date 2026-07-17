# eMotion Web

Public Next.js application for eMotion.

```bash
pnpm --filter @emotion/web dev
pnpm --filter @emotion/web lint
pnpm --filter @emotion/web check-types
pnpm --filter @emotion/web build
```

The homepage is composed in `app/page.tsx`. Content sections live in
`components/sections`, while the interactive Hero Engine lives in
`components/hero-experience`.

Published Supabase content replaces the explicit seed fallbacks automatically.
Public writes pass only through validated server routes; the browser never gets
the Supabase secret key, Resend key or OpenAI key.

See the repository root README and `docs/project-history.md` for architecture,
project history and launch status.
