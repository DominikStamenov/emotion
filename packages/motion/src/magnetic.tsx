"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent,
  useRef,
} from "react";

import { useMotionPreference } from "./motion-provider";
import styles from "./motion.module.css";

type MagneticStyle = CSSProperties & {
  "--emotion-magnetic-x": string;
  "--emotion-magnetic-y": string;
  "--emotion-magnetic-strength": string;
};

export type MagneticProps = HTMLAttributes<HTMLDivElement> & {
  strength?: number;
};

export function Magnetic({
  children,
  className,
  strength = 14,
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}: MagneticProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotionPreference();

  const updatePointer = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);

    const element = elementRef.current;

    if (!element || reducedMotion || event.pointerType === "touch") {
      return;
    }

    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    element.style.setProperty("--emotion-magnetic-x", x.toFixed(4));
    element.style.setProperty("--emotion-magnetic-y", y.toFixed(4));
  };

  const resetPointer = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);

    const element = elementRef.current;

    element?.style.setProperty("--emotion-magnetic-x", "0");
    element?.style.setProperty("--emotion-magnetic-y", "0");
  };

  const magneticStyle: MagneticStyle = {
    ...style,
    "--emotion-magnetic-x": "0",
    "--emotion-magnetic-y": "0",
    "--emotion-magnetic-strength": `${Math.max(0, strength)}px`,
  };

  return (
    <div
      {...props}
      ref={elementRef}
      className={[styles.magnetic, className].filter(Boolean).join(" ")}
      style={magneticStyle}
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
    >
      {children}
    </div>
  );
}
