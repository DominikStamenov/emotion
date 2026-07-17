import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "../../components/container";
import { Footer } from "../../components/footer";
import { Navbar } from "../../components/navbar";
import { createPublicClient } from "../../lib/supabase/public";
import styles from "../editorial.module.css";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "eMotion perspectives on brand, digital products, motion, technology and applied AI.",
};

export default async function InsightsPage() {
  const supabase = createPublicClient();
  const { data: insights } = supabase
    ? await supabase
        .from("insights")
        .select("id, slug, title, excerpt, published_at")
        .order("published_at", { ascending: false })
    : { data: [] };

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <Container>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>Thinking in public</p>
            <h1>Ideas behind the work.</h1>
            <p>
              Notes on clarity, interaction, systems, culture and the useful
              edge of emerging technology.
            </p>
          </header>
          {insights?.length ? (
            <section className={styles.list}>
              {insights.map((insight, index) => (
                <Link href={"/insights/" + insight.slug} key={insight.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h2>{insight.title}</h2>
                  <p>{insight.excerpt}</p>
                  <span>
                    {insight.published_at
                      ? new Date(insight.published_at).getFullYear()
                      : "—"}
                  </span>
                </Link>
              ))}
            </section>
          ) : (
            <div className={styles.empty}>
              The editorial system is ready. The first approved eMotion insight
              has not been published yet.
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
