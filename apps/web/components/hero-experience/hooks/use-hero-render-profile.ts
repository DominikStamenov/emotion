"use client";

import {
  useCallback,
  useSyncExternalStore,
} from "react";

export type HeroRenderProfile =
  | "full"
  | "compact";

const COMPACT_RENDER_QUERY =
  "(max-width: 700px), (pointer: coarse)";

const REDUCED_MOTION_QUERY =
  "(prefers-reduced-motion: reduce)";

function getServerSnapshot() {
  return false;
}

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQuery =
        window.matchMedia(query);

      mediaQuery.addEventListener(
        "change",
        onStoreChange,
      );

      return () => {
        mediaQuery.removeEventListener(
          "change",
          onStoreChange,
        );
      };
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}

export function useHeroRenderProfile() {
  const compact = useMediaQuery(
    COMPACT_RENDER_QUERY,
  );

  const reducedMotion = useMediaQuery(
    REDUCED_MOTION_QUERY,
  );

  return {
    profile: compact
      ? ("compact" as const)
      : ("full" as const),
    reducedMotion,
  };
}
