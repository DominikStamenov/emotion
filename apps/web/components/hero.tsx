import { Button } from "./button";
import { Container } from "./container";
import { HeroExperience } from "./hero-experience";
import { LivingBrandField } from "./living-brand-field";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroAtmosphere} aria-hidden="true" />
      <div className={styles.heroGrid} aria-hidden="true" />
      <LivingBrandField />

      <Container className={styles.heroContainer}>
        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>
            <span aria-hidden="true" />
            Independent digital studio · Croatia / Worldwide
          </p>

          <h1 className={styles.heroTitle}>
            <span>Emotion</span>
            <span className={styles.heroTitleMuted}>becomes</span>
            <strong>motion.</strong>
          </h1>

          <p className={styles.heroDescription}>
            Strategy, brand identity and digital products — designed and built
            as one connected experience.
          </p>

          <div className={styles.heroActions}>
            <Button href="#contact" className={styles.heroPrimaryAction}>
              Start a project
              <span aria-hidden="true">↗</span>
            </Button>

            <Button href="#work" variant="secondary">
              Explore selected work
            </Button>
          </div>

          <p className={styles.heroAvailability}>
            <span aria-hidden="true" />
            Available for selected projects
          </p>
        </div>

        <div className={styles.heroStage}>
          <HeroExperience />

          <div className={styles.heroStageLabel} aria-hidden="true">
            <span>Click logo to replay</span>
            <strong>Particles → Identity</strong>
          </div>
        </div>

        <div className={styles.heroFooter}>
          <span>Strategy</span>
          <span>Brand systems</span>
          <span>Digital products</span>
          <span>Motion &amp; AI</span>
        </div>
      </Container>
    </section>
  );
}
