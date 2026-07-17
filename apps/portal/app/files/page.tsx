import { Badge, Button } from "@repo/ui";

import { PortalShell } from "../../components/portal-shell";
import { getPortalDashboard } from "../../lib/portal-data";
import styles from "../portal.module.css";

export default async function FilesPage() {
  const dashboard = await getPortalDashboard();
  const clientName = dashboard.profile.display_name || "Client";
  const files = dashboard.projects.flatMap((project) =>
    project.files.map((file) => ({ file, project: project.engagement })),
  );

  return (
    <PortalShell clientName={clientName} demo={dashboard.demo}>
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Files</p>
            <h1>Everything shared, always in context.</h1>
          </div>
          <Badge tone="violet">{files.length} files</Badge>
        </header>

        <section className={styles.projectSection}>
          {files.length ? (
            files.map(({ file, project }) => (
              <article className={styles.fileRow} key={file.id}>
                <div className={styles.fileActions}>
                  <strong>
                    {file.label || file.asset?.filename || "File"}
                  </strong>
                  <small>{project.title}</small>
                </div>
                <div>
                  <Badge tone="cyan">
                    {file.asset?.mime_type || "private"}
                  </Badge>
                  {file.downloadUrl ? (
                    <Button
                      href={file.downloadUrl}
                      rel="noreferrer"
                      size="small"
                    >
                      Download
                    </Button>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className={styles.empty}>
              Shared files will appear here with their project and deliverable
              context.
            </div>
          )}
        </section>
      </main>
    </PortalShell>
  );
}
