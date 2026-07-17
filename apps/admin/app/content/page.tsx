import Link from "next/link";

import { AdminShell } from "../../components/admin-shell";
import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import styles from "../workspace.module.css";

type ContentItem = {
  collection: string;
  id: string;
  kind: string;
  status: string;
  title: string;
  updatedAt: string;
};

export default async function ContentPage() {
  const profile = await requireAdminProfile();
  const supabase = await createClient();
  const [pages, services, projects, insights, testimonials] = await Promise.all(
    [
      supabase
        .from("pages")
        .select("id, title, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(20),
      supabase
        .from("services")
        .select("id, title, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(20),
      supabase
        .from("projects")
        .select("id, title, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(20),
      supabase
        .from("insights")
        .select("id, title, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(20),
      supabase
        .from("testimonials")
        .select("id, person_name, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(20),
    ],
  );
  const items: ContentItem[] = [
    ...(pages.data || []).map((item) => ({
      collection: "pages",
      id: item.id,
      kind: "Page",
      status: item.status,
      title: item.title,
      updatedAt: item.updated_at,
    })),
    ...(services.data || []).map((item) => ({
      collection: "services",
      id: item.id,
      kind: "Service",
      status: item.status,
      title: item.title,
      updatedAt: item.updated_at,
    })),
    ...(projects.data || []).map((item) => ({
      collection: "projects",
      id: item.id,
      kind: "Project",
      status: item.status,
      title: item.title,
      updatedAt: item.updated_at,
    })),
    ...(insights.data || []).map((item) => ({
      collection: "insights",
      id: item.id,
      kind: "Insight",
      status: item.status,
      title: item.title,
      updatedAt: item.updated_at,
    })),
    ...(testimonials.data || []).map((item) => ({
      collection: "testimonials",
      id: item.id,
      kind: "Testimonial",
      status: item.status,
      title: item.person_name,
      updatedAt: item.updated_at,
    })),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const published = items.filter((item) => item.status === "published").length;
  const drafts = items.filter((item) => item.status === "draft").length;

  return (
    <AdminShell profile={profile}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Custom CMS</span>
          <h1>Sadržaj</h1>
          <p>
            Stranice, usluge, radovi, uvidi i izjave s revizijama, statusima i
            kontroliranim objavljivanjem.
          </p>
        </div>
        <Link className={styles.primary} href="/content/new">
          Novi zapis +
        </Link>
      </header>

      <section className={styles.stats}>
        <article>
          <span>Ukupno zapisa</span>
          <strong>{items.length}</strong>
        </article>
        <article>
          <span>Objavljeno</span>
          <strong>{published}</strong>
        </article>
        <article>
          <span>Skice</span>
          <strong>{drafts}</strong>
        </article>
        <article>
          <span>Tipovi sadržaja</span>
          <strong>05</strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Posljednje uređivano</h2>
          <span>{items.length} zapisa</span>
        </div>
        {items.length ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Naziv</th>
                <th>Vrsta</th>
                <th>Status</th>
                <th>Zadnja promjena</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.kind + "-" + item.id}>
                  <td>
                    <strong>
                      <Link href={`/content/${item.collection}/${item.id}`}>
                        {item.title}
                      </Link>
                    </strong>
                    <small>{item.id.slice(0, 8)}</small>
                  </td>
                  <td>{item.kind}</td>
                  <td>
                    <span className={styles.badge}>{item.status}</span>
                  </td>
                  <td>
                    {new Date(item.updatedAt).toLocaleDateString("hr-HR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.empty}>
            Još nema CMS zapisa. Kreiraj prvi sadržaj kao skicu.
          </div>
        )}
      </section>
    </AdminShell>
  );
}
