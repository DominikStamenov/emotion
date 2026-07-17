import { AdminShell } from "../../components/admin-shell";
import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import { assignInquiryToSelf, qualifyInquiry } from "../actions/crm";
import styles from "../workspace.module.css";

export default async function InboxPage() {
  const profile = await requireAdminProfile();
  const supabase = await createClient();
  const [{ data: inquiries }, { data: handoffs }] = await Promise.all([
    supabase
      .from("inquiries")
      .select(
        "id, name, email, company, message, status, requested_services, assigned_to, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("ai_conversations")
      .select("id, summary, status, inquiry_id, last_message_at")
      .eq("status", "handoff_requested")
      .order("last_message_at", { ascending: false })
      .limit(20),
  ]);
  const newCount = (inquiries || []).filter(
    (item) => item.status === "new",
  ).length;

  return (
    <AdminShell profile={profile}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Unified intake</span>
          <h1>Inbox</h1>
          <p>
            Projektni briefovi i AI razgovori koji traže čovjeka ulaze u isti
            operativni red.
          </p>
        </div>
      </header>

      <section className={styles.stats}>
        <article>
          <span>Novi briefovi</span>
          <strong>{newCount}</strong>
        </article>
        <article>
          <span>AI handoff</span>
          <strong>{handoffs?.length || 0}</strong>
        </article>
        <article>
          <span>Ukupno prikazano</span>
          <strong>{inquiries?.length || 0}</strong>
        </article>
        <article>
          <span>Vlasnik</span>
          <strong>{profile.display_name?.slice(0, 2) || "EM"}</strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Projektni upiti</h2>
          <span>najnoviji prvi</span>
        </div>
        {inquiries?.length ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kontakt</th>
                <th>Kontekst</th>
                <th>Usluge</th>
                <th>Status</th>
                <th>Vlasništvo</th>
                <th>CRM</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <small>{item.email}</small>
                  </td>
                  <td>
                    <strong>{item.company || "Samostalni projekt"}</strong>
                    <small>{item.message.slice(0, 90)}</small>
                  </td>
                  <td>
                    {item.requested_services.join(", ") || "Nije navedeno"}
                  </td>
                  <td>
                    <span className={styles.badge}>{item.status}</span>
                  </td>
                  <td>
                    {item.assigned_to ? (
                      "Dodijeljeno"
                    ) : (
                      <form action={assignInquiryToSelf}>
                        <input type="hidden" name="inquiryId" value={item.id} />
                        <button type="submit">Preuzmi</button>
                      </form>
                    )}
                  </td>
                  <td>
                    {item.status === "new" || item.status === "reviewing" ? (
                      <form action={qualifyInquiry}>
                        <input type="hidden" name="inquiryId" value={item.id} />
                        <button type="submit">Kvalificiraj</button>
                      </form>
                    ) : (
                      <span className={styles.badge}>{item.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.empty}>Nema novih upita.</div>
        )}
      </section>
    </AdminShell>
  );
}
