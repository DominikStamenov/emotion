import type { HTMLAttributes, ReactNode } from "react";

import styles from "./badge.module.css";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: "neutral" | "pink" | "violet" | "cyan" | "success" | "warning";
  dot?: boolean;
};

export function Badge({
  children,
  className,
  tone = "neutral",
  dot = false,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={[styles.badge, styles[tone], className]
        .filter(Boolean)
        .join(" ")}
    >
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
