import Image from "next/image";

import { Button } from "./button";
import { Container } from "./container";
import { HeroExperience } from "./hero-experience";
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

      <div className={styles.heroVisual} aria-hidden="true">
        <HeroExperience />

        <div className={styles.heroFallback}>
          <div className={styles.heroVisualHalo} />

          <div className={`${styles.heroOrbit} ${styles.heroOrbitOuter}`}>
            <span />
          </div>

          <div className={`${styles.heroOrbit} ${styles.heroOrbitInner}`}>
            <span />
          </div>

          <div className={styles.heroCore}>
            <Image
              src="/brand/emotion-mark.svg"
              alt=""
              width={98}
              height={98}
            />
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
          </div>
        </div>

        <div className={styles.heroScroll}>
          <span>Move your mouse</span>
          <i />
        </div>
      </Container>
    </section>
  );
}
