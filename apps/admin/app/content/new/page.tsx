import Link from "next/link";

import { AdminShell } from "../../../components/admin-shell";
import { requireAdminProfile } from "../../../lib/auth";
import { createContent } from "../../actions/content";
import styles from "../../workspace.module.css";

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireAdminProfile();
  const params = await searchParams;

  return (
    <AdminShell profile={profile}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Custom CMS · Draft first</span>
          <h1>Novi sadržaj</h1>
          <p>
            Svaki zapis počinje kao skica. Objavljivanje i povrat prethodne
            verzije ostaju kontrolirane radnje.
          </p>
        </div>
        <Link className={styles.secondary} href="/content">
          Natrag
        </Link>
      </header>

      <section className={styles.panel}>
        <form action={createContent} className={styles.form}>
          {params.error ? <p>{params.error}</p> : null}
          <label>
            Vrsta sadržaja
            <select name="collection" defaultValue="pages">
              <option value="pages">Stranica</option>
              <option value="services">Usluga</option>
              <option value="projects">Projekt</option>
              <option value="insights">Insight</option>
              <option value="testimonials">Testimonial</option>
            </select>
          </label>
          <label>
            Naslov / ime osobe
            <input name="title" minLength={2} maxLength={200} required />
          </label>
          <label>
            Slug
            <input
              name="slug"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder="npr-digital-product"
              required
            />
          </label>
          <label>
            Sažetak / citat
            <textarea name="summary" minLength={2} maxLength={4000} required />
          </label>
          <input type="hidden" name="locale" value="en" />
          <button type="submit">Spremi skicu</button>
        </form>
      </section>
    </AdminShell>
  );
}
