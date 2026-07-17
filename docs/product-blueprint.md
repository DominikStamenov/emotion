# eMotion product blueprint

## Product statement

eMotion is a custom digital agency operating system with an Awwwards-level
public experience. One platform manages how the agency presents itself, turns
interest into qualified opportunities, delivers editorial content, assists
visitors and staff with AI, and measures the complete journey from first visit
to client relationship.

The platform is intentionally broader than a website. The public site and the
internal application share one governed content and customer data foundation.

## Product family

### 1. eMotion Studio (`apps/web`)

- Home with the **Birth of Motion** interactive Hero;
- services index and individual service pages;
- selected-work index and editorial case studies;
- studio/about, capabilities, process and team;
- insights/articles with categories, authors and related content;
- contact and structured project brief;
- privacy, cookies and terms;
- public AI concierge;
- search, SEO metadata, structured data, sitemap and social previews;
- responsive, accessible and reduced-motion experiences.

### 2. eMotion CMS (`apps/admin/content`)

- custom, role-based editorial workspace;
- pages, services, case studies, insights, people and testimonials;
- media, revisions, preview, scheduling, publishing and rollback;
- navigation, redirects, SEO, forms and global settings.

### 3. eMotion Client Portal (`apps/portal`)

- secure client access with organization-level permissions;
- proposals, agreements, project status and milestones;
- deliverables, feedback, approvals, files and conversations;
- notifications, activity history and client-visible reporting.

### 4. eMotion OS (`apps/admin`)

- secure role-based sign-in;
- overview dashboard with content, leads and operational signals;
- visual content editor with draft, preview, publish and scheduling states;
- projects/case studies, services, pages, testimonials, people and insights;
- navigation, footer, SEO, redirects, forms and global settings;
- media library with metadata, variants and usage references;
- CRM contacts, organizations, leads, opportunities and activities;
- inbox for project briefs and AI-chat handoffs;
- tasks, notes, ownership, reminders and audit history;
- AI copilot for search, summaries, content assistance and proposal drafts;
- user, role, integration and system settings.

### 5. eMotion UI (`packages/ui`)

- accessible React primitives and composed product patterns;
- shared design tokens, themes, icons and responsive behavior;
- Storybook documentation, visual states and interaction tests;
- the only default component foundation for Studio, CMS, Portal and OS.

### 6. eMotion Motion (`packages/motion`)

- shared transitions, scroll behavior and pointer interactions;
- Hero timeline and reusable particle/ribbon primitives;
- route, reveal, CTA and feedback choreography;
- reduced-motion policies and performance-aware render profiles.

### 7. eMotion CLI (`packages/cli`)

- generators for new eMotion applications, pages and components;
- consistent configuration for UI, Motion, linting, tests and environments;
- database migration and content-model scaffolding;
- guarded automation for repetitive project setup.

## Content model

Core editorial entities:

- `pages` and ordered `page_sections` for modular layouts;
- `services` with outcomes, process, capabilities, FAQs and SEO;
- `projects` with client, challenge, approach, results, credits and galleries;
- `testimonials` with verification and explicit publish status;
- `people`, `authors`, `insights`, `categories` and `tags`;
- `media_assets` with alt text, focal point, rights and derived variants;
- `navigation_items`, `redirects` and `site_settings`;
- `content_revisions`, scheduled publishing and preview tokens.

Every publishable record has a stable ID, slug, locale-ready structure,
`draft/published/archived` status, SEO fields, timestamps and audit ownership.
Temporary projects and testimonials are marked as seed data and cannot be
mistaken for verified client claims.

## CRM and agency workflow

Core relationship entities:

- `contacts` and `organizations`;
- `inquiries` created by contact forms, briefs or AI chat;
- `leads` with source, consent, score, owner and qualification status;
- `opportunities` with pipeline stage, value range, probability and next step;
- `activities`, `notes`, `tasks`, `attachments` and `tags`;
- `proposals` and `engagements` as the bridge into delivery;
- `conversation_threads` and human handoff records.

Initial pipeline:

1. New inquiry;
2. Reviewing;
3. Qualified;
4. Discovery scheduled;
5. Proposal;
6. Negotiation;
7. Won or lost.

All stage changes are timestamped. Ownership, next action and consent are
first-class data, not free-form notes.

## AI system

### Public AI concierge

- answers only from approved public content and a curated knowledge base;
- explains services, process and relevant work;
- asks structured qualification questions;
- captures contact details only with explicit visitor intent;
- creates or enriches an inquiry and offers human handoff;
- stores citations, feedback, safety decisions and token/cost telemetry;
- rate limits anonymous use and never exposes private CRM data.

### Internal AI copilot

- permission-aware semantic search across CMS and CRM;
- conversation, lead and account summaries;
- draft follow-ups, proposals, case-study outlines and metadata;
- content quality and missing-field checks;
- suggested next actions that always require a human for external sending;
- reusable prompt/version registry and complete audit trail.

The AI layer is provider-adapted rather than embedded directly in UI code, so
models can change without rewriting product workflows.

## Technical architecture

```text
Visitor / team
      |
      +--> eMotion Studio ---+
      |                      |
      +--> eMotion CMS ------+
      |                      +--> server actions / route handlers
      +--> Client Portal ----+
      |                      |
      +--> eMotion OS -------+
                                     |
                       +-------------+-------------+
                       |             |             |
                 PostgreSQL       Storage       Auth
                       |             |             |
                       +------ Supabase ----------+
                                     |
                    jobs / email / AI provider adapters
```

### Repository boundaries

- `apps/web`: public rendering, forms and public AI interface;
- `apps/admin`: authenticated eMotion CMS and eMotion OS;
- `apps/portal`: authenticated eMotion Client Portal;
- `packages/database`: generated database types, queries and migrations helpers;
- `packages/domain`: shared schemas, permissions and business rules;
- `packages/ai`: provider adapters, retrieval and safety policies;
- `packages/email`: transactional email templates and delivery adapter;
- `packages/ui`: shared accessible components and design primitives;
- `packages/motion`: shared animation engine and interaction contracts;
- `packages/cli`: project, page, component and migration generators;
- `supabase/migrations`: versioned source of truth for PostgreSQL and RLS.

### Infrastructure decisions

- Next.js App Router and React for all three application surfaces;
- custom UI and workflows throughout;
- Supabase PostgreSQL, Auth and Storage;
- row-level security plus server-side authorization;
- Resend for transactional contact and operational email;
- background jobs for publishing, notifications, indexing and AI processing;
- privacy-aware first-party product events and server-side operational metrics.

## Roles and security

Initial roles:

- `owner`: full product, billing and security control;
- `admin`: users, content, CRM and integrations;
- `editor`: editorial content and media;
- `sales`: contacts, leads, opportunities and activities;
- `viewer`: read-only internal access.

Client accounts are a separate `account_type`, not a sixth internal role. They
can read only engagements explicitly granted through Client Portal access and
can submit decisions only through the guarded feedback workflow.

Security requirements:

- deny-by-default RLS policies;
- least-privilege service credentials and separate public/server clients;
- MFA-ready authentication and protected admin routes;
- audit log for authentication, publishing, CRM changes and AI actions;
- validation at every external boundary;
- rate limits, bot protection and abuse controls for forms and chat;
- encrypted secrets, signed uploads and restricted private media;
- backups, restore procedure, data export and retention rules;
- GDPR consent, deletion and legal-document version tracking.

## Delivery sequence

### Phase 1 — product foundation

- authoritative scope and data contracts;
- full-bleed Hero/landing composition and reference-led visual QA;
- Turborepo boundaries for all seven eMotion products;
- eMotion UI foundation, Storybook and eMotion Motion contracts;
- ESLint, Prettier, Husky, CI/CD and Vercel preview deployment;
- shared environment validation and database client boundaries;
- first migration, roles, profiles and audit infrastructure.

### Phase 2 — CMS and public content

- content schema, media library and publishing workflow;
- admin shell, navigation, permissions and editorial screens;
- public routes reading published content with draft preview;
- SEO, redirects, sitemap, legal routes and social assets.

### Phase 3 — CRM and conversion

- project brief/contact flow, validation and Resend delivery;
- contacts, organizations, leads, pipeline, tasks and activity history;
- attribution, consent, spam protection and operational notifications.

### Phase 4 — AI and automation

- curated knowledge ingestion and semantic retrieval;
- public concierge, qualification and human handoff;
- internal copilot, prompt registry, evaluations and cost controls;
- publishing, follow-up and reminder jobs.

### Phase 5 — agency operations and launch

- complete Client Portal and proposal/engagement bridge;
- analytics dashboards and alerting;
- accessibility, performance, browser and security regression suites;
- production environments, migrations, backups and launch runbook.

### Phase 6 — product platform tooling

- mature eMotion UI documentation and visual regression coverage;
- reusable eMotion Motion primitives and choreography recipes;
- production eMotion CLI generators, validation and upgrade paths;
- investor-ready product narrative, demo data and end-to-end showcase.

## Definition of done

The project is complete only when:

- every public route uses governed CMS content or an explicitly marked seed;
- non-technical staff can draft, preview, publish and roll back content;
- every inquiry is delivered, persisted, attributed and visible in CRM;
- the public AI concierge is grounded, safe, rate-limited and handoff-capable;
- staff permissions are enforced in both UI and database policies;
- audit, backup, restore, privacy and retention workflows are tested;
- automated quality gates cover lint, types, unit, integration and browser QA;
- mobile, accessibility, reduced-motion and performance budgets pass;
- Studio, CMS, Client Portal and OS work as one permission-aware platform;
- UI, Motion and CLI are documented, tested and used by the applications;
- `emotion.com` metadata, email, legal content and monitoring are live;
- temporary portfolio and testimonial content cannot be published as verified.

## Implementation status — 17 July 2026

Implemented in the repository:

- public experience, full-viewport Hero and blended landing transition;
- CMS data model, protected editor, previews, revisions, publishing and media
  upload;
- public content routes, SEO metadata, sitemap, redirects and legal fallbacks;
- contact persistence, attribution, consent, email, inbox and CRM pipeline;
- atomic inquiry qualification into lead and opportunity records;
- proposal, engagement, deliverable and task operations;
- dedicated Client Portal with secure authentication, engagement-scoped RLS,
  milestones, deliverable decisions, feedback, notifications and signed private
  file access;
- Client Portal administration for invitations, access, milestones, review
  requests and feedback resolution;
- first-party acquisition, funnel, pipeline, AI and email analytics;
- public grounded AI concierge, knowledge indexing, moderation, citations,
  telemetry and human handoff;
- private permission-aware AI copilot with approved-context retrieval and
  mandatory human review;
- database migrations, RLS, storage, audit, privacy event and automation job
  foundations;
- reusable eMotion UI design tokens, accessible components and production
  Storybook documentation;
- reusable eMotion Motion provider, reveal, magnetic, CTA and timeline
  primitives with reduced-motion policy;
- guarded eMotion CLI app and UI/Motion component generators;
- Husky, lint-staged, independent GitHub quality/deployment workflows and three
  Vercel project configurations;
- security headers plus format, lint, type, unit, Storybook, production-build
  and responsive browser checks;
- investor-ready Studio and Portal demo states when external services are not
  connected.

No known repository implementation blocker remains for the connected platform
demo. Full database, authentication, email, AI and monitoring acceptance must
run against staging because those checks require real external infrastructure.

Requires external production state before the definition of done can be signed
off:

- execute and verify migrations against staging and production Supabase;
- configure Auth, owner accounts, secret rotation, backups and restore drill;
- verify the `emotion.com` sending domain and live transactional email;
- add production OpenAI credentials, budgets and monitoring;
- replace temporary projects/testimonials and approve final legal documents;
- deploy, connect DNS, run final accessibility/performance/security regression
  on production infrastructure and activate alerting;
- deploy and validate all production surfaces with real accounts and data.

See [`launch-runbook.md`](launch-runbook.md) for the executable handoff.
