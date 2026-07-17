"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";

import { useMotionPreference } from "./motion-provider";
import styles from "./motion.module.css";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

export type RevealProps = HTMLAttributes<HTMLDivElement> & {
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  threshold?: number;
};

type RevealStyle = CSSProperties & {
  "--emotion-reveal-delay": string;
  "--emotion-reveal-duration": string;
  "--emotion-reveal-distance": string;
};

export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 700,
  distance = 24,
  once = true,
  threshold = 0.16,
  style,
  ...props
}: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { reducedMotion } = useMotionPreference();

  useEffect(() => {
    const element = elementRef.current;

    if (!element || reducedMotion || !window.IntersectionObserver) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        setVisible(entry.isIntersecting);

        if (entry.isIntersecting && once) {
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once, reducedMotion, threshold]);

  const revealStyle: RevealStyle = {
    ...style,
    "--emotion-reveal-delay": `${Math.max(0, delay)}ms`,
    "--emotion-reveal-duration": `${Math.max(0, duration)}ms`,
    "--emotion-reveal-distance": `${Math.max(0, distance)}px`,
  };

  return (
    <div
      {...props}
      ref={elementRef}
      className={[styles.reveal, styles[direction], className]
        .filter(Boolean)
        .join(" ")}
      data-visible={visible || reducedMotion ? "true" : "false"}
      style={revealStyle}
    >
      {children}
    </div>
  );
}
