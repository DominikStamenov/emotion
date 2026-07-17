import { ServiceCard } from "../service-card";
import { Container } from "../container";
import { getHomeServices } from "../../lib/content";
import { Reveal } from "@repo/motion";
import styles from "./sections.module.css";

export async function ServicesSection() {
  const services = await getHomeServices();
  return (
    <section id="services" className={styles.section}>
      <Container>
        <Reveal>
          <header className={styles.header}>
            <p className={styles.eyebrow}>What we do</p>

            <h2 className={styles.title}>
              Digital experiences built to move people.
            </h2>

            <p className={styles.description}>
              We combine strategy, branding, web development, AI and motion
              design into one digital ecosystem that helps ambitious businesses
              grow.
            </p>
          </header>
        </Reveal>

        <div className={styles.serviceGrid}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              number={service.number}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
