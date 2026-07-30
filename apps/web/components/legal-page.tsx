import type { Json } from "@repo/database";

import { Container } from "./container";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import styles from "./legal-page.module.css";
import { createPublicClient } from "../lib/supabase/public";

type LegalSection = { body: string; title: string };

const fallbackContent: Record<
  "cookies" | "privacy" | "terms",
  { intro: string; sections: LegalSection[]; title: string }
> = {
  privacy: {
    intro:
      "This pre-launch privacy notice explains how eMotion intends to handle information submitted through this website. Final controller details and legal review are required before production launch.",
    sections: [
      {
        title: "Information we collect",
        body: "We process information you choose to submit in a project brief or AI handoff, including contact details, company context, requested services and your message. We also keep limited security and attribution data in pseudonymized form.",
      },
      {
        title: "Why we use it",
        body: "We use inquiry data to respond, qualify a potential engagement, maintain the related conversation and protect the service from abuse. Marketing messages require a separate optional consent.",
      },
      {
        title: "AI concierge",
        body: "Public AI questions and responses may be stored with safety and performance metadata. The public concierge is restricted to approved public knowledge and does not receive private CRM content.",
      },
      {
        title: "Retention and sharing",
        body: "Data is retained only as long as needed for the inquiry, legal obligations and legitimate business records. Infrastructure, e-mail and AI providers process only the data required to deliver their service under appropriate agreements.",
      },
      {
        title: "Your rights",
        body: "Depending on applicable law, you may request access, correction, deletion, restriction, portability or withdrawal of consent through the project contact form.",
      },
    ],
    title: "Privacy notice",
  },
  cookies: {
    intro:
      "This pre-launch notice describes the storage used by this website. A production consent configuration will be finalized with the analytics stack.",
    sections: [
      {
        title: "Necessary storage",
        body: "The website may use strictly necessary session storage for security, contact-form abuse prevention and continuity of an AI conversation. These functions do not create advertising profiles.",
      },
      {
        title: "AI session",
        body: "If you use the concierge, an HTTP-only session identifier can be kept for up to 30 days so the service can securely associate your own conversation and handoff.",
      },
      {
        title: "Analytics",
        body: "Non-essential analytics must remain disabled until a consent mechanism and final vendor list are configured. Consent choices will be stored and can be changed.",
      },
      {
        title: "Control",
        body: "You can remove browser storage through your browser settings. Blocking necessary storage may prevent some interactive functions from working.",
      },
    ],
    title: "Cookie notice",
  },
  terms: {
    intro:
      "These pre-launch website terms describe general use of this website. Final company identification, governing law and legal review are required before launch.",
    sections: [
      {
        title: "Website use",
        body: "You may use this site to learn about eMotion and start a project conversation. You must not attempt to disrupt, probe, automate abuse of or gain unauthorized access to the service.",
      },
      {
        title: "Project inquiries",
        body: "Submitting a brief does not create a client relationship, confidentiality obligation, quote or commitment to perform work. A relationship begins only through a separately accepted agreement.",
      },
      {
        title: "Intellectual property",
        body: "Unless stated otherwise, the eMotion identity, interface, text, motion and original website materials are protected. Temporary portfolio concepts and placeholders are not presented as verified client claims.",
      },
      {
        title: "AI information",
        body: "AI concierge responses are informational and may contain errors. Do not rely on them as a binding scope, price, legal statement or professional advice.",
      },
      {
        title: "Contact",
        body: "Questions about these terms can be sent through the project contact form.",
      },
    ],
    title: "Website terms",
  },
};

function parseSections(content: Json): LegalSection[] | null {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return null;
  }

  const sections = content.sections;

  if (!Array.isArray(sections)) {
    return null;
  }

  const parsed = sections.flatMap((section) => {
    if (!section || typeof section !== "object" || Array.isArray(section)) {
      return [];
    }

    return typeof section.title === "string" && typeof section.body === "string"
      ? [{ body: section.body, title: section.title }]
      : [];
  });

  return parsed.length ? parsed : null;
}

export async function LegalPage({
  documentType,
}: {
  documentType: "cookies" | "privacy" | "terms";
}) {
  const fallback = fallbackContent[documentType];
  const supabase = createPublicClient();
  const { data } = supabase
    ? await supabase
        .from("legal_documents")
        .select("title, content, effective_at, version")
        .eq("document_type", documentType)
        .eq("locale", "en")
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };
  const sections = data
    ? parseSections(data.content) || fallback.sections
    : fallback.sections;

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <Container>
          <header className={styles.hero}>
            <p>
              {data ? "Effective legal document" : "Pre-launch legal draft"}
            </p>
            <h1>{data?.title || fallback.title}</h1>
            <div>
              <span>
                {data?.effective_at
                  ? new Date(data.effective_at).toLocaleDateString("en-GB")
                  : "Final review pending"}
              </span>
              {data ? <span>Version {data.version}</span> : null}
            </div>
          </header>

          <section className={styles.content}>
            <p className={styles.intro}>{fallback.intro}</p>
            <div className={styles.sections}>
              {sections.map((section, index) => (
                <article key={section.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h2>{section.title}</h2>
                    <p>{section.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
