import { ServiceCard } from "../service-card";
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
  <ServiceCard
    number="01"
    title="Brand Strategy"
    description="We define positioning, messaging, visual direction and the strategic foundation your brand needs to grow."
  />

  <ServiceCard
    number="02"
    title="Web Design"
    description="We design modern, conversion-focused digital experiences that feel clear, premium and easy to use."
  />

  <ServiceCard
    number="03"
    title="Development"
    description="We build fast, scalable and production-ready websites using modern technologies and clean architecture."
  /> 
  <ServiceCard
  number="04"
  title="Motion Design"
  description="We create motion systems, transitions and visual storytelling that make digital products feel alive."
/>

<ServiceCard
  number="05"
  title="AI Solutions"
  description="We integrate practical AI workflows, assistants and automation that improve operations and customer experience."
/>

<ServiceCard
  number="06"
  title="Digital Growth"
  description="We connect strategy, analytics and experimentation to help digital platforms improve after launch."
/>
</div> 

        </div>
      </section>
    );
  }