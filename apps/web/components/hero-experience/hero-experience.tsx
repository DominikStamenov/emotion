"use client";

import { Canvas } from "@react-three/fiber";

import { HeroExperienceScene } from "./scene";
import styles from "./hero-experience.module.css";

export function HeroExperience() {
  return (
    <div className={styles.experience} aria-hidden="true">
      <Canvas
        camera={{
          position: [0, 0, 5.8],
          fov: 42,
        }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
        }}
      >
        <HeroExperienceScene />
      </Canvas>
    </div>
  );
}