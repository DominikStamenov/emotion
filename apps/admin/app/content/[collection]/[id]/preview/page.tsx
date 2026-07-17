import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminShell } from "../../../../../components/admin-shell";
import { requireAdminProfile } from "../../../../../lib/auth";
import {
  getEditorItem,
  type Collection,
} from "../../../../../lib/content-editor";
import styles from "../../../../workspace.module.css";

export default async function ContentPreviewPage({
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
  const item = await getEditorItem(rawCollection as Collection, id);
  if (!item) notFound();

  return (
    <AdminShell profile={profile}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Zaštićeni CMS preview</span>
          <h1>Pregled</h1>
          <p>Ovo nije javna ruta i ne mijenja status sadržaja.</p>
        </div>
        <Link
          className={styles.secondary}
          href={"/content/" + rawCollection + "/" + id}
        >
          Natrag u editor
        </Link>
      </header>
      <article className={styles.preview}>
        <span>{rawCollection}</span>
        <h2>{item.title}</h2>
        <p className={styles.previewLead}>{item.summary}</p>
        {item.body ? <p className={styles.previewBody}>{item.body}</p> : null}
      </article>
    </AdminShell>
  );
}
