import { Badge } from "@repo/ui";
import Link from "next/link";

import { PortalShell } from "../../components/portal-shell";
import { getPortalDashboard } from "../../lib/portal-data";
import styles from "../portal.module.css";

export default async function ProjectsPage() {
  const dashboard = await getPortalDashboard();
  const clientName = dashboard.profile.display_name || "Client";

  return (
    <PortalShell clientName={clientName} demo={dashboard.demo}>
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Projects</p>
            <h1>Work in motion.</h1>
            <p className={styles.headerDescription}>
              Milestones, deliverables and every decision in one shared view.
            </p>
          </div>
          <Badge tone="cyan">{dashboard.projects.length} active</Badge>
        </header>

        <section className={`${styles.projectList} ${styles.projectSection}`}>
          {dashboard.projects.map((project) => (
            <Link
              className={styles.projectCard}
              href={`/projects/${project.engagement.id}`}
              key={project.engagement.id}
            >
              <div>
                <Badge tone="violet" dot>
                  {project.engagement.status.replaceAll("_", " ")}
                </Badge>
                <h3>{project.engagement.title}</h3>
                <p>{project.engagement.summary}</p>
              </div>
              <small>
                {project.deliverables.length} deliverables ·{" "}
                {project.files.length} files
              </small>
            </Link>
          ))}
        </section>
      </main>
    </PortalShell>
  );
}
