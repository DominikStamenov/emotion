"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  MathUtils,
  type Points,
} from "three";

const HERO_PARTICLE_COUNT = 8;

export function HeroParticles() {
  const pointsRef = useRef<Points>(null);

  const positions = useMemo(() => {
    const values = new Float32Array(HERO_PARTICLE_COUNT * 3);

    for (let index = 0; index < HERO_PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const angle = (index / HERO_PARTICLE_COUNT) * Math.PI * 2;
      const radius = 1.15 + Math.random() * 1.9;

      values[offset] = Math.cos(angle) * radius;
      values[offset + 1] =
        Math.sin(angle) * radius * 0.72;
      values[offset + 2] = 0.7 + Math.random() * 1.1;
    }

    return values;
  }, []);

  useFrame((state, delta) => {
    const points = pointsRef.current;

    if (!points) return;

    const easing = 1 - Math.exp(-delta * 1.4);
    const time = state.clock.elapsedTime;

    points.position.x = MathUtils.lerp(
      points.position.x,
      state.pointer.x * 0.16,
      easing,
    );

    points.position.y = MathUtils.lerp(
      points.position.y,
      state.pointer.y * 0.12,
      easing,
    );

    points.rotation.z = time * 0.018;

    const pulse = 1 + Math.sin(time * 0.55) * 0.035;
    points.scale.setScalar(pulse);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#ffffff"
        size={0.085}
        sizeAttenuation
        transparent
        opacity={0.68}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}