"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MathUtils, type Mesh } from "three";

import styles from "./hero-experience.module.css";

function EmotionCore() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;

    if (!mesh) return;

    const time = state.clock.elapsedTime;
    const easing = 1 - Math.exp(-delta * 3);

    const targetRotationX = state.pointer.y * 0.28;
    const targetRotationY = state.pointer.x * 0.42;

    mesh.rotation.x = MathUtils.lerp(
      mesh.rotation.x,
      targetRotationX + time * 0.08,
      easing,
    );

    mesh.rotation.y = MathUtils.lerp(
      mesh.rotation.y,
      targetRotationY + time * 0.12,
      easing,
    );

    mesh.position.x = MathUtils.lerp(
      mesh.position.x,
      state.pointer.x * 0.18,
      easing,
    );

    mesh.position.y = MathUtils.lerp(
      mesh.position.y,
      state.pointer.y * 0.14 + Math.sin(time * 0.7) * 0.1,
      easing,
    );

    const scale = 1 + Math.sin(time * 0.9) * 0.035;
    mesh.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.25, 5]} />

      <meshStandardMaterial
        color="#8b5cf6"
        roughness={0.28}
        metalness={0.12}
      />
    </mesh>
  );
}

function ExperienceScene() {
  return (
    <>
      <ambientLight intensity={0.7} />

      <directionalLight
        position={[3, 4, 5]}
        intensity={2.2}
        color="#ffffff"
      />

      <pointLight
        position={[-3, -2, 3]}
        intensity={14}
        color="#f43f8d"
      />

      <pointLight
        position={[3, 1, 2]}
        intensity={12}
        color="#22d3ee"
      />

      <EmotionCore />
    </>
  );
}

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
        <ExperienceScene />
      </Canvas>
    </div>
  );
}