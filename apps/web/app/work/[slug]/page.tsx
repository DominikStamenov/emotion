import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsContent } from "../../../components/cms-content";
import { Container } from "../../../components/container";
import { Footer } from "../../../components/footer";
import { Navbar } from "../../../components/navbar";
import { projects as seedProjects } from "../../../data/projects";
import { createPublicClient } from "../../../lib/supabase/public";
import styles from "../../editorial.module.css";

type Props = { params: Promise<{ slug: string }> };

async function getProject(slug: string) {
  const supabase = createPublicClient();
  if (supabase) {
    const { data } = await supabase
      .from("projects")
      .select(
        "id, slug, title, summary, client_name, year, content, is_seed, verified_at",
      )
      .eq("slug", slug)
      .maybeSingle();
    if (data) return data;
  }

  const seed = seedProjects.find(
    (project) => project.title.toLowerCase().replaceAll(" ", "-") === slug,
  );
  return seed
    ? {
        client_name: null,
        content: [],
        id: "seed-" + slug,
        is_seed: true,
        slug,
        summary: seed.category,
        title: seed.title,
        verified_at: null,
        year: Number(seed.year),
      }
    : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  return project ? { description: project.summary, title: project.title } : {};
}

export default async function WorkDetailPage({ params }: Props) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  const concept = project.is_seed && !project.verified_at;

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <Container>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>
              {concept
                ? "Concept study · not a verified client claim"
                : "Case study"}
            </p>
            <h1>{project.title}</h1>
            <p>{project.summary}</p>
            <div className={styles.detailMeta}>
              {project.client_name ? <span>{project.client_name}</span> : null}
              {project.year ? <span>{project.year}</span> : null}
            </div>
          </header>
          <div className={styles.body}>
            <CmsContent content={project.content} fallback={project.summary} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
