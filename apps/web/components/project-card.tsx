import styles from "./sections/sections.module.css";

type ProjectCardProps = {
  title: string;
  category: string;
  year: string;
  seed?: boolean;
};

export function ProjectCard({ title, category, year, seed }: ProjectCardProps) {
  return (
    <article className={styles.projectCard}>
      <h3 className={styles.projectTitle}>{title}</h3>
      <p className={styles.projectCategory}>
        {category}
        {seed ? " · Concept" : ""}
      </p>
      <p className={styles.projectYear}>{year}</p>
    </article>
  );
}
