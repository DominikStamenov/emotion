import { AdminShell } from "../../components/admin-shell";
import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import {
  createMilestone,
  invitePortalClient,
  openPortalPasswordSetup,
  publishDeliverableForReview,
  resolvePortalFeedback,
} from "../actions/portal";
import styles from "../workspace.module.css";

export default async function ClientsPage() {
  const profile = await requireAdminProfile();
  const supabase = await createClient();
  const [
    { data: engagements },
    { data: accessRows },
    { data: clientProfiles },
    { data: milestones },
    { data: deliverables },
    { data: feedback },
  ] = await Promise.all([
    supabase
      .from("engagements")
      .select("id, title, status")
      .not("status", "in", '("completed","cancelled")')
      .order("updated_at", { ascending: false }),
    supabase
      .from("client_portal_access")
      .select("id, user_id, engagement_id, access_role, active, invited_at")
      .order("invited_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, display_name, active")
      .eq("account_type", "client"),
    supabase
      .from("project_milestones")
      .select("id, engagement_id, title, status, due_at")
      .order("position"),
    supabase
      .from("deliverables")
      .select("id, engagement_id, title, status, due_at")
      .in("status", ["in_progress", "review"])
      .order("due_at", { ascending: true, nullsFirst: false }),
    supabase
      .from("portal_feedback")
      .select(
        "id, engagement_id, deliverable_id, body, decision, created_at, resolved_at",
      )
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const profilesById = new Map(
    (clientProfiles || []).map((client) => [client.id, client]),
  );
  const engagementsById = new Map(
    (engagements || []).map((engagement) => [engagement.id, engagement]),
  );

  return (
    <AdminShell profile={profile}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Client delivery</span>
          <h1>Client Portal</h1>
          <p>
            Pozivnice, pristup angažmanima, timeline, isporuke, odobrenja i
            klijentski feedback povezani su s istim operativnim zapisima.
          </p>
        </div>
      </header>

      <section className={styles.stats}>
        <article>
          <span>Klijentski računi</span>
          <strong>{clientProfiles?.length || 0}</strong>
        </article>
        <article>
          <span>Aktivni pristupi</span>
          <strong>
            {accessRows?.filter((item) => item.active).length || 0}
          </strong>
        </article>
        <article>
          <span>Milestoneovi</span>
          <strong>{milestones?.length || 0}</strong>
        </article>
        <article>
          <span>Otvoren feedback</span>
          <strong>
            {feedback?.filter((item) => !item.resolved_at).length || 0}
          </strong>
        </article>
      </section>

      {profile.role === "owner" || profile.role === "admin" ? (
        <section className={styles.operationForms}>
          <form action={invitePortalClient} className={styles.miniForm}>
            <h2>Pozovi klijenta</h2>
            <input name="displayName" placeholder="Ime klijenta" required />
            <input
              name="email"
              type="email"
              placeholder="client@company.com"
              required
            />
            <select name="engagementId" required defaultValue="">
              <option value="" disabled>
                Odaberi angažman
              </option>
              {engagements?.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <select name="role" defaultValue="client">
              <option value="client">Client</option>
              <option value="client_owner">Client owner</option>
              <option value="reviewer">Reviewer</option>
            </select>
            <button type="submit">Pošalji pozivnicu</button>
          </form>

          <form action={createMilestone} className={styles.miniForm}>
            <h2>Novi milestone</h2>
            <input name="title" placeholder="Naziv milestonea" required />
            <select name="engagementId" required defaultValue="">
              <option value="" disabled>
                Odaberi angažman
              </option>
              {engagements?.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <input name="startsAt" type="date" />
            <input name="dueAt" type="date" />
            <input name="description" placeholder="Kratki opis" />
            <button type="submit">Dodaj milestone</button>
          </form>
        </section>
      ) : null}

      <section className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Pristupi</h2>
            <span>engagement scoped</span>
          </div>
          <div className={styles.cards}>
            {accessRows?.map((access) => {
              const client = profilesById.get(access.user_id);
              const engagement = engagementsById.get(access.engagement_id);
              return (
                <div className={styles.card} key={access.id}>
                  <div>
                    <strong>{client?.display_name || "Pozvani klijent"}</strong>
                    <small>
                      {engagement?.title || access.engagement_id.slice(0, 8)}
                    </small>
                  </div>
                  <span className={styles.badge}>
                    {access.access_role} ·{" "}
                    {access.active ? "active" : "disabled"}
                  </span>
                  {access.active &&
                  (profile.role === "owner" || profile.role === "admin") ? (
                    <form action={openPortalPasswordSetup}>
                      <input
                        type="hidden"
                        name="userId"
                        value={access.user_id}
                      />
                      <button type="submit">Postavi lozinku</button>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Isporuke za pregled</h2>
            <span>review notification</span>
          </div>
          <div className={styles.cards}>
            {deliverables?.map((deliverable) => (
              <div className={styles.card} key={deliverable.id}>
                <div>
                  <strong>{deliverable.title}</strong>
                  <small>
                    {engagementsById.get(deliverable.engagement_id)?.title}
                  </small>
                </div>
                {deliverable.status === "in_progress" ? (
                  <form action={publishDeliverableForReview}>
                    <input
                      type="hidden"
                      name="deliverableId"
                      value={deliverable.id}
                    />
                    <button type="submit">Pošalji na review</button>
                  </form>
                ) : (
                  <span className={styles.badge}>review</span>
                )}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Klijentski feedback</h2>
          <span>najnoviji prvi</span>
        </div>
        <div className={styles.cards}>
          {feedback?.length ? (
            feedback.map((item) => (
              <div className={styles.card} key={item.id}>
                <div>
                  <strong>{item.decision.replaceAll("_", " ")}</strong>
                  <small>{item.body}</small>
                </div>
                {item.resolved_at ? (
                  <span className={styles.badge}>resolved</span>
                ) : (
                  <form action={resolvePortalFeedback}>
                    <input type="hidden" name="feedbackId" value={item.id} />
                    <button type="submit">Označi riješenim</button>
                  </form>
                )}
              </div>
            ))
          ) : (
            <div className={styles.empty}>Nema klijentskog feedbacka.</div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
