"use client";

import { useState, type FormEvent } from "react";

import { publicContactEmail } from "../lib/site";
import styles from "./contact-form.module.css";

const serviceOptions = [
  "Strategy & branding",
  "Web design",
  "Development",
  "Motion & 3D",
  "AI & automation",
  "Growth & optimization",
] as const;

type SubmissionState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "success"; requestId: string }
  | { kind: "error"; message: string };

function getAttribution() {
  const params = new URLSearchParams(window.location.search);

  return {
    landingPage: window.location.pathname + window.location.search,
    referrer: document.referrer,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmContent: params.get("utm_content") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmSource: params.get("utm_source") || undefined,
    utmTerm: params.get("utm_term") || undefined,
  };
}

export function ContactForm() {
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: "pending" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      attribution: getAttribution(),
      budgetRange: formData.get("budgetRange"),
      company: formData.get("company"),
      consent: formData.get("consent") === "on",
      conversationId:
        new URLSearchParams(window.location.search).get("conversation") ||
        undefined,
      email: formData.get("email"),
      marketingConsent: formData.get("marketingConsent") === "on",
      message: formData.get("message"),
      name: formData.get("name"),
      requestedServices: formData.getAll("requestedServices"),
      timeframe: formData.get("timeframe"),
      website: formData.get("website"),
    };

    try {
      const response = await fetch("/api/contact", {
        body: JSON.stringify(payload),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as {
        error?: string;
        requestId?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "The brief could not be sent.");
      }

      form.reset();
      setState({
        kind: "success",
        requestId: result.requestId || "received",
      });
    } catch (error) {
      setState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "The brief could not be sent.",
      });
    }
  }

  if (state.kind === "success") {
    return (
      <div className={styles.success} role="status">
        <span>Brief received</span>
        <h2>Thank you. The conversation has started.</h2>
        <p>
          Your context is safely in our workspace. We will review it and reply
          to the e-mail address you provided.
        </p>
        <small>Reference · {state.requestId.slice(0, 8)}</small>
        <button type="button" onClick={() => setState({ kind: "idle" })}>
          Send another brief
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label>
          <span>Your name *</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={160}
            required
          />
        </label>
        <label>
          <span>Work e-mail *</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={320}
            required
          />
        </label>
      </div>

      <label>
        <span>Company or project</span>
        <input
          name="company"
          type="text"
          autoComplete="organization"
          maxLength={160}
        />
      </label>

      <fieldset>
        <legend>What can we help you create?</legend>
        <div className={styles.options}>
          {serviceOptions.map((service) => (
            <label key={service} className={styles.option}>
              <input type="checkbox" name="requestedServices" value={service} />
              <span>{service}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.row}>
        <label>
          <span>Investment range</span>
          <select name="budgetRange" defaultValue="">
            <option value="">Select a range</option>
            <option value="€10k–€25k">€10k–€25k</option>
            <option value="€25k–€50k">€25k–€50k</option>
            <option value="€50k–€100k">€50k–€100k</option>
            <option value="€100k+">€100k+</option>
            <option value="Not defined">Not defined yet</option>
          </select>
        </label>
        <label>
          <span>Ideal timing</span>
          <select name="timeframe" defaultValue="">
            <option value="">Select timing</option>
            <option value="As soon as possible">As soon as possible</option>
            <option value="1–3 months">1–3 months</option>
            <option value="3–6 months">3–6 months</option>
            <option value="6+ months">6+ months</option>
            <option value="Exploring">Just exploring</option>
          </select>
        </label>
      </div>

      <label>
        <span>Tell us about the ambition, challenge and context *</span>
        <textarea name="message" minLength={20} maxLength={5000} required />
      </label>

      <label className={styles.honeypot} aria-hidden="true">
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <div className={styles.consent}>
        <label>
          <input type="checkbox" name="consent" required />
          <span>
            I agree that eMotion may process these details to respond to my
            inquiry. *
          </span>
        </label>
        <label>
          <input type="checkbox" name="marketingConsent" />
          <span>
            I would also like to receive occasional relevant eMotion updates.
          </span>
        </label>
      </div>

      {state.kind === "error" ? (
        <p className={styles.error} role="alert">
          {state.message}
          {publicContactEmail ? (
            <>
              {" "}
              You can also write to{" "}
              <a href={"mailto:" + publicContactEmail}>{publicContactEmail}</a>.
            </>
          ) : (
            " Please try again shortly."
          )}
        </p>
      ) : null}

      <button
        className={styles.submit}
        type="submit"
        disabled={state.kind === "pending"}
      >
        <span>
          {state.kind === "pending" ? "Sending…" : "Send project brief"}
        </span>
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
