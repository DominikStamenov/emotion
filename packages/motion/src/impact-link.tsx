"use client";

import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { useMotionPreference } from "./motion-provider";
import styles from "./motion.module.css";

const PARTICLE_COUNT = 14;

export type ImpactLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  transitionDuration?: number;
};

function shouldNavigateImmediately(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

export function ImpactLink({
  children,
  className,
  href,
  target,
  transitionDuration = 520,
  onClick,
  ...props
}: ImpactLinkProps) {
  const [impactActive, setImpactActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const { reducedMotion } = useMotionPreference();

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      !href ||
      target === "_blank" ||
      reducedMotion ||
      shouldNavigateImmediately(event)
    ) {
      return;
    }

    event.preventDefault();
    setImpactActive(true);

    timeoutRef.current = window.setTimeout(
      () => {
        window.location.assign(href);
      },
      Math.max(0, transitionDuration),
    );
  };

  return (
    <a
      {...props}
      href={href}
      target={target}
      className={[styles.impactLink, className].filter(Boolean).join(" ")}
      data-impact={impactActive ? "true" : "false"}
      onClick={handleClick}
    >
      <span className={styles.impactLabel}>{children}</span>
      <span className={styles.impactField} aria-hidden="true">
        {Array.from({ length: PARTICLE_COUNT }, (_, index) => (
          <span
            className={styles.impactParticle}
            style={{ "--particle-index": index } as React.CSSProperties}
            key={index}
          />
        ))}
      </span>
    </a>
  );
}
