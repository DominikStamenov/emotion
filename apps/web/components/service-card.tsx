import styles from "./sections/sections.module.css";

type ServiceCardProps = {
  number: string;
  title: string;
  description: string;
};

export function ServiceCard({ number, title, description }: ServiceCardProps) {
  return (
    <article className={styles.serviceCard}>
      <p className={styles.number}>{number}</p>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDescription}>{description}</p>
    </article>
  );
}
