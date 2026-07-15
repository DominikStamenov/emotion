import { ServiceCard } from "../service-card";
import { services } from "../../data/services";
export function ServicesSection() {
    return (
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-white/50">
              WHAT WE DO
            </p>
  
            <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Digital experiences built to move people.
            </h2>
  
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              We combine strategy, branding, web development, AI and motion
              design into one digital ecosystem that helps ambitious businesses
              grow.
            </p>
          </div> 
          <div className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
  <ServiceCard
    key={service.number}
    number={service.number}
    title={service.title}
    description={service.description}
  />
))}
   
</div> 

        </div>
      </section>
    );
  }