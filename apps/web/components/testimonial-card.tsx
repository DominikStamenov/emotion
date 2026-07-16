type TestimonialCardProps = {
    quote: string;
    name: string;
    role: string;
  };
  
  export function TestimonialCard({
    quote,
    name,
    role,
  }: TestimonialCardProps) {
    return (
      <figure className="flex h-full flex-col justify-between border border-white/10 p-8">
        <blockquote className="text-xl leading-8 tracking-tight text-white md:text-2xl">
          “{quote}”
        </blockquote>
  
        <figcaption className="mt-12">
          <p className="font-semibold text-white">{name}</p>
          <p className="mt-1 text-sm text-white/50">{role}</p>
        </figcaption>
      </figure>
    );
  }