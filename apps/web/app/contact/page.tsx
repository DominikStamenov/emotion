import type { Metadata } from "next";

import { ContactForm } from "../../components/contact-form";
import { Container } from "../../components/container";
import { Footer } from "../../components/footer";
import { Navbar } from "../../components/navbar";
import { publicContactEmail } from "../../lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Start a project",
  description:
    "Tell eMotion about your ambition, challenge and the digital experience you want to create.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <Container>
          <header className={styles.hero}>
            <div>
              <p className={styles.eyebrow}>Start a project</p>
              <h1>Bring the ambition. We&apos;ll shape the motion.</h1>
            </div>
            <div className={styles.intro}>
              <p>
                Share enough context for a useful first conversation. Every
                brief enters our private CRM, is reviewed by a person and stays
                connected to the project journey.
              </p>
              {publicContactEmail ? (
                <a href={"mailto:" + publicContactEmail}>
                  {publicContactEmail} ↗
                </a>
              ) : null}
            </div>
          </header>

          <section className={styles.content}>
            <aside className={styles.aside}>
              <p>What happens next</p>
              <ol>
                <li>
                  <span>01</span>
                  We review the ambition and fit.
                </li>
                <li>
                  <span>02</span>
                  The right eMotion lead replies.
                </li>
                <li>
                  <span>03</span>
                  We define discovery and next steps.
                </li>
              </ol>
              <small>
                Your details are used only to respond and manage this
                conversation unless you separately opt into updates.
              </small>
            </aside>
            <ContactForm />
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
