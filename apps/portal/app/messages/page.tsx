import { Badge } from "@repo/ui";

import { PortalShell } from "../../components/portal-shell";
import { getPortalDashboard } from "../../lib/portal-data";
import styles from "../portal.module.css";

export default async function MessagesPage() {
  const dashboard = await getPortalDashboard();
  const clientName = dashboard.profile.display_name || "Client";
  const feedback = dashboard.projects
    .flatMap((project) =>
      project.feedback.map((item) => ({ item, project: project.engagement })),
    )
    .sort(
      (left, right) =>
        new Date(right.item.created_at).getTime() -
        new Date(left.item.created_at).getTime(),
    );

  return (
    <PortalShell clientName={clientName} demo={dashboard.demo}>
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Feedback</p>
            <h1>Decisions with a clear history.</h1>
          </div>
          <Badge tone="pink">{feedback.length} updates</Badge>
        </header>

        <section className={`${styles.stack} ${styles.projectSection}`}>
          {feedback.map(({ item, project }) => (
            <article className={styles.feedbackItem} key={item.id}>
              <Badge tone={item.decision === "approved" ? "success" : "violet"}>
                {item.decision.replaceAll("_", " ")}
              </Badge>
              <p>{item.body}</p>
              <small>{project.title}</small>
            </article>
          ))}
        </section>
      </main>
    </PortalShell>
  );
}
