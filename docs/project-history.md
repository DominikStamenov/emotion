# eMotion project history

This document records what can be verified from the conversation and repository
history. It deliberately separates recovered decisions from reconstructed scope.

## Sources reviewed

- the current Codex project conversation;
- the complete 65-message imported ChatGPT conversation **eMotion Development
  Hero Engine**;
- the following Codex Hero hardening conversation;
- the restored **Concept A — Emotion Flow** reference screenshot supplied on
  17 July 2026;
- all local Codex session records available for this project;
- the repository, commit history and local project directories.

The imported ChatGPT conversation contains nine image attachment markers whose
original files were not included in the transfer. The key Hero direction is no
longer missing: the user restored the Concept A reference screenshot and the
original seven-product platform scope in this project conversation. Those
confirmed decisions now override earlier provisional assumptions.

## Confirmed product direction

eMotion is an Awwwards-level digital agency platform, not only a landing page.
It consists of seven named, first-party products:

1. **eMotion Studio** — public agency experience;
2. **eMotion CMS** — custom content management;
3. **eMotion Client Portal** — the client-facing workspace;
4. **eMotion OS** — the internal CRM and agency operating system;
5. **eMotion UI** — the shared React component library;
6. **eMotion Motion** — the shared interaction and animation library;
7. **eMotion CLI** — project and component generation tools.

Together they combine:

- a premium public agency website and complete editorial content system;
- a custom administration product and CMS;
- a CRM and lead-to-client workflow;
- a shared PostgreSQL database, authentication and media storage;
- a public AI concierge and an internal agency copilot;
- automations, analytics, auditing and production operations.

The confirmed public identity is:

- canonical domain: `emotion.com`;
- contact address: `info@emotion.com`;
- current projects and testimonials: temporary seed content.

Every product and its workflows remain owned by eMotion. Supabase supplies managed
PostgreSQL, authentication and object storage infrastructure; it is not a
third-party visual CMS. Resend is the planned transactional email service.

## Public website foundation

The website structure established before the Hero work was:

1. navigation;
2. Hero;
3. capabilities;
4. services;
5. process;
6. selected work;
7. testimonials;
8. project CTA;
9. footer.

The design system uses a near-black background, Geist typography, restrained
glass surfaces, fine borders and a pink-violet-cyan energy palette.

## Hero concept

The Hero experience is called **The Birth of Motion**. Its sequence is:

1. Stillness;
2. Awakening;
3. Flow;
4. Formation;
5. Reveal;
6. Freedom.

The restored reference establishes a wide horizontal energy flow: magenta
energy approaches from the left, cyan energy continues to the right, and a
smaller eMotion mark resolves in the right third while the title area remains
quiet and legible. The ribbons remain alive during Reveal instead of fading
away. Pointer influence, avoid-and-flow movement, an alive system and an
endless cycle are explicit interaction principles.

The official eMotion mark is the source of truth for geometry. Earlier curve
and hand-built polygon attempts were rejected because they could not preserve
the mark's negative space and characteristic cuts. The final solver samples the
real vector mask.

The atmospheric direction is organic particle movement, living ribbons,
depth, pointer response and the feeling that the identity is born from motion.

## Completed Hero sprints

- WebGL canvas, energy core, particle engine and living ribbons;
- Genesis atmosphere and depth composition;
- production SVG/PNG/favicons brand package;
- vector-mask logo target generation;
- reveal choreography for ribbons, atmosphere and energy core;
- central 16-second timeline with a longer, stable reveal hold;
- 2,100-particle full logo and sharp/glow material layers;
- desktop and compact mobile rendering profiles;
- reduced-motion fallback and visibility-aware rendering;
- WebGL failure handling, resource disposal and CI lint hardening.

## Current Hero correction

The first implementation placed the WebGL experience inside the right column
of a two-column Hero. That made the experience read as a separate half-screen
module and created a hard boundary before the landing-page content. The current
layout correction promotes the experience to a full-bleed Hero layer, keeps the
copy above a controlled contrast veil and fades the motion field into the first
content band.

The Concept A screenshot is now the visual source of truth for final Hero and
CTA calibration. The corrected composition has been verified at desktop and
mobile widths instead of being inferred from the earlier half-screen version.

## Homepage foundation recovery

A repository audit found that sections below the Hero used utility class names
without an installed utility CSS system. The rendered sections were therefore
unstyled even though builds passed. The recovery sprint replaced those classes
with CSS Modules and restored responsive services, process, work, testimonials,
CTA, footer and in-page navigation.

## Next source of truth

The complete product model, system boundaries, delivery phases and definition
of done are maintained in [`product-blueprint.md`](product-blueprint.md).
