# Supabase

The SQL migrations are the source of truth for eMotion data, permissions and
storage policy. Apply them in order to a dedicated Supabase project.

Current order:

1. `0001_core_auth_audit.sql`;
2. `0002_cms.sql`;
3. `0003_crm.sql`;
4. `0004_ai.sql`;
5. `0005_agency_operations.sql`;
6. `0006_client_portal.sql`.
7. `0007_runtime_identity.sql`.
8. `0008_mfa_enforcement.sql`.

Use separate staging and production projects. Do not paste a secret key into a
browser environment variable or commit a local `.env` file.

The first user is created as an inactive `viewer` by design. Promote the owner
explicitly after sign-up:

```sql
update public.profiles
set role = 'owner', active = true, account_type = 'staff'
where id = '<auth-user-uuid>';
```

Confirm that the profile is active before opening the administration app. New
users default to client accounts after the Portal migration. Internal users
remain inactive viewers until an owner or administrator explicitly grants staff
access. Never reuse an internal staff identity for Client Portal access.

After a staff user verifies a TOTP factor, `current_app_role()` requires an AAL2
session before role-based data access is granted. Users without an enrolled
factor can reach the Admin security settings to complete first-time enrollment.

Public forms and AI chat must write through validated server routes using a
server-only secret key. The publishable key is used for public reads and
authenticated browser sessions; it never bypasses row-level security.

After applying migrations, regenerate database types from the connected
project and compare them with `packages/database/src/database.types.ts`. The
manual contract in the repository exists so all applications can build before
an external project is connected; the generated production contract is the
final verification source.
