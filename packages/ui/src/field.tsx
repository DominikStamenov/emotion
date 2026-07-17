import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

import styles from "./field.module.css";

export type FieldProps = {
  children: ReactNode;
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
};

export function Field({
  children,
  label,
  htmlFor,
  hint,
  error,
  optional = false,
  className,
}: FieldProps) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {optional ? <span>Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint}>{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[styles.control, className].filter(Boolean).join(" ")}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[styles.control, styles.textarea, className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
