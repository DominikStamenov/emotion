import { ProcessStep } from "../process-step";
import { Container } from "../container";
import { processSteps } from "../../data/process";
import styles from "./sections.module.css";

export function ProcessSection() {
  return (
    <section
      id="studio"
      className={`${styles.section} ${styles.sectionBorder}`}
    >
      <Container>
        <header className={styles.header}>
          <p className={styles.eyebrow}>How we work</p>
          <h2 className={styles.title}>
            A clear process from first idea to continuous growth.
          </h2>
          <p className={styles.description}>
            Every project follows a structured path that keeps strategy,
            creativity and execution aligned from beginning to end.
          </p>
        </header>

        <div className={styles.processList}>
          {processSteps.map((step) => (
            <ProcessStep
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
