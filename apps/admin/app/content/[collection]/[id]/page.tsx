import { CONTENT_STATUSES } from "@repo/domain";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "../../../../components/admin-shell";
import { requireAdminProfile } from "../../../../lib/auth";
import { getEditorItem, type Collection } from "../../../../lib/content-editor";
import { createClient } from "../../../../lib/supabase/server";
import { updateContent } from "../../../actions/content";
import styles from "../../../workspace.module.css";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const profile = await requireAdminProfile();
  const { collection: rawCollection, id } = await params;
  const allowed: Collection[] = [
    "insights",
    "pages",
    "projects",
    "services",
    "testimonials",
  ];

  if (!allowed.includes(rawCollection as Collection)) notFound();
  const collection = rawCollection as Collection;
  const item = await getEditorItem(collection, id);
  if (!item) notFound();
  const supabase = await createClient();
  const { count: revisions } = await supabase
    .from("content_revisions")
    .select("id", { count: "exact", head: true })
    .eq("entity_type", collection)
    .eq("entity_id", id);
  const canVerify = profile.role === "owner" || profile.role === "admin";
  const previewPath =
    collection === "pages"
      ? "/" + item.slug
      : collection === "projects"
        ? "/work/" + item.slug
        : collection === "testimonials"
          ? null
          : "/" + collection + "/" + item.slug;

  return (
    <AdminShell profile={profile}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            {collection} · {revisions || 0} prethodnih verzija
          </span>
          <h1>{item.title}</h1>
          <p>
            Uredi, zakaži ili objavi. Svako spremanje automatski čuva prethodno
            stanje u revizijama.
          </p>
        </div>
        <div>
          <Link
            className={styles.secondary}
            href={"/content/" + collection + "/" + item.id + "/preview"}
          >
            Pregled
          </Link>{" "}
          {previewPath && item.status === "published" ? (
            <a
              className={styles.secondary}
              href={previewPath}
              target="_blank"
              rel="noreferrer"
            >
              Otvori javno ↗
            </a>
          ) : null}{" "}
          <Link className={styles.secondary} href="/content">
            Natrag
          </Link>
        </div>
      </header>

      <section className={styles.panel}>
        <form action={updateContent} className={styles.form}>
          <input type="hidden" name="collection" value={collection} />
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="locale" value={item.locale} />
          <label>
            Naslov
            <input
              name="title"
              defaultValue={item.title}
              minLength={2}
              maxLength={200}
              required
            />
          </label>
          <label>
            Slug
            <input
              name="slug"
              defaultValue={item.slug}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              readOnly={collection === "testimonials"}
              required
            />
          </label>
          <label>
            Sažetak / citat
            <textarea
              name="summary"
              defaultValue={item.summary}
              minLength={2}
              maxLength={4000}
              required
            />
          </label>
          {collection !== "testimonials" ? (
            <label>
              Glavni sadržaj
              <textarea
                name="body"
                defaultValue={item.body}
                maxLength={30000}
              />
            </label>
          ) : null}
          <label>
            Status
            <select name="status" defaultValue={item.status}>
              {CONTENT_STATUSES.map((status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Vrijeme zakazane objave
            <input
              type="datetime-local"
              name="publishAt"
              defaultValue={
                item.status === "scheduled" && item.publishedAt
                  ? item.publishedAt.slice(0, 16)
                  : ""
              }
            />
          </label>
          {collection === "projects" || collection === "testimonials" ? (
            <label>
              <span>
                <input
                  type="checkbox"
                  name="verified"
                  defaultChecked={item.verified}
                  disabled={!canVerify}
                />{" "}
                Provjeren javni navod
              </span>
            </label>
          ) : null}
          <button type="submit">Spremi promjene</button>
        </form>
      </section>
    </AdminShell>
  );
}
