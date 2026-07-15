
import { Button } from "./button";
import { Container } from "./container"; 
import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div
  className={`${styles.heroGlow} ${styles.heroGlowPrimary}`}
  aria-hidden="true"
/>
<div
  className={`${styles.heroGlow} ${styles.heroGlowSecondary}`}
  aria-hidden="true"
/>
      <div className={styles.heroGrid} aria-hidden="true" />

      <Container className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>
              <span aria-hidden="true" />
              Strategy · Branding · Design · Development
            </p>

            <h1 className={styles.heroTitle}>
              Emotion
              <span>becomes</span>
              <strong>motion.</strong>
            </h1>

            <p className={styles.heroDescription}>
              We create memorable brands and premium digital experiences for
              ambitious companies that want to move forward.
            </p>

            <div className={styles.heroActions}>
            <Button href="#contact">
  Start a project
  <span aria-hidden="true">↗</span>
</Button>

  <Button href="#work" variant="secondary">
    View our work
  </Button>
</div>

            <div className={styles.heroMeta}>
              <div>
                <strong>Branding</strong>
                <span>Identity systems</span>
              </div>

              <div>
                <strong>Web design</strong>
                <span>Digital experiences</span>
              </div>

              <div>
                <strong>Development</strong>
                <span>Fast and scalable</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.heroVisualHalo} />
            <div className={`${styles.heroOrbit} ${styles.heroOrbitOuter}`}>
              <span />
            </div>

            <div className={`${styles.heroOrbit} ${styles.heroOrbitInner}`}>
              <span />
            </div>

            <div className={styles.heroCore}>
              <svg viewBox="0 0 64 64">
                <path
                  d="M14 14C25 18 35 24 49 32C35 40 25 46 14 50C21 42 27 36 27 32C27 28 21 22 14 14Z"
                  fill="currentColor"
                />

                <path
                  d="M19 25L35 32L19 39"
                  fill="none"
                  stroke="#08080a"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
              </svg>
            </div>

            <div className={`${styles.heroCard} ${styles.heroCardTop}`}>
              <small>Emotion</small>
              <strong>Ideas that connect.</strong>
            </div>

            <div className={`${styles.heroCard} ${styles.heroCardBottom}`}>
              <small>Motion</small>
              <strong>Design that moves.</strong>
            </div>
          </div>
        </div>

        <div className={styles.heroScroll}>
          <span>Scroll to explore</span>
          <i />
        </div>
      </Container>
    </section>
  );
}