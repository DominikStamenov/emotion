import { Button } from "../button";
import { Container } from "../container";
import styles from "./sections.module.css";

export function CtaSection() {
  return (
    <section id="contact" className={styles.ctaSection}>
      <Container>
        <div className={styles.ctaPanel}>
          <p className={styles.eyebrow}>Start a project</p>

          <div className={styles.ctaContent}>
            <div>
              <h2 className={styles.ctaTitle}>
                Let&apos;s build something people remember.
              </h2>
              <p className={styles.ctaDescription}>
                Tell us what you are building, where you want to go and what is
                currently standing in the way.
              </p>
            </div>

            <Button href="/contact" className={styles.ctaAction} impact>
              Start a conversation
              <span aria-hidden="true">↗</span>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
