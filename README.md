# eMotion

eMotion is a first-party digital agency platform built as a Turborepo. It
combines an Awwwards-level public experience with a custom CMS, Client Portal,
agency OS, PostgreSQL data layer, AI concierge, internal copilot and reusable
product tooling.

## Workspace

- `apps/web` — public website and visitor experiences, port `3000`;
- `apps/admin` — authenticated CMS/CRM/operations product, port `3001`;
- `apps/portal` — authenticated client workspace, port `3002`;
- `packages/domain` — validation, roles and business rules;
- `packages/database` — typed PostgreSQL/Supabase contract;
- `packages/ai` — public and internal AI provider policies;
- `packages/email` — escaped transactional email templates;
- `packages/ui` — shared accessible React components;
- `packages/motion` — shared motion, interaction and timeline primitives;
- `packages/cli` — guarded eMotion app and component generator;
- `packages/eslint-config` — shared lint configuration;
- `packages/typescript-config` — shared TypeScript configuration;
- `supabase/migrations` — versioned database, functions, storage and RLS source
  of truth.

The public application uses Next.js App Router, React 19, CSS Modules, local
Geist fonts, Three.js and React Three Fiber.

## Product source of truth

- [Product blueprint](docs/product-blueprint.md)
- [Recovered project history](docs/project-history.md)
- [Production launch runbook](docs/launch-runbook.md)

Current launch identity:

- domain: deferred; Vercel project URLs are used until a real domain is owned;
- public email: deferred; the project contact form remains the primary channel;
- projects and testimonials: temporary seed content until verified replacements
  are approved.

## Local development

Requirements: Node.js 20 or newer and pnpm 9.

```bash
pnpm install
pnpm exec playwright install chromium
cp .env.example apps/web/.env.local
cp .env.example apps/admin/.env.local
cp .env.example apps/portal/.env.local
pnpm dev
```

Run only one application:

```bash
pnpm --filter @emotion/web dev
pnpm --filter @emotion/admin dev
pnpm --filter @emotion/portal dev
```

## Quality gates

```bash
pnpm quality
```

This gate covers formatting, lint, types, unit tests, the Storybook production
bundle, production builds and Playwright browser QA for all three applications
at desktop and mobile widths. Husky runs focused checks before commits and
GitHub Actions repeats the independent full gate.

The applications intentionally show safe setup states when credentials are
absent. Live authentication, writes, email and AI require a dedicated Supabase
project and the server-only values documented in `.env.example`.

## Implemented platform

- full public agency site, CMS-backed routes, SEO, social assets and legal
  routes;
- full-viewport responsive Hero with reduced-motion and WebGL fallbacks;
- custom role-based CMS with drafts, preview, publishing, revisions and media
  upload;
- contact intake, consent, attribution, transactional email and CRM pipeline;
- inquiry qualification into leads and opportunities;
- proposals, engagements, deliverables and task operations;
- secure Client Portal projects, milestones, deliverables, decisions, feedback,
  notifications and time-limited private file access;
- first-party analytics for acquisition, conversion and pipeline;
- grounded public AI concierge with citations, moderation, rate limits and
  human handoff;
- private permission-aware AI copilot that only prepares reviewed drafts;
- same-origin and request-size enforcement plus session, address and staff AI
  cost limits;
- PostgreSQL data model, RLS, storage policies, audit infrastructure and
  privacy-aware first-party events;
- shared eMotion UI, eMotion Motion and Storybook libraries;
- guarded eMotion CLI app/component generation;
- security headers, validation, Husky, CI/CD and Vercel configuration;
- production browser smoke coverage for Studio, CMS/OS and Client Portal at
  desktop and mobile breakpoints.

The code is launch-ready as a connected platform foundation, but public launch
still requires hosting credentials, approved legal text and verified content.
A custom domain and transactional email can be connected later without
hard-coded production claims. The exact external steps and remaining owner
inputs are tracked in the launch runbook.

## Hero Engine

The WebGL experience lives in `apps/web/components/hero-experience` and is
called **The Birth of Motion**. It uses the real eMotion vector mark, a central
16-second motion timeline, responsive rendering profiles, reduced-motion
fallback and visibility-aware WebGL lifecycle handling.

The logo target geometry remains locked at 2,100 full-profile particles.
Visual composition can evolve without replacing the verified mark geometry.
The restored **Concept A — Emotion Flow** screenshot is the visual source of
truth. The full-bleed desktop and mobile compositions were calibrated against
it, including the horizontal energy flow and blended landing transition.
