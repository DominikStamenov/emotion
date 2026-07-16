"use client";

import { Canvas } from "@react-three/fiber";

import { useHeroRenderProfile } from "./hooks/use-hero-render-profile";
import { HeroExperienceScene } from "./scene";
import styles from "./hero-experience.module.css";

export function HeroExperience() {
  const { profile, reducedMotion } =
    useHeroRenderProfile();

  if (reducedMotion) {
    return null;
  }

  const compact = profile === "compact";

  return (
    <div className={styles.experience} aria-hidden="true">
      <Canvas
        camera={{
          position: [0, 0, 5.8],
          fov: 42,
        }}
        dpr={compact ? [1, 1.15] : [1, 1.5]}
        gl={{
          alpha: true,
          antialias: !compact,
          powerPreference: "high-performance",
        }}
        performance={{ min: 0.5 }}
      >
        <HeroExperienceScene profile={profile} />
      </Canvas>
    </div>
  );
}
