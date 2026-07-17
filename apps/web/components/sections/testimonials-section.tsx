import { TestimonialCard } from "../testimonial-card";
import { Container } from "../container";
import { getHomeTestimonials } from "../../lib/content";
import styles from "./sections.module.css";

export async function TestimonialsSection() {
  const testimonials = await getHomeTestimonials();
  const verified = testimonials.every((testimonial) => testimonial.verified);
  return (
    <section className={`${styles.section} ${styles.sectionBorder}`}>
      <Container>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            {verified
              ? "Client stories"
              : "Editorial placeholders · not client claims"}
          </p>
          <h2 className={styles.title}>
            Trusted by teams building meaningful digital products.
          </h2>
          <p className={styles.description}>
            We work closely with ambitious founders and teams to create
            experiences that feel clear, distinctive and built for long-term
            growth.
          </p>
        </header>

        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              verified={testimonial.verified}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
