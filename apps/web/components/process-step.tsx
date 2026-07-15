type ProcessStepProps = {
    number: string;
    title: string;
    description: string;
  };
  
  export function ProcessStep({
    number,
    title,
    description,
  }: ProcessStepProps) {
    return (
      <article className="grid gap-6 border-t border-white/10 py-8 md:grid-cols-[120px_1fr_1.5fr] md:items-start">
        <p className="text-sm font-medium text-white/40">{number}</p>
  
        <h3 className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h3>
  
        <p className="max-w-xl leading-7 text-white/60">{description}</p>
      </article>
    );
  }