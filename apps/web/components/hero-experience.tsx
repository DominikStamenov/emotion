"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MathUtils, type Mesh } from "three"; 
import { MeshDistortMaterial, Sparkles } from "@react-three/drei";

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
      <icosahedronGeometry args={[1.25, 6]} />

      <MeshDistortMaterial
  color="#8b5cf6"
  roughness={0.22}
  metalness={0.16}
  distort={0.34}
  speed={1.4}
/>
    </mesh>
  );
} 
function EmotionParticles() {
  return (
    <group>
      <Sparkles
        count={46}
        scale={[5.8, 4.2, 3]}
        size={2.2}
        speed={0.28}
        opacity={0.42}
        color="#f7f5fb"
      />

      <Sparkles
        count={18}
        scale={[4.6, 3.4, 2.4]}
        size={3.2}
        speed={0.18}
        opacity={0.55}
        color="#f43f8d"
      />

      <Sparkles
        count={14}
        scale={[4.8, 3.6, 2.6]}
        size={2.8}
        speed={0.22}
        opacity={0.5}
        color="#22d3ee"
      />
    </group>
  );
} 
 
function EmotionRings() {
  return (
    <group rotation={[0.35, 0.2, -0.15]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.85, 0.012, 16, 180]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.42}
        />
      </mesh>

      <mesh rotation={[1.15, 0.4, 0.5]}>
        <torusGeometry args={[2.25, 0.008, 16, 180]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.24}
        />
      </mesh>

      <mesh rotation={[0.45, 1.2, 0.2]}>
        <torusGeometry args={[2.65, 0.006, 16, 180]} />
        <meshBasicMaterial
          color="#f43f8d"
          transparent
          opacity={0.18}
        />
      </mesh>
    </group>
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

      <EmotionParticles /> 
      <EmotionRings />
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