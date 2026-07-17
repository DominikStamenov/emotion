"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

import { useReducedMotion } from "./use-reduced-motion";

export type MotionPreference = "system" | "full" | "reduce";

type MotionContextValue = {
  reducedMotion: boolean;
  preference: MotionPreference;
};

const MotionContext = createContext<MotionContextValue>({
  reducedMotion: true,
  preference: "system",
});

export function MotionProvider({
  children,
  preference = "system",
}: {
  children: ReactNode;
  preference?: MotionPreference;
}) {
  const systemReducedMotion = useReducedMotion();

  const value = useMemo<MotionContextValue>(() => {
    const reducedMotion =
      preference === "reduce" ||
      (preference === "system" && systemReducedMotion);

    return { reducedMotion, preference };
  }, [preference, systemReducedMotion]);

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

export function useMotionPreference() {
  return useContext(MotionContext);
}
