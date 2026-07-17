"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  MathUtils,
  type Group,
  type PointsMaterial,
} from "three";

import { getHeroTimeline } from "./engine/hero-timeline";

type AtmosphereLayerProps = {
  count: number;
  seed: number;
  spread: [number, number, number];
  size: number;
  opacity: number;
  color: string;
  depth: number;
  parallax: number;
  speed: number;
  revealOpacity: number;
  revealSize: number;
  revealScale: number;
  revealDepthShift: number;
};

function createRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10_000;

    return value - Math.floor(value);
  };
}

function AtmosphereLayer({
  count,
  seed,
  spread,
  size,
  opacity,
  color,
  depth,
  parallax,
  speed,
  revealOpacity,
  revealSize,
  revealScale,
  revealDepthShift,
}: AtmosphereLayerProps) {
  const groupRef = useRef<Group>(null);

  const materialRef = useRef<PointsMaterial>(null);

  const [spreadX, spreadY, spreadZ] = spread;

  const positions = useMemo(() => {
    const random = createRandom(seed);

    const values = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;

      values[offset] = (random() - 0.5) * spreadX;

      values[offset + 1] = (random() - 0.5) * spreadY;

      values[offset + 2] = (random() - 0.5) * spreadZ + depth;
    }

    return values;
  }, [count, depth, seed, spreadX, spreadY, spreadZ]);

  useFrame((state, delta) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const safeDelta = Math.min(delta, 0.033);

    const easing = 1 - Math.exp(-safeDelta * 2);

    const time = state.clock.elapsedTime;

    const { revealAmount, freedomAmount } = getHeroTimeline(time);

    const interactionAmount = 1 - revealAmount * 0.52;

    const rotationAmount = 1 - revealAmount * 0.46;

    const autonomousX =
      Math.sin(time * (speed + 0.08) + seed * 0.01) * parallax * 0.32;

    const autonomousY =
      Math.cos(time * (speed + 0.06) + seed * 0.014) * parallax * 0.24;

    const targetX =
      state.pointer.x * parallax * interactionAmount + autonomousX;

    const targetY =
      state.pointer.y * parallax * 0.72 * interactionAmount + autonomousY;

    group.position.x = MathUtils.lerp(group.position.x, targetX, easing);

    group.position.y = MathUtils.lerp(group.position.y, targetY, easing);

    /**
     * Each depth layer retreats by a different amount,
     * creating a quiet chamber around the logo.
     */
    group.position.z = MathUtils.lerp(
      group.position.z,
      -revealDepthShift * revealAmount,
      easing,
    );

    const targetRotationZ = Math.sin(time * speed) * 0.042 * rotationAmount;

    group.rotation.z = MathUtils.lerp(
      group.rotation.z,
      targetRotationZ,
      easing,
    );

    const targetRotationX =
      Math.cos(time * speed * 0.72 + seed * 0.01) * 0.01 * rotationAmount;

    const targetRotationY =
      Math.sin(time * speed * 0.58 + seed * 0.015) * 0.015 * rotationAmount;

    group.rotation.x = MathUtils.lerp(
      group.rotation.x,
      targetRotationX,
      easing,
    );

    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      targetRotationY,
      easing,
    );

    /**
     * Atmosphere expands slightly away from the center
     * while the logo becomes readable.
     */
    const revealExpansion = MathUtils.lerp(1, revealScale, revealAmount);

    const freedomPulse =
      1 + freedomAmount * (0.018 + Math.sin(time * 1.2) * 0.008);

    const targetScale = revealExpansion * freedomPulse;

    const nextScale = MathUtils.lerp(group.scale.x, targetScale, easing);

    group.scale.setScalar(nextScale);

    const material = materialRef.current;

    if (material) {
      material.opacity =
        opacity * MathUtils.lerp(1, revealOpacity, revealAmount);

      material.size = size * MathUtils.lerp(1, revealSize, revealAmount);
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
          color={color}
          size={size}
          sizeAttenuation
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

type AtmosphereFieldProps = {
  compact?: boolean;
};

export function AtmosphereField({ compact = false }: AtmosphereFieldProps) {
  return (
    <>
      {/* Deep violet atmosphere remains subtly visible */}
      <AtmosphereLayer
        count={compact ? 650 : 1400}
        seed={203}
        spread={[7.8, 5.7, 5.4]}
        size={0.008}
        opacity={0.2}
        color="#8b5cf6"
        depth={-1.8}
        parallax={0.035}
        speed={0.14}
        revealOpacity={0.72}
        revealSize={0.78}
        revealScale={1.025}
        revealDepthShift={0.08}
      />

      {/* Mid white atmosphere clears around the mark */}
      <AtmosphereLayer
        count={compact ? 360 : 780}
        seed={407}
        spread={[7.2, 5.1, 3.8]}
        size={0.013}
        opacity={0.3}
        color="#f7f5fb"
        depth={-0.45}
        parallax={0.075}
        speed={0.2}
        revealOpacity={0.56}
        revealSize={0.66}
        revealScale={1.065}
        revealDepthShift={0.18}
      />

      {/* Foreground cyan sparks retreat most strongly */}
      <AtmosphereLayer
        count={compact ? 90 : 170}
        seed={809}
        spread={[6.5, 4.7, 2.2]}
        size={0.026}
        opacity={0.34}
        color="#22d3ee"
        depth={0.75}
        parallax={0.13}
        speed={0.28}
        revealOpacity={0.42}
        revealSize={0.48}
        revealScale={1.12}
        revealDepthShift={0.34}
      />
    </>
  );
}
