type ProjectCardProps = {
    title: string;
    category: string;
    year: string;
  };
  
  export function ProjectCard({
    title,
    category,
    year,
  }: ProjectCardProps) {
    return (
      <article className="group border-t border-white/10 py-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/40">
              {category}
            </p>
  
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white transition-opacity group-hover:opacity-60">
              {title}
            </h3>
          </div>
  
          <p className="text-sm text-white/40">{year}</p>
        </div>
      </article>
    );
  }