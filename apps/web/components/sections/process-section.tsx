import { ProcessStep } from "../process-step";
import { processSteps } from "../../data/process";

export function ProcessSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-white/50">
            HOW WE WORK
          </p>

          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            A clear process from first idea to continuous growth.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
            Every project follows a structured path that keeps strategy,
            creativity and execution aligned from beginning to end.
          </p>
        </div>

        <div className="mt-16">
          {processSteps.map((step) => (
            <ProcessStep
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}