import Link from "next/link";
import type { ReactNode } from "react";
import { ImpactLink } from "@repo/motion";

import styles from "./button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  external?: boolean;
  impact?: boolean;
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  external = false,
  impact = false,
  className = "",
}: ButtonProps) {
  const variantClass = {
    primary: styles.primary,
    secondary: styles.secondary,
    ghost: styles.ghost,
  }[variant];

  const classes = [styles.button, variantClass, className]
    .filter(Boolean)
    .join(" ");

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  if (impact) {
    return (
      <ImpactLink href={href} className={classes}>
        {children}
      </ImpactLink>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
