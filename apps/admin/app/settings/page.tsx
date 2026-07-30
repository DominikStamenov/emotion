import { AdminShell } from "../../components/admin-shell";
import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import { SecuritySettings } from "./security-settings";
import styles from "../workspace.module.css";

export default async function SettingsPage() {
  const profile = await requireAdminProfile();
  const supabase = await createClient();
  const [
    { data: settings },
    { data: users },
    { data: redirects },
    { data: legal },
    { data: authData },
  ] = await Promise.all([
    supabase
      .from("site_settings")
      .select("id, key, is_public, updated_at")
      .order("key"),
    supabase
      .from("profiles")
      .select("id, display_name, role, account_type, active, last_seen_at")
      .order("created_at"),
    supabase
      .from("redirects")
      .select("id, source_path, target_path, status_code, active")
      .order("source_path")
      .limit(30),
    supabase
      .from("legal_documents")
      .select("id, document_type, locale, version, status")
      .order("document_type"),
    supabase.auth.getUser(),
  ]);

  return (
    <AdminShell profile={profile}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Governance</span>
          <h1>Postavke</h1>
          <p>
            Identitet, članovi i uloge, globalne vrijednosti, preusmjeravanja,
            pravni dokumenti i trag promjena.
          </p>
        </div>
      </header>

      <section className={styles.stats}>
        <article>
          <span>Članovi</span>
          <strong>{users?.length || 0}</strong>
        </article>
        <article>
          <span>Aktivni</span>
          <strong>{users?.filter((user) => user.active).length || 0}</strong>
        </article>
        <article>
          <span>Redirects</span>
          <strong>{redirects?.length || 0}</strong>
        </article>
        <article>
          <span>Legal verzije</span>
          <strong>{legal?.length || 0}</strong>
        </article>
      </section>

      <SecuritySettings email={authData.user?.email || ""} />

      <section className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Tim i pristup</h2>
            <span>deny by default</span>
          </div>
          <div className={styles.cards}>
            {users?.map((user) => (
              <div className={styles.card} key={user.id}>
                <div>
                  <strong>{user.display_name || "Novi član"}</strong>
                  <small>{user.id.slice(0, 8)}</small>
                </div>
                <span className={styles.badge}>
                  {user.account_type} · {user.role} ·{" "}
                  {user.active ? "active" : "pending"}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Globalne vrijednosti</h2>
            <span>public / private</span>
          </div>
          <div className={styles.cards}>
            {settings?.map((setting) => (
              <div className={styles.card} key={setting.id}>
                <div>
                  <strong>{setting.key}</strong>
                  <small>
                    promjena{" "}
                    {new Date(setting.updated_at).toLocaleDateString("hr-HR")}
                  </small>
                </div>
                <span className={styles.badge}>
                  {setting.is_public ? "public" : "internal"}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AdminShell>
  );
}
