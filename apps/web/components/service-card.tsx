type ServiceCardProps = {
    number: string;
    title: string;
    description: string;
  };
  
  export function ServiceCard({
    number,
    title,
    description,
  }: ServiceCardProps) {
    return (
      <article className="border-t border-white/10 py-8">
        <p className="text-sm font-medium text-white/40">{number}</p>
  
        <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white">
          {title}
        </h3>
  
        <p className="mt-4 max-w-md leading-7 text-white/60">
          {description}
        </p>
      </article>
    );
  }