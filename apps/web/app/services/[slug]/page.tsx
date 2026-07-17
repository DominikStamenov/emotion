import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsContent } from "../../../components/cms-content";
import { Container } from "../../../components/container";
import { Footer } from "../../../components/footer";
import { Navbar } from "../../../components/navbar";
import { services as seedServices } from "../../../data/services";
import { createPublicClient } from "../../../lib/supabase/public";
import styles from "../../editorial.module.css";

type Props = { params: Promise<{ slug: string }> };

async function getService(slug: string) {
  const supabase = createPublicClient();

  if (supabase) {
    const { data } = await supabase
      .from("services")
      .select("id, title, short_description, content, slug")
      .eq("slug", slug)
      .maybeSingle();
    if (data) return { ...data, seed: false };
  }

  const seed = seedServices.find(
    (service) => service.title.toLowerCase().replaceAll(" ", "-") === slug,
  );
  return seed
    ? {
        content: [],
        id: "seed-" + slug,
        seed: true,
        short_description: seed.description,
        slug,
        title: seed.title,
      }
    : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService((await params).slug);
  return service
    ? { description: service.short_description, title: service.title }
    : {};
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getService((await params).slug);
  if (!service) notFound();

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <Container>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>
              Service{service.seed ? " · temporary foundation copy" : ""}
            </p>
            <h1>{service.title}</h1>
            <p>{service.short_description}</p>
          </header>
          <div className={styles.body}>
            <CmsContent
              content={service.content}
              fallback={service.short_description}
            />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
