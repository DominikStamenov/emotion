"use client";

import { useEffect, useRef, useState } from "react";

const HERO_VIEWPORT_MARGIN = 160;

export function useHeroVisibility() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [inViewport, setInViewport] = useState(true);

  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setPageVisible(document.visibilityState !== "hidden");
    };

    handleVisibilityChange();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    let animationFrame: number | null = null;

    const measureViewport = () => {
      animationFrame = null;

      const bounds = element.getBoundingClientRect();

      setInViewport(
        bounds.bottom >= -HERO_VIEWPORT_MARGIN &&
          bounds.top <= window.innerHeight + HERO_VIEWPORT_MARGIN,
      );
    };

    const scheduleMeasurement = () => {
      if (animationFrame !== null) {
        return;
      }

      animationFrame = window.requestAnimationFrame(measureViewport);
    };

    window.addEventListener("scroll", scheduleMeasurement, { passive: true });

    window.addEventListener("resize", scheduleMeasurement);

    const measurementInterval = window.setInterval(scheduleMeasurement, 750);

    measureViewport();

    return () => {
      window.removeEventListener("scroll", scheduleMeasurement);

      window.removeEventListener("resize", scheduleMeasurement);

      window.clearInterval(measurementInterval);

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return {
    containerRef,
    isActive: inViewport && pageVisible,
  };
}
