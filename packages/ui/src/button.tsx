import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import styles from "./button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "small" | "medium" | "large";

type SharedButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

type NativeButtonProps = SharedButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedButtonProps> & {
    href?: never;
  };

type LinkButtonProps = SharedButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SharedButtonProps> & {
    href: string;
  };

export type ButtonProps = NativeButtonProps | LinkButtonProps;

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  ...props
}: ButtonProps) {
  const buttonClassName = classNames(
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  );

  const content = (
    <>
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {!loading && leadingIcon ? (
        <span className={styles.icon} aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span className={styles.label}>{children}</span>
      {trailingIcon ? (
        <span className={styles.icon} aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
    </>
  );

  if ("href" in props && typeof props.href === "string") {
    return (
      <a
        {...props}
        className={buttonClassName}
        aria-busy={loading || undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...props}
      className={buttonClassName}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
}
