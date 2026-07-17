import type { HTMLAttributes, ReactNode } from "react";

import styles from "./card.module.css";

export type CardProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  accent?: "none" | "pink" | "violet" | "cyan";
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Card({
  eyebrow,
  title,
  description,
  footer,
  accent = "none",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <article
      {...props}
      className={classNames(styles.card, styles[accent], className)}
    >
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {description ? <p className={styles.description}>{description}</p> : null}
      {children ? <div className={styles.content}>{children}</div> : null}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </article>
  );
}
