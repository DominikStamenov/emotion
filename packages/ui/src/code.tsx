import { type JSX } from "react";

import styles from "./code.module.css";

export function Code({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <code className={[styles.code, className].filter(Boolean).join(" ")}>
      {children}
    </code>
  );
}
