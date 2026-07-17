import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "../../components/container";
import { Footer } from "../../components/footer";
import { Navbar } from "../../components/navbar";
import { getHomeProjects } from "../../lib/content";
import styles from "../editorial.module.css";

export const metadata: Metadata = { title: "Selected work" };

export default async function WorkPage() {
  const projects = await getHomeProjects();
  const hasSeed = projects.some((project) => project.seed);

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <Container>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>
              {hasSeed
                ? "Concept case studies · temporary content"
                : "Selected work"}
            </p>
            <h1>Ideas made visible, useful and alive.</h1>
            <p>
              Strategy, identity and technology shaped into digital experiences
              with a reason to exist.
            </p>
          </header>
          <section className={styles.list}>
            {projects.map((project, index) => (
              <Link href={"/work/" + project.slug} key={project.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{project.title}</h2>
                <p>
                  {project.category}
                  {project.seed ? " · concept" : ""}
                </p>
                <span>{project.year}</span>
              </Link>
            ))}
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
