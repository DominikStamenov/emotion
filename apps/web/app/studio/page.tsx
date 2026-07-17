import type { Metadata } from "next";

import { CmsContent } from "../../components/cms-content";
import { Container } from "../../components/container";
import { Footer } from "../../components/footer";
import { Navbar } from "../../components/navbar";
import styles from "../editorial.module.css";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "eMotion is an independent digital agency combining strategy, design, technology, motion and applied AI.",
};

const studioContent = {
  sections: [
    {
      body: "We start by reducing noise: what needs to change, for whom, and why it matters. The strategic idea becomes the filter for identity, interaction and technology.",
      title: "Clarity before decoration",
    },
    {
      body: "Brand, product, motion and engineering are developed as one experience. That creates fewer handoffs, stronger decisions and a more coherent result.",
      title: "One connected practice",
    },
    {
      body: "The platform is designed to keep learning after launch. Content, conversion signals, relationships and AI assistance share a governed operating system.",
      title: "Built beyond launch",
    },
  ],
};

export default function StudioPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <Container>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>Independent digital agency</p>
            <h1>Different disciplines. One emotional system.</h1>
            <p>
              eMotion brings strategy, design, engineering, motion and applied
              AI into the same room — from first signal to long-term growth.
            </p>
          </header>
          <div className={styles.body}>
            <CmsContent content={studioContent} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
