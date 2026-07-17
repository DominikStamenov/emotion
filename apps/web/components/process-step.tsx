import styles from "./sections/sections.module.css";

type ProcessStepProps = {
  number: string;
  title: string;
  description: string;
};

export function ProcessStep({ number, title, description }: ProcessStepProps) {
  return (
    <article className={styles.processStep}>
      <p className={styles.number}>{number}</p>
      <h3 className={styles.processTitle}>{title}</h3>
      <p className={styles.processDescription}>{description}</p>
    </article>
  );
}
