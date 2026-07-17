import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsContent } from "../../../components/cms-content";
import { Container } from "../../../components/container";
import { Footer } from "../../../components/footer";
import { Navbar } from "../../../components/navbar";
import { createPublicClient } from "../../../lib/supabase/public";
import styles from "../../editorial.module.css";

type Props = { params: Promise<{ slug: string }> };

async function getInsight(slug: string) {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("insights")
    .select("id, slug, title, excerpt, content, published_at")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const insight = await getInsight((await params).slug);
  return insight ? { description: insight.excerpt, title: insight.title } : {};
}

export default async function InsightPage({ params }: Props) {
  const insight = await getInsight((await params).slug);
  if (!insight) notFound();

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <Container>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>eMotion insight</p>
            <h1>{insight.title}</h1>
            <p>{insight.excerpt}</p>
            {insight.published_at ? (
              <div className={styles.detailMeta}>
                <span>
                  {new Date(insight.published_at).toLocaleDateString("en-GB")}
                </span>
              </div>
            ) : null}
          </header>
          <div className={styles.body}>
            <CmsContent content={insight.content} fallback={insight.excerpt} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
