import { TestimonialCard } from "../testimonial-card";
import { testimonials } from "../../data/testimonials";

export function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-white/50">
            CLIENT STORIES
          </p>

          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Trusted by teams building meaningful digital products.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
            We work closely with ambitious founders and teams to create
            experiences that feel clear, distinctive and built for long-term
            growth.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.name}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
            />
          ))}
        </div>
      </div>
    </section>
  );
}