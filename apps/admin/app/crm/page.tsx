import { OPPORTUNITY_STAGES } from "@repo/domain";

import { AdminShell } from "../../components/admin-shell";
import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import { updateOpportunityStage } from "../actions/crm";
import styles from "../workspace.module.css";

const stageLabels: Record<(typeof OPPORTUNITY_STAGES)[number], string> = {
  discovery_scheduled: "Discovery",
  lost: "Lost",
  negotiation: "Negotiation",
  new_inquiry: "New",
  proposal: "Proposal",
  qualified: "Qualified",
  reviewing: "Reviewing",
  won: "Won",
};

export default async function CrmPage() {
  const profile = await requireAdminProfile();
  const supabase = await createClient();
  const [
    { data: opportunities },
    { count: contacts },
    { count: organizations },
  ] = await Promise.all([
    supabase
      .from("opportunities")
      .select(
        "id, title, stage, estimated_value, currency, probability, next_step",
      )
      .order("updated_at", { ascending: false }),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("organizations").select("id", { count: "exact", head: true }),
  ]);
  const open = (opportunities || []).filter(
    (item) => !["won", "lost"].includes(item.stage),
  );
  const value = open.reduce(
    (total, item) => total + (item.estimated_value || 0),
    0,
  );

  return (
    <AdminShell profile={profile}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Relationships & revenue</span>
          <h1>CRM pipeline</h1>
          <p>
            Kontakti, organizacije, prilike, vlasništvo i sljedeće akcije kroz
            cijeli put od upita do angažmana.
          </p>
        </div>
      </header>

      <section className={styles.stats}>
        <article>
          <span>Otvorene prilike</span>
          <strong>{open.length}</strong>
        </article>
        <article>
          <span>Vrijednost pipelinea</span>
          <strong>€{value.toLocaleString("hr-HR")}</strong>
        </article>
        <article>
          <span>Kontakti</span>
          <strong>{contacts || 0}</strong>
        </article>
        <article>
          <span>Organizacije</span>
          <strong>{organizations || 0}</strong>
        </article>
      </section>

      <section className={styles.pipeline} aria-label="Prodajni pipeline">
        {OPPORTUNITY_STAGES.map((stage) => {
          const stageItems = (opportunities || []).filter(
            (item) => item.stage === stage,
          );
          return (
            <article className={styles.column} key={stage}>
              <header>
                <span>{stageLabels[stage]}</span>
                <span>{stageItems.length}</span>
              </header>
              {stageItems.map((item) => (
                <div className={styles.card} key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <small>
                      {item.estimated_value
                        ? item.currency +
                          " " +
                          item.estimated_value.toLocaleString("hr-HR")
                        : "Vrijednost nije definirana"}
                    </small>
                  </div>
                  <form action={updateOpportunityStage}>
                    <input type="hidden" name="opportunityId" value={item.id} />
                    <select
                      name="stage"
                      defaultValue={item.stage}
                      aria-label={"Promijeni fazu za " + item.title}
                    >
                      {OPPORTUNITY_STAGES.map((option) => (
                        <option key={option} value={option}>
                          {stageLabels[option]}
                        </option>
                      ))}
                    </select>
                    <button type="submit">Spremi</button>
                  </form>
                </div>
              ))}
            </article>
          );
        })}
      </section>
    </AdminShell>
  );
}
