import { ProjectCard } from "../project-card";
import { Container } from "../container";
import { getHomeProjects } from "../../lib/content";
import styles from "./sections.module.css";

export async function ProjectsSection() {
  const projects = await getHomeProjects();
  const usingSeed = projects.some((project) => project.seed);
  return (
    <section id="work" className={`${styles.section} ${styles.sectionBorder}`}>
      <Container>
        <div className={styles.headerRow}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>
              {usingSeed
                ? "Concept portfolio · temporary content"
                : "Selected work"}
            </p>
            <h2 className={styles.title}>
              Projects shaped by strategy, design and technology.
            </h2>
            <p className={styles.description}>
              A selection of brands, digital products and platforms created to
              communicate clearly, perform better and leave a lasting
              impression.
            </p>
          </header>

          <Link href="/contact" className={styles.sectionLink}>
            Discuss your project
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className={styles.projectList}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              category={project.category}
              year={project.year}
              seed={project.seed}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
import Link from "next/link";
