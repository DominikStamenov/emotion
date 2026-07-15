import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const isCentered = align === "center";

  return (
    <div
      className={[
        "flex max-w-3xl flex-col gap-4",
        isCentered ? "mx-auto items-center text-center" : "items-start",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/55">
          {eyebrow}
        </p>
      ) : null}

      <h2 className="text-balance text-3xl font-medium tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      {description ? (
        <p className="max-w-2xl text-pretty text-base leading-7 text-foreground/60 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}