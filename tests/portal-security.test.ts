import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/0006_client_portal.sql"),
  "utf8",
);

describe("Client Portal database security contract", () => {
  it("keeps client identities outside internal staff roles", () => {
    expect(migration).toContain("profile.account_type = 'client'");
    expect(migration).toContain("account_type = 'staff'");
    expect(migration).toContain("and account_type = 'staff'");
  });

  it("scopes project records and private files through engagement access", () => {
    expect(migration).toContain("create policy engagements_client_read");
    expect(migration).toContain("create policy deliverables_client_read");
    expect(migration).toContain("create policy private_portal_media_read");
    expect(migration).toContain(
      "public.has_client_portal_access(deliverable.engagement_id)",
    );
  });

  it("exposes deliverable decisions only through the guarded RPC", () => {
    expect(migration).toContain(
      "create or replace function public.submit_deliverable_feedback",
    );
    expect(migration).toContain(
      "not public.has_client_portal_access(v_engagement_id)",
    );
    expect(migration).toContain(
      "revoke all on function public.submit_deliverable_feedback",
    );
  });
});
