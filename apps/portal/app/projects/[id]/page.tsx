import { Badge, Button, Card, Field, Textarea } from "@repo/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

import { submitFeedback } from "../../actions/feedback";
import { PortalShell } from "../../../components/portal-shell";
import { getPortalProject } from "../../../lib/portal-data";
import styles from "../../portal.module.css";

const badgeTone = {
  approved: "success",
  delivered: "cyan",
  in_progress: "violet",
  planned: "neutral",
  review: "warning",
} as const;

function formatDate(value: string | null) {
  if (!value) {
    return "To be confirmed";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string; error?: string; success?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const dashboard = await getPortalProject(id);

  if (!dashboard.project) {
    notFound();
  }

  const project = dashboard.project;
  const clientName = dashboard.profile.display_name || "Client";

  return (
    <PortalShell clientName={clientName} demo={dashboard.demo}>
      <main className={styles.page}>
        <Link href="/projects" className={styles.backLink}>
          ← All projects
        </Link>

        <header className={styles.projectHero}>
          <div>
            <p className={styles.eyebrow}>Active engagement</p>
            <h1>{project.engagement.title}</h1>
            <p>{project.engagement.summary}</p>
          </div>
          <div className={styles.dateBlock}>
            <span>Started</span>
            <strong>{formatDate(project.engagement.start_date)}</strong>
            <small>Target completion</small>
            <strong>{formatDate(project.engagement.target_end_date)}</strong>
          </div>
        </header>

        {query.success || query.demo ? (
          <p className={styles.noticeSuccess}>{query.success || query.demo}</p>
        ) : null}
        {query.error ? (
          <p className={styles.noticeError}>{query.error}</p>
        ) : null}

        <section className={styles.projectSection}>
          <h2>Project timeline</h2>
          <div className={styles.milestones}>
            {project.milestones.map((milestone) => (
              <article className={styles.milestone} key={milestone.id}>
                <Badge
                  tone={
                    milestone.status === "completed"
                      ? "success"
                      : milestone.status === "active"
                        ? "cyan"
                        : milestone.status === "delayed"
                          ? "warning"
                          : "neutral"
                  }
                  dot
                >
                  {milestone.status}
                </Badge>
                <h3>{milestone.title}</h3>
                <p>{milestone.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.projectSection}>
          <h2>Deliverables</h2>
          <div className={styles.deliverableGrid}>
            {project.deliverables.map((deliverable) => (
              <Card
                accent={deliverable.status === "review" ? "pink" : "violet"}
                description={deliverable.description}
                eyebrow={`Due ${formatDate(deliverable.due_at)}`}
                key={deliverable.id}
                title={deliverable.title}
              >
                <div className={styles.deliverableMeta}>
                  <Badge tone={badgeTone[deliverable.status]} dot>
                    {deliverable.status.replaceAll("_", " ")}
                  </Badge>
                  <small>
                    {deliverable.delivered_at
                      ? `Shared ${formatDate(deliverable.delivered_at)}`
                      : "In production"}
                  </small>
                </div>

                {deliverable.status === "review" ? (
                  <form action={submitFeedback} className={styles.feedbackForm}>
                    <input
                      type="hidden"
                      name="deliverableId"
                      value={deliverable.id}
                    />
                    <input
                      type="hidden"
                      name="engagementId"
                      value={project.engagement.id}
                    />
                    <Field
                      htmlFor={`feedback-${deliverable.id}`}
                      label="Your feedback"
                      hint="Your eMotion team will be notified immediately."
                    >
                      <Textarea
                        id={`feedback-${deliverable.id}`}
                        name="body"
                        minLength={1}
                        maxLength={5000}
                        placeholder="Share context, approve the work or request a change."
                        required
                      />
                    </Field>
                    <div className={styles.feedbackActions}>
                      <Button
                        type="submit"
                        name="decision"
                        value="approved"
                        size="small"
                      >
                        Approve
                      </Button>
                      <Button
                        type="submit"
                        name="decision"
                        value="changes_requested"
                        variant="secondary"
                        size="small"
                      >
                        Request changes
                      </Button>
                      <Button
                        type="submit"
                        name="decision"
                        value="comment"
                        variant="ghost"
                        size="small"
                      >
                        Comment only
                      </Button>
                    </div>
                  </form>
                ) : null}
              </Card>
            ))}
          </div>
        </section>

        <section className={styles.projectSection}>
          <h2>Feedback history</h2>
          <div className={styles.stack}>
            {project.feedback.length ? (
              project.feedback.map((feedback) => (
                <article className={styles.feedbackItem} key={feedback.id}>
                  <Badge
                    tone={
                      feedback.decision === "approved"
                        ? "success"
                        : feedback.decision === "changes_requested"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {feedback.decision.replaceAll("_", " ")}
                  </Badge>
                  <p>{feedback.body}</p>
                  <small>{formatDate(feedback.created_at)}</small>
                </article>
              ))
            ) : (
              <div className={styles.empty}>
                No feedback has been added yet.
              </div>
            )}
          </div>
        </section>
      </main>
    </PortalShell>
  );
}
