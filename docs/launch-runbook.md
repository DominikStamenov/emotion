# eMotion production launch runbook

## Purpose

This runbook turns the completed repository foundation into the live eMotion
platform. It separates code work from external production state so no missing
credential, legal decision or temporary claim is mistaken for a finished
launch.

Production surfaces:

- assigned Vercel production URL — public agency experience;
- assigned Vercel production URL — private Agency OS;
- assigned Vercel production URL — private Client Portal;
- project contact form — public contact channel until an address is confirmed;
- transactional email remains disabled until a sending domain is verified.

## 1. Required owner inputs

The following values cannot be inferred safely and must be confirmed before
launch:

- legal company/entity name, registered address, registration and VAT/OIB
  details;
- privacy contact or DPO, applicable jurisdiction and approved retention
  periods;
- final privacy, cookie and terms text reviewed for the real business;
- real projects, outcomes, credits, imagery and client permission;
- verified testimonials and explicit permission to publish each one;
- production Supabase organization/project ownership;
- a future owned domain plus Resend and DNS access;
- OpenAI project ownership, budget and data-processing settings;
- deployment/DNS ownership for all three application surfaces.

## 2. Environment topology

Create separate staging and production environments. Each environment receives
its own Supabase project, Auth users, storage, Resend/OpenAI secrets and hash
secret. Never reuse the production secret key in local development.

Copy `.env.example` into each deployment provider's encrypted environment
settings. Only these two values are public:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

All remaining values are server-only. Generate `IP_HASH_SECRET` from at least
32 cryptographically random bytes and rotate it through the deployment secret
manager, not through Git.

## 3. Database, Auth and Storage

1. Create staging and production Supabase projects in the intended EU region.
2. Apply all SQL migrations in filename order.
3. Regenerate TypeScript database types from staging and compare them with the
   checked-in contract.
4. Create the first Supabase Auth user with the owner email.
5. Promote that profile with the SQL in `supabase/README.md`.
6. Enable MFA for owner/admin accounts and configure the allowed redirect URLs
   for the assigned admin and portal production URLs.
7. Confirm both `public-media` and `private-media` buckets and test that an
   anonymous user cannot read private objects.
8. Test editor, sales and viewer accounts against the permission matrix.

All eight tracked migrations are applied to the connected staging and
production projects. Migration `0008_mfa_enforcement.sql` makes role-based
database access require AAL2 after a staff user verifies a TOTP factor.

## 4. Email

1. Acquire an owned domain, then add and verify its sending domain in Resend.
2. Publish the required SPF and DKIM records; confirm DMARC alignment.
3. Set `CONTACT_FROM_EMAIL` to an approved sender on that domain.
4. Set `CONTACT_NOTIFICATION_EMAIL` and `NEXT_PUBLIC_CONTACT_EMAIL` to approved
   addresses.
5. Submit a staging brief and verify CRM persistence happens even if email
   delivery is temporarily unavailable.
6. Verify the internal notification and visitor confirmation in major clients.
7. Confirm bounce/complaint handling and the sender reputation alert path.

## 5. AI activation

1. Create a dedicated OpenAI project and server-side API key.
2. Set a monthly budget, usage alert and an approved model through
   `OPENAI_CHAT_MODEL`.
3. Keep the default `gpt-5.6-luna` cost/latency tier unless representative
   concierge and copilot evaluations justify a different GPT-5.6 family role.
4. Publish real CMS content, then use **Obnovi javno znanje** in AI centar.
5. Ask the public concierge about a known service and verify its citations.
6. Ask about an unknown client and verify it refuses to invent a claim.
7. Trigger human handoff and verify the conversation links to the CRM inquiry.
8. Test the internal copilot with editor and sales roles; confirm each sees
   only the context allowed by its role.
9. Confirm that all copilot output remains an unsent draft requiring review.
10. Exercise the public session/address limits and the internal staff limit;
    confirm throttled requests return `429` with `Retry-After` and that raw IP
    addresses are never persisted.

## 6. Content and legal release

1. Replace all concept projects or keep the visible temporary labels.
2. Replace placeholder testimonials. Only records explicitly marked verified
   may appear publicly.
3. Add real service detail, studio/team content, project credits, results,
   insight authors and approved media alt text.
4. Publish final legal-document versions with effective dates.
5. Confirm no physical address, company number, result or client relationship
   is invented in public copy.
6. Compare the production Hero with the restored Concept A reference without
   changing the verified logo geometry.

## 7. Deployment and DNS

1. Deploy `apps/web`, `apps/admin` and `apps/portal` as separate Next.js
   applications from the same repository.
2. Configure the correct encrypted environment values for each application.
3. Use Vercel project URLs until an owned domain is ready.
4. When a domain is acquired, map the public host and redirect its
   non-canonical variant permanently.
5. Map future admin and portal subdomains while retaining their `noindex`
   headers.
6. Confirm TLS, HSTS, CSP, frame protection and the expected Supabase network
   origins.
7. Add the Vercel organization, token and three project IDs described in
   `docs/deployment.md` to encrypted GitHub repository secrets.
8. Run the complete quality command before promotion:

   ```bash
   pnpm quality
   ```

   The local machine must have the Chromium runtime installed with
   `pnpm exec playwright install chromium`. CI installs Chromium and its Linux
   dependencies automatically.

9. Test Chrome, Safari and Firefox on desktop plus iOS/Android widths. Test
   keyboard navigation, reduced motion, contrast and WebGL failure fallback.
10. Run performance checks on real production assets. Initial budgets are LCP
    below 2.5 s, CLS below 0.1 and INP below 200 ms at the 75th percentile.

## 8. Backups, monitoring and privacy operations

1. Enable Supabase point-in-time recovery where the selected plan supports it.
2. Create encrypted daily logical backups outside the primary project account.
3. Perform and document a staging restore before launch and every quarter.
4. Monitor public uptime, API error rate, contact delivery, AI failures,
   authentication anomalies and storage growth.
5. Alert on failed automation jobs, email bounces and unusual rate-limit use.
6. Document contact export, consent history, deletion/anonymization and access
   request procedures.
7. Approve retention windows for inquiries, AI conversations, events, email
   delivery logs and audit records before processing production data.

## 9. Launch sequence and rollback

Recommended release order:

1. staging migration and role tests;
2. content/legal approval;
3. production migration and owner activation;
4. admin deployment and smoke test;
5. Client Portal invitation, access and deliverable-decision smoke test;
6. public deployment behind a preview hostname;
7. contact/email/AI end-to-end test;
8. DNS switch for all three production surfaces;
9. monitoring watch and post-launch content check.

If the public release fails, roll DNS/deployment traffic back to the previous
application version. Do not reverse database migrations destructively during an
incident. Restore or apply a forward repair migration after preserving logs and
the affected records.

## Current launch blockers

- staging and production Supabase projects exist and all tracked migrations are
  applied;
- production secrets are configured; a verified sending domain is still
  unavailable;
- legal entity data and approved legal documents are missing;
- real projects and testimonials have not replaced temporary seed content;
- deployment, backups, monitoring and restore drills require external
  account access.

These are the only remaining categories that prevent claiming a live,
production-complete eMotion platform. They require owner credentials, business
facts or external infrastructure rather than additional speculative code.
