"use client";

import { Canvas } from "@react-three/fiber";

import styles from "./hero-experience.module.css";

function ExperienceScene() {
  return (
    <>
      <ambientLight intensity={0.8} />

      <mesh>
        <icosahedronGeometry args={[1.4, 4]} />
        <meshStandardMaterial
          color="#8b5cf6"
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>
    </>
  );
}

export function HeroExperience() {
  return (
    <div className={styles.experience} aria-hidden="true">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 42,
        }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
        }}
      >
        <ExperienceScene />
      </Canvas>
    </div>
  );
}