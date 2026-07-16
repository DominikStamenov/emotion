"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

const HERO_ROOT_MARGIN = "160px 0px";

export function useHeroVisibility() {
  const [element, setElement] =
    useState<HTMLDivElement | null>(null);

  const [inViewport, setInViewport] =
    useState(true);

  const [pageVisible, setPageVisible] =
    useState(true);

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
    },
    [],
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setPageVisible(
        document.visibilityState !== "hidden",
      );
    };

    handleVisibilityChange();

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, []);

  useEffect(() => {
    if (!element || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInViewport(entry?.isIntersecting ?? true);
      },
      {
        rootMargin: HERO_ROOT_MARGIN,
        threshold: 0.01,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element]);

  return {
    containerRef,
    isActive: inViewport && pageVisible,
  };
}
