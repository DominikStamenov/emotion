"use client";

import { type FormEvent, useState } from "react";

import styles from "../app/workspace.module.css";

type CopilotResponse = {
  conversationId?: string;
  error?: string;
  message?: string;
  sources?: { id: string; index: number; title: string }[];
};

export function AiCopilot() {
  const [conversationId, setConversationId] = useState<string>();
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<CopilotResponse["sources"]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/ai/copilot", {
        body: JSON.stringify({
          conversationId,
          message: form.get("message"),
          task: form.get("task"),
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as CopilotResponse;
      if (!response.ok || !payload.message) {
        throw new Error(payload.error || "Copilot request failed.");
      }
      setAnswer(payload.message);
      setSources(payload.sources || []);
      setConversationId(payload.conversationId);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Copilot request failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.copilot}>
      <div>
        <span className={styles.eyebrow}>Private copilot</span>
        <h2>Ask, summarize or prepare a reviewed draft.</h2>
        <p>
          Uses only approved knowledge and the CRM scope permitted by your role.
          It never sends or changes anything on its own.
        </p>
        <form onSubmit={submit}>
          <select name="task" defaultValue="ask" aria-label="Copilot task">
            <option value="ask">Answer a question</option>
            <option value="summarize">Summarize context</option>
            <option value="draft_follow_up">Draft a follow-up</option>
            <option value="draft_proposal">Draft proposal structure</option>
          </select>
          <textarea
            name="message"
            minLength={2}
            maxLength={2000}
            placeholder="What should the team understand or prepare?"
            required
          />
          <button type="submit" disabled={busy}>
            {busy ? "Preparing…" : "Ask copilot"}
          </button>
        </form>
      </div>
      <div className={styles.copilotAnswer} aria-live="polite">
        {error ? <p>{error}</p> : null}
        {answer ? (
          <>
            <span>Human review required</span>
            <p>{answer}</p>
            {sources?.length ? (
              <small>
                Sources: {sources.map((source) => source.title).join(", ")}
              </small>
            ) : null}
          </>
        ) : (
          <p>Copilot output and approved sources will appear here.</p>
        )}
      </div>
    </section>
  );
}
