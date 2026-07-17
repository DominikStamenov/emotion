import { AdminShell } from "../../components/admin-shell";
import { AiCopilot } from "../../components/ai-copilot";
import { requireAdminProfile } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import { rebuildPublicKnowledge } from "../actions/ai";
import styles from "../workspace.module.css";

export default async function AiPage() {
  const profile = await requireAdminProfile();
  const supabase = await createClient();
  const [
    { data: conversations },
    { count: knowledge },
    { count: feedback },
    { data: prompts },
  ] = await Promise.all([
    supabase
      .from("ai_conversations")
      .select("id, channel, status, summary, last_message_at, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("knowledge_documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("ai_feedback").select("id", { count: "exact", head: true }),
    supabase
      .from("prompt_versions")
      .select("id, prompt_key, version, active")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);
  const handoffs = (conversations || []).filter(
    (conversation) => conversation.status === "handoff_requested",
  ).length;

  return (
    <AdminShell profile={profile}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Grounded intelligence</span>
          <h1>AI centar</h1>
          <p>
            Odobreno znanje, razgovori, prompt verzije, sigurnosni signali,
            trošak i ljudsko preuzimanje bez pristupa privatnim podacima iz
            javnog chata.
          </p>
        </div>
        <form action={rebuildPublicKnowledge}>
          <button className={styles.primary} type="submit">
            Obnovi javno znanje
          </button>
        </form>
      </header>

      <AiCopilot />

      <section className={styles.stats}>
        <article>
          <span>Razgovori</span>
          <strong>{conversations?.length || 0}</strong>
        </article>
        <article>
          <span>Handoff čeka</span>
          <strong>{handoffs}</strong>
        </article>
        <article>
          <span>Knowledge docs</span>
          <strong>{knowledge || 0}</strong>
        </article>
        <article>
          <span>Feedback</span>
          <strong>{feedback || 0}</strong>
        </article>
      </section>

      <section className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Posljednji razgovori</h2>
            <span>public concierge</span>
          </div>
          <div className={styles.cards}>
            {conversations?.length ? (
              conversations.map((conversation) => (
                <div className={styles.card} key={conversation.id}>
                  <div>
                    <strong>
                      {conversation.summary ||
                        "Razgovor " + conversation.id.slice(0, 8)}
                    </strong>
                    <small>
                      {conversation.channel} ·{" "}
                      {new Date(conversation.created_at).toLocaleString(
                        "hr-HR",
                      )}
                    </small>
                  </div>
                  <span className={styles.badge}>{conversation.status}</span>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Još nema AI razgovora.</div>
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Prompt registry</h2>
            <span>version controlled</span>
          </div>
          <div className={styles.cards}>
            {prompts?.length ? (
              prompts.map((prompt) => (
                <div className={styles.card} key={prompt.id}>
                  <div>
                    <strong>{prompt.prompt_key}</strong>
                    <small>verzija {prompt.version}</small>
                  </div>
                  <span className={styles.badge}>
                    {prompt.active ? "active" : "inactive"}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.empty}>
                Runtime koristi ugrađeni sigurni v1 prompt; registry čeka prvu
                odobrenu administrativnu verziju.
              </div>
            )}
          </div>
        </article>
      </section>
    </AdminShell>
  );
}
