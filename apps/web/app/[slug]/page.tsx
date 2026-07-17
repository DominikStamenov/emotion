import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsContent } from "../../components/cms-content";
import { Container } from "../../components/container";
import { Footer } from "../../components/footer";
import { Navbar } from "../../components/navbar";
import { createPublicClient } from "../../lib/supabase/public";
import styles from "../editorial.module.css";

type Props = { params: Promise<{ slug: string }> };

async function getPage(slug: string) {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data: page } = await supabase
    .from("pages")
    .select("id, slug, title, summary, seo")
    .eq("slug", slug)
    .maybeSingle();
  if (!page) return null;
  const { data: sections } = await supabase
    .from("page_sections")
    .select("id, section_type, content, position")
    .eq("page_id", page.id)
    .order("position");
  return {
    ...page,
    content: {
      sections: (sections || []).map((section) => ({
        ...(typeof section.content === "object" &&
        section.content &&
        !Array.isArray(section.content)
          ? section.content
          : {}),
        type: section.section_type,
      })),
    },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug);
  return page ? { description: page.summary, title: page.title } : {};
}

export default async function CmsPage({ params }: Props) {
  const page = await getPage((await params).slug);
  if (!page) notFound();

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <Container>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>eMotion</p>
            <h1>{page.title}</h1>
            <p>{page.summary}</p>
          </header>
          <div className={styles.body}>
            <CmsContent content={page.content} fallback={page.summary} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
