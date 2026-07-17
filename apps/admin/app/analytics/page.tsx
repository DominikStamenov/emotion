import { AdminShell } from "../../components/admin-shell";
import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import workspace from "../workspace.module.css";
import styles from "./analytics.module.css";

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default async function AnalyticsPage() {
  const profile = await requireAdminProfile();
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const [
    { data: events },
    { data: inquiries },
    { data: opportunities },
    { count: aiConversations },
    { data: emailDeliveries },
  ] = await Promise.all([
    supabase
      .from("web_events")
      .select("event_name, occurred_at, attribution")
      .gte("occurred_at", since.toISOString())
      .order("occurred_at"),
    supabase
      .from("inquiries")
      .select("id, status, source, attribution, created_at")
      .gte("created_at", since.toISOString()),
    supabase
      .from("opportunities")
      .select("id, stage, estimated_value, probability, created_at")
      .gte("created_at", since.toISOString()),
    supabase
      .from("ai_conversations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since.toISOString()),
    supabase
      .from("email_deliveries")
      .select("status, created_at")
      .gte("created_at", since.toISOString()),
  ]);

  const pageViews = (events || []).filter(
    (event) => event.event_name === "page_view",
  ).length;
  const inquiryCount = inquiries?.length || 0;
  const qualified = (inquiries || []).filter((item) =>
    ["qualified", "closed"].includes(item.status),
  ).length;
  const won = (opportunities || []).filter(
    (item) => item.stage === "won",
  ).length;
  const conversionRate = pageViews ? (inquiryCount / pageViews) * 100 : 0;
  const weightedPipeline = (opportunities || []).reduce(
    (sum, item) => sum + (item.estimated_value || 0) * (item.probability / 100),
    0,
  );
  const deliveredEmail = (emailDeliveries || []).filter((item) =>
    ["sent", "delivered"].includes(item.status),
  ).length;

  const days = Array.from({ length: 30 }, (_, index) => {
    const date = startOfDay(new Date(since));
    date.setDate(date.getDate() + index);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const count = (events || []).filter((event) => {
      const occurred = new Date(event.occurred_at);
      return occurred >= date && occurred < next;
    }).length;
    return { count, date };
  });
  const maxDaily = Math.max(1, ...days.map((day) => day.count));

  const sources = new Map<string, number>();
  for (const inquiry of inquiries || []) {
    const attribution = inquiry.attribution as { utmSource?: string } | null;
    const source = attribution?.utmSource || inquiry.source || "direct";
    sources.set(source, (sources.get(source) || 0) + 1);
  }
  const sourceRows = [...sources.entries()].sort((a, b) => b[1] - a[1]);
  const maxSource = Math.max(1, ...sourceRows.map((item) => item[1]));
  const funnel = [
    ["Visits", pageViews],
    ["Inquiries", inquiryCount],
    ["Qualified", qualified],
    ["Won", won],
  ] as const;
  const maxFunnel = Math.max(1, pageViews);

  return (
    <AdminShell profile={profile}>
      <header className={workspace.header}>
        <div>
          <span className={workspace.eyebrow}>Last 30 days</span>
          <h1>Analytics</h1>
          <p>
            Prvi posjet, upit, AI razgovor, pipeline i isporuka promatraju se
            kao jedan povezani put do klijentskog odnosa.
          </p>
        </div>
      </header>

      <section className={workspace.stats}>
        <article>
          <span>Page views</span>
          <strong>{pageViews.toLocaleString("hr-HR")}</strong>
        </article>
        <article>
          <span>Visit → inquiry</span>
          <strong>{conversionRate.toFixed(1)}%</strong>
        </article>
        <article>
          <span>Weighted pipeline</span>
          <strong>€{weightedPipeline.toLocaleString("hr-HR")}</strong>
        </article>
        <article>
          <span>AI / email</span>
          <strong>
            {aiConversations || 0} / {deliveredEmail}
          </strong>
        </article>
      </section>

      <section className={workspace.grid}>
        <article className={workspace.panel}>
          <div className={workspace.panelHeader}>
            <h2>Traffic activity</h2>
            <span>daily first-party events</span>
          </div>
          <div className={styles.dailyChart} aria-label="Daily event volume">
            {days.map((day) => (
              <i
                className={styles.day}
                data-label={`${day.date.toLocaleDateString("hr-HR")}: ${day.count}`}
                key={day.date.toISOString()}
                style={{
                  height: `${Math.max(3, (day.count / maxDaily) * 100)}%`,
                }}
              />
            ))}
          </div>
        </article>

        <article className={workspace.panel}>
          <div className={workspace.panelHeader}>
            <h2>Conversion funnel</h2>
            <span>visits to won</span>
          </div>
          <div className={styles.funnel}>
            {funnel.map(([label, value]) => (
              <div className={styles.funnelRow} key={label}>
                <span>{label}</span>
                <div className={styles.track}>
                  <i
                    style={{
                      width: `${Math.max(2, (value / maxFunnel) * 100)}%`,
                    }}
                  />
                </div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={workspace.panel}>
        <div className={workspace.panelHeader}>
          <h2>Inquiry sources</h2>
          <span>attributed where available</span>
        </div>
        <div className={styles.sourceList}>
          {sourceRows.length ? (
            sourceRows.map(([source, count]) => (
              <div className={styles.source} key={source}>
                <div>
                  <strong>{source}</strong>
                  <div>
                    <i style={{ width: `${(count / maxSource) * 100}%` }} />
                  </div>
                </div>
                <span>{count}</span>
              </div>
            ))
          ) : (
            <div className={workspace.empty}>Još nema atribuiranih upita.</div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
