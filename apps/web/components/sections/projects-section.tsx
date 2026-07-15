import { ProjectCard } from "../project-card";
import { projects } from "../../data/projects";

export function ProjectsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-white/50">
              SELECTED WORK
            </p>

            <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Projects shaped by strategy, design and technology.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              A selection of brands, digital products and platforms created to
              communicate clearly, perform better and leave a lasting
              impression.
            </p>
          </div>

          <a
            href="/work"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white transition-opacity hover:opacity-60"
          >
            View all projects
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="mt-16">
          {projects.map((project) => (
            <ProjectCard
              key={project.title}
              title={project.title}
              category={project.category}
              year={project.year}
            />
          ))}
        </div>
      </div>
    </section>
  );
}