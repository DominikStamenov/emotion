import { AdminShell } from "../../components/admin-shell";
import { MediaUpload } from "../../components/media-upload";
import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import styles from "../workspace.module.css";

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default async function MediaPage() {
  const profile = await requireAdminProfile();
  const supabase = await createClient();
  const { data: assets } = await supabase
    .from("media_assets")
    .select(
      "id, filename, mime_type, size_bytes, width, height, alt_text, bucket, created_at",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(60);
  const totalSize = (assets || []).reduce(
    (total, asset) => total + asset.size_bytes,
    0,
  );
  const missingAlt = (assets || []).filter(
    (asset) => asset.mime_type.startsWith("image/") && !asset.alt_text,
  ).length;

  return (
    <AdminShell profile={profile}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Governed asset library</span>
          <h1>Mediji</h1>
          <p>
            Javne i privatne datoteke s alt tekstom, dimenzijama, pravima,
            fokusnom točkom i evidencijom korištenja.
          </p>
        </div>
        <span className={styles.secondary}>Upload operativan</span>
      </header>

      <section className={styles.stats}>
        <article>
          <span>Datoteke</span>
          <strong>{assets?.length || 0}</strong>
        </article>
        <article>
          <span>Ukupna veličina</span>
          <strong>{formatBytes(totalSize)}</strong>
        </article>
        <article>
          <span>Nedostaje alt</span>
          <strong>{missingAlt}</strong>
        </article>
        <article>
          <span>Storage zone</span>
          <strong>02</strong>
        </article>
      </section>

      <MediaUpload />

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Asset library</h2>
          <span>public-media / private-media</span>
        </div>
        {assets?.length ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Datoteka</th>
                <th>Tip</th>
                <th>Dimenzije</th>
                <th>Veličina</th>
                <th>Zona</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <strong>{asset.filename}</strong>
                    <small>
                      {asset.alt_text || "Alt tekst nije postavljen"}
                    </small>
                  </td>
                  <td>{asset.mime_type}</td>
                  <td>
                    {asset.width && asset.height
                      ? asset.width + " × " + asset.height
                      : "—"}
                  </td>
                  <td>{formatBytes(asset.size_bytes)}</td>
                  <td>
                    <span className={styles.badge}>{asset.bucket}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.empty}>
            Medijska biblioteka je prazna. Storage zone i RLS pravila su
            spremni.
          </div>
        )}
      </section>
    </AdminShell>
  );
}
