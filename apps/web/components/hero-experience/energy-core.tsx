"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  MathUtils,
  type Group,
  type PointLight,
  type PointsMaterial,
} from "three";

import { getHeroTimeline } from "./engine/hero-timeline";

const FULL_CORE_PARTICLE_COUNT = 120;
const COMPACT_CORE_PARTICLE_COUNT = 72;

const PINK_LIGHT_INTENSITY = 2.2;
const VIOLET_LIGHT_INTENSITY = 2.8;
const CYAN_LIGHT_INTENSITY = 1.8;

function createRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10_000;

    return value - Math.floor(value);
  };
}

type EnergyCoreProps = {
  compact?: boolean;
};

export function EnergyCore({ compact = false }: EnergyCoreProps) {
  const particleCount = compact
    ? COMPACT_CORE_PARTICLE_COUNT
    : FULL_CORE_PARTICLE_COUNT;

  const groupRef = useRef<Group>(null);

  const materialRef = useRef<PointsMaterial>(null);

  const pinkLightRef = useRef<PointLight>(null);

  const violetLightRef = useRef<PointLight>(null);

  const cyanLightRef = useRef<PointLight>(null);

  const positions = useMemo(() => {
    const random = createRandom(918);

    const values = new Float32Array(particleCount * 3);

    for (let index = 0; index < particleCount; index += 1) {
      const offset = index * 3;

      const angle = random() * Math.PI * 2;

      const radius = Math.pow(random(), 2.4) * 0.72;

      values[offset] = Math.cos(angle) * radius;

      values[offset + 1] = Math.sin(angle) * radius;

      values[offset + 2] = (random() - 0.5) * 0.5;
    }

    return values;
  }, [particleCount]);

  useFrame((state, delta) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const time = state.clock.elapsedTime;

    const { revealAmount } = getHeroTimeline(time);

    const interactionAmount = 1 - revealAmount * 0.48;

    const easing = 1 - Math.exp(-delta * 2.6);

    group.position.x = MathUtils.lerp(
      group.position.x,
      state.pointer.x * 0.06 * interactionAmount,
      easing,
    );

    group.position.y = MathUtils.lerp(
      group.position.y,
      state.pointer.y * 0.045 * interactionAmount,
      easing,
    );

    /**
     * The core moves deeper into the scene while the
     * logo forms, leaving the identity visually clean.
     */
    group.position.z = MathUtils.lerp(
      group.position.z,
      -0.32 * revealAmount,
      easing,
    );

    const targetRotationZ = time * 0.055 * interactionAmount;

    const targetRotationY = Math.sin(time * 0.18) * 0.16 * interactionAmount;

    group.rotation.z = MathUtils.lerp(
      group.rotation.z,
      targetRotationZ,
      easing,
    );

    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      targetRotationY,
      easing,
    );

    const pulse =
      1 + Math.sin(time * 0.68) * 0.08 + Math.sin(time * 0.21) * 0.035;

    const revealScale = MathUtils.lerp(1, 0.52, revealAmount);

    const targetScale = pulse * revealScale;

    const nextScale = MathUtils.lerp(group.scale.x, targetScale, easing);

    group.scale.setScalar(nextScale);

    if (materialRef.current) {
      materialRef.current.opacity = MathUtils.lerp(0.56, 0.13, revealAmount);

      materialRef.current.size = MathUtils.lerp(0.028, 0.014, revealAmount);
    }

    /**
     * The lights retain a subtle glow behind the logo
     * instead of disappearing completely.
     */
    const lightAvailability = MathUtils.lerp(1, 0.24, revealAmount);

    if (pinkLightRef.current) {
      pinkLightRef.current.intensity = PINK_LIGHT_INTENSITY * lightAvailability;
    }

    if (violetLightRef.current) {
      violetLightRef.current.intensity =
        VIOLET_LIGHT_INTENSITY * lightAvailability;
    }

    if (cyanLightRef.current) {
      cyanLightRef.current.intensity = CYAN_LIGHT_INTENSITY * lightAvailability;
    }
  });

  return (
    <group ref={groupRef}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>

        <pointsMaterial
          ref={materialRef}
          color="#ffffff"
          size={0.028}
          sizeAttenuation
          transparent
          opacity={0.48}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </points>

      <pointLight
        ref={pinkLightRef}
        color="#f43f8d"
        intensity={PINK_LIGHT_INTENSITY}
        distance={4.2}
        decay={2}
        position={[-0.16, 0.08, 0.35]}
      />

      <pointLight
        ref={violetLightRef}
        color="#8b5cf6"
        intensity={VIOLET_LIGHT_INTENSITY}
        distance={4.6}
        decay={2}
        position={[0, 0, 0.25]}
      />

      <pointLight
        ref={cyanLightRef}
        color="#22d3ee"
        intensity={CYAN_LIGHT_INTENSITY}
        distance={4}
        decay={2}
        position={[0.18, -0.1, 0.4]}
      />
    </group>
  );
}
