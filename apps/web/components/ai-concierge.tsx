"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import styles from "./ai-concierge.module.css";

type Message = {
  content: string;
  id: string;
  role: "assistant" | "user";
  sources?: { id: string; index: number; title: string }[];
};

const welcome: Message = {
  content:
    "Ask me about eMotion’s services, process or how to start a project. I answer from approved public information only.",
  id: "welcome",
  role: "assistant",
};

export function AiConcierge() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([welcome]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const message = String(formData.get("message") || "").trim();

    if (message.length < 2 || pending) {
      return;
    }

    const userMessage: Message = {
      content: message,
      id: crypto.randomUUID(),
      role: "user",
    };
    setMessages((current) => [...current, userMessage]);
    setPending(true);
    form.reset();

    try {
      const response = await fetch("/api/ai/chat", {
        body: JSON.stringify({ conversationId, message }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as {
        conversationId?: string;
        error?: string;
        message?: string;
        sources?: Message["sources"];
      };

      if (!response.ok || !data.message) {
        throw new Error(data.error || "The concierge could not answer.");
      }

      setConversationId(data.conversationId);
      setMessages((current) => [
        ...current,
        {
          content: data.message || "",
          id: crypto.randomUUID(),
          role: "assistant",
          sources: data.sources,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          content:
            error instanceof Error
              ? error.message
              : "The concierge is temporarily unavailable.",
          id: crypto.randomUUID(),
          role: "assistant",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.root}>
      {open ? (
        <section
          className={styles.panel}
          role="dialog"
          aria-label="eMotion AI concierge"
        >
          <header className={styles.header}>
            <div>
              <span className={styles.status} />
              <div>
                <strong>eMotion concierge</strong>
                <small>Approved public knowledge</small>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close concierge"
            >
              ×
            </button>
          </header>

          <div className={styles.messages} aria-live="polite">
            {messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === "user" ? styles.userMessage : styles.message
                }
              >
                <p>{message.content}</p>
                {message.sources?.length ? (
                  <details>
                    <summary>Sources</summary>
                    <ol>
                      {message.sources.map((source) => (
                        <li key={source.id}>
                          [{source.index}] {source.title}
                        </li>
                      ))}
                    </ol>
                  </details>
                ) : null}
              </article>
            ))}
            {pending ? (
              <div className={styles.thinking} aria-label="Preparing answer">
                <span />
                <span />
                <span />
              </div>
            ) : null}
          </div>

          <div className={styles.handoff}>
            Ready to talk to a person?{" "}
            <Link
              href={
                conversationId
                  ? `/contact?conversation=${conversationId}`
                  : "/contact"
              }
            >
              Start a brief →
            </Link>
          </div>

          <form onSubmit={sendMessage} className={styles.form}>
            <label className={styles.visuallyHidden} htmlFor="ai-message">
              Ask eMotion
            </label>
            <input
              id="ai-message"
              name="message"
              placeholder="Ask about eMotion…"
              maxLength={1200}
              autoComplete="off"
              required
            />
            <button type="submit" disabled={pending} aria-label="Send message">
              ↑
            </button>
          </form>
          <p className={styles.notice}>
            AI can make mistakes. Don&apos;t share confidential information.
          </p>
        </section>
      ) : null}

      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className={styles.spark}>✦</span>
        <span>Ask eMotion</span>
      </button>
    </div>
  );
}
