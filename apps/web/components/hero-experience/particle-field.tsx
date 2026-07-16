"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { BufferAttribute, Points } from "three";

import { useParticleEngine } from "./hooks/use-particle-engine";

const PARTICLE_COUNT = 900;

export function ParticleField() {
  const pointsRef = useRef<Points>(null);
  const positionAttributeRef = useRef<BufferAttribute>(null);

  const { positions, colors, update } =
    useParticleEngine(PARTICLE_COUNT);

  useFrame((state, delta) => {
    update(
      state.pointer.x,
      state.pointer.y,
      Math.min(delta, 0.033),
      state.clock.elapsedTime,
    );

    if (positionAttributeRef.current) {
      positionAttributeRef.current.needsUpdate = true;
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.08) * 0.035;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          ref={positionAttributeRef}
          attach="attributes-position"
          args={[positions, 3]}
        />

        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        vertexColors
        size={0.024}
        sizeAttenuation
        transparent
        opacity={0.72}
        depthWrite={false}
      />
    </points>
  );
}