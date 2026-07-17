import { Badge } from "@repo/ui";
import Link from "next/link";

import { PortalShell } from "../components/portal-shell";
import { getPortalDashboard } from "../lib/portal-data";
import styles from "./portal.module.css";

function projectProgress(statuses: string[]) {
  if (statuses.length === 0) {
    return 0;
  }

  const completed = statuses.filter((status) =>
    ["approved", "delivered"].includes(status),
  ).length;

  return Math.round((completed / statuses.length) * 100);
}

export default async function PortalDashboardPage() {
  const dashboard = await getPortalDashboard();
  const clientName = dashboard.profile.display_name || "Client";
  const activeDeliverables = dashboard.projects.flatMap(
    (project) => project.deliverables,
  );
  const reviewCount = activeDeliverables.filter(
    (item) => item.status === "review",
  ).length;

  return (
    <PortalShell clientName={clientName} demo={dashboard.demo}>
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>eMotion Client Portal</p>
            <h1>Good to see you, {clientName}.</h1>
            <p className={styles.headerDescription}>
              Everything your team needs to follow progress, review work and
              keep decisions moving.
            </p>
          </div>
          <Badge tone={dashboard.demo ? "violet" : "success"} dot>
            {dashboard.demo ? "Investor demo" : "Live workspace"}
          </Badge>
        </header>

        <section className={styles.metrics} aria-label="Project overview">
          <div className={styles.metric}>
            <span>Active projects</span>
            <strong>{dashboard.projects.length}</strong>
          </div>
          <div className={styles.metric}>
            <span>In review</span>
            <strong>{reviewCount}</strong>
          </div>
          <div className={styles.metric}>
            <span>Approved</span>
            <strong>
              {
                activeDeliverables.filter((item) => item.status === "approved")
                  .length
              }
            </strong>
          </div>
          <div className={styles.metric}>
            <span>Unread updates</span>
            <strong>
              {dashboard.notifications.filter((item) => !item.read_at).length}
            </strong>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <section>
            <div className={styles.sectionHeader}>
              <h2>Your projects</h2>
              <Link href="/projects">View all ↗</Link>
            </div>
            <div className={styles.projectList}>
              {dashboard.projects.length ? (
                dashboard.projects.map((project) => {
                  const progress = projectProgress(
                    project.deliverables.map((item) => item.status),
                  );

                  return (
                    <Link
                      className={styles.projectCard}
                      href={`/projects/${project.engagement.id}`}
                      key={project.engagement.id}
                    >
                      <div>
                        <Badge tone="cyan" dot>
                          {project.engagement.status.replaceAll("_", " ")}
                        </Badge>
                        <h3>{project.engagement.title}</h3>
                        <p>{project.engagement.summary}</p>
                      </div>
                      <div className={styles.progressRow}>
                        <div className={styles.progressTrack}>
                          <span style={{ width: `${progress}%` }} />
                        </div>
                        <small>{progress}%</small>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className={styles.empty}>
                  Your invitation is active. Projects will appear here as soon
                  as the eMotion team connects an engagement.
                </div>
              )}
            </div>
          </section>

          <aside>
            <div className={styles.sectionHeader}>
              <h2>Latest updates</h2>
            </div>
            <div className={styles.notificationList}>
              {dashboard.notifications.map((notification) => (
                <Link
                  href={notification.href || "/"}
                  className={`${styles.notification} ${
                    notification.read_at ? "" : styles.notificationUnread
                  }`}
                  key={notification.id}
                >
                  <strong>{notification.title}</strong>
                  {notification.body ? <p>{notification.body}</p> : null}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </PortalShell>
  );
}
