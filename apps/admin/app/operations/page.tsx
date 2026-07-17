import { AdminShell } from "../../components/admin-shell";
import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import {
  createDeliverable,
  createEngagement,
  createProposal,
  createTask,
} from "../actions/operations";
import styles from "../workspace.module.css";

export default async function OperationsPage() {
  const profile = await requireAdminProfile();
  const supabase = await createClient();
  const [
    { data: opportunities },
    { data: proposals },
    { data: engagements },
    { data: deliverables },
    { data: tasks },
  ] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id, title, stage")
      .not("stage", "in", '("won","lost")')
      .order("updated_at", { ascending: false }),
    supabase
      .from("proposals")
      .select("id, title, status, version, amount, currency, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("engagements")
      .select("id, title, status, budget, currency, target_end_date")
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("deliverables")
      .select("id, title, status, due_at, engagement_id")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("tasks")
      .select("id, title, status, due_at")
      .in("status", ["open", "in_progress"])
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(30),
  ]);

  return (
    <AdminShell profile={profile}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Lead to delivery</span>
          <h1>Operacije</h1>
          <p>
            Ponude, aktivni angažmani, isporuke i sljedeći zadaci povezani su s
            istim CRM zapisima i vlasnicima.
          </p>
        </div>
      </header>

      <section className={styles.stats}>
        <article>
          <span>Ponude</span>
          <strong>{proposals?.length || 0}</strong>
        </article>
        <article>
          <span>Angažmani</span>
          <strong>{engagements?.length || 0}</strong>
        </article>
        <article>
          <span>Isporuke</span>
          <strong>{deliverables?.length || 0}</strong>
        </article>
        <article>
          <span>Otvoreni zadaci</span>
          <strong>{tasks?.length || 0}</strong>
        </article>
      </section>

      <section className={styles.operationForms}>
        <form action={createProposal} className={styles.miniForm}>
          <h2>Nova ponuda</h2>
          <input name="title" placeholder="Naziv ponude" required />
          <select name="opportunityId" required defaultValue="">
            <option value="" disabled>
              Odaberi priliku
            </option>
            {opportunities?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <input name="amount" type="number" min="0" placeholder="Iznos EUR" />
          <button type="submit">Kreiraj ponudu</button>
        </form>

        <form action={createEngagement} className={styles.miniForm}>
          <h2>Novi angažman</h2>
          <input name="title" placeholder="Naziv angažmana" required />
          <select name="opportunityId" defaultValue="">
            <option value="">Bez vezane prilike</option>
            {opportunities?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <input name="targetEndDate" type="date" />
          <button type="submit">Otvori angažman</button>
        </form>

        <form action={createDeliverable} className={styles.miniForm}>
          <h2>Nova isporuka</h2>
          <input name="title" placeholder="Naziv isporuke" required />
          <select name="engagementId" required defaultValue="">
            <option value="" disabled>
              Odaberi angažman
            </option>
            {engagements?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <input name="dueAt" type="datetime-local" />
          <button type="submit">Dodaj isporuku</button>
        </form>

        <form action={createTask} className={styles.miniForm}>
          <h2>Novi zadatak</h2>
          <input name="title" placeholder="Sljedeća aktivnost" required />
          <select name="opportunityId" defaultValue="">
            <option value="">Bez vezane prilike</option>
            {opportunities?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <input name="dueAt" type="datetime-local" />
          <button type="submit">Dodaj zadatak</button>
        </form>
      </section>

      <section className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Aktivna isporuka</h2>
            <span>angažmani i deliverables</span>
          </div>
          <div className={styles.cards}>
            {engagements?.length ? (
              engagements.map((item) => (
                <div className={styles.card} key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <small>
                      {item.budget
                        ? item.currency +
                          " " +
                          item.budget.toLocaleString("hr-HR")
                        : "Budžet nije definiran"}
                    </small>
                  </div>
                  <span className={styles.badge}>{item.status}</span>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Nema aktivnih angažmana.</div>
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Otvorene obveze</h2>
            <span>tasks</span>
          </div>
          <div className={styles.cards}>
            {tasks?.length ? (
              tasks.map((item) => (
                <div className={styles.card} key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <small>
                      {item.due_at
                        ? new Date(item.due_at).toLocaleString("hr-HR")
                        : "Bez roka"}
                    </small>
                  </div>
                  <span className={styles.badge}>{item.status}</span>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Nema otvorenih zadataka.</div>
            )}
          </div>
        </article>
      </section>
    </AdminShell>
  );
}
