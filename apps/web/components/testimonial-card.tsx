import styles from "./sections/sections.module.css";

type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
  verified?: boolean;
};

export function TestimonialCard({
  quote,
  name,
  role,
  verified,
}: TestimonialCardProps) {
  return (
    <figure className={styles.testimonialCard}>
      <blockquote className={styles.quote}>“{quote}”</blockquote>
      <figcaption className={styles.caption}>
        <p className={styles.person}>{name}</p>
        <p className={styles.role}>{role}</p>
        {!verified ? (
          <p className={styles.placeholderLabel}>Temporary placeholder</p>
        ) : null}
      </figcaption>
    </figure>
  );
}
