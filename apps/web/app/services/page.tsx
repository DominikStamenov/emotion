import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "../../components/container";
import { Footer } from "../../components/footer";
import { Navbar } from "../../components/navbar";
import { getHomeServices } from "../../lib/content";
import styles from "../editorial.module.css";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Strategy, branding, digital design, development, motion, AI and growth — connected as one eMotion system.",
};

export default async function ServicesPage() {
  const services = await getHomeServices();

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <Container>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>Capabilities</p>
            <h1>Built to move the whole experience.</h1>
            <p>
              We connect direction, expression and technology so the brand and
              the product move as one.
            </p>
          </header>
          <section className={styles.list}>
            {services.map((service) => (
              <Link href={"/services/" + service.slug} key={service.id}>
                <span>{service.number}</span>
                <h2>{service.title}</h2>
                <p>{service.description}</p>
                <span>↗</span>
              </Link>
            ))}
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
