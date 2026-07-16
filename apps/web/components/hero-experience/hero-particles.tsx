"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  MathUtils,
  type BufferAttribute,
  type Points,
  type PointsMaterial,
} from "three";

import { getHeroTimeline } from "./engine/hero-timeline";

const HERO_PARTICLE_COUNT = 8;

type SparkAnchor = readonly [
  number,
  number,
  number,
];

const FALLBACK_ANCHOR: SparkAnchor = [
  0,
  0,
  1,
];

/**
 * During Reveal, the foreground sparks move around
 * the outside of the eMotion mark rather than crossing
 * its central negative space.
 */
const REVEAL_ANCHORS: readonly SparkAnchor[] = [
  [-1.12, 0.56, 0.92],
  [-0.76, 1.04, 1.02],
  [-0.12, 1.22, 0.9],
  [0.72, 0.88, 0.98],
  [1.14, 0.18, 1.04],
  [0.88, -0.76, 0.94],
  [0.02, -1.2, 1],
  [-1.02, -0.62, 0.96],
];

function createRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10_000;

    return value - Math.floor(value);
  };
}

export function HeroParticles() {
  const pointsRef = useRef<Points>(null);

  const positionAttributeRef =
    useRef<BufferAttribute>(null);

  const materialRef =
    useRef<PointsMaterial>(null);

  const particleData = useMemo(() => {
    const random = createRandom(1447);

    const positions =
      new Float32Array(
        HERO_PARTICLE_COUNT * 3,
      );

    const basePositions =
      new Float32Array(
        HERO_PARTICLE_COUNT * 3,
      );

    const revealPositions =
      new Float32Array(
        HERO_PARTICLE_COUNT * 3,
      );

    const phases =
      new Float32Array(
        HERO_PARTICLE_COUNT,
      );

    for (
      let index = 0;
      index < HERO_PARTICLE_COUNT;
      index += 1
    ) {
      const offset = index * 3;

      const angle =
        (index / HERO_PARTICLE_COUNT) *
          Math.PI *
          2 +
        (random() - 0.5) * 0.3;

      const radius =
        1.2 + random() * 1.85;

      const baseX =
        Math.cos(angle) * radius;

      const baseY =
        Math.sin(angle) *
        radius *
        0.72;

      const baseZ =
        0.72 + random() * 1.05;

      basePositions[offset] = baseX;
      basePositions[offset + 1] = baseY;
      basePositions[offset + 2] = baseZ;

      positions[offset] = baseX;
      positions[offset + 1] = baseY;
      positions[offset + 2] = baseZ;

      const anchor =
        REVEAL_ANCHORS[index] ??
        FALLBACK_ANCHOR;

      revealPositions[offset] =
        anchor[0];

      revealPositions[offset + 1] =
        anchor[1];

      revealPositions[offset + 2] =
        anchor[2];

      phases[index] =
        random() * Math.PI * 2;
    }

    return {
      positions,
      basePositions,
      revealPositions,
      phases,
    };
  }, []);

  useFrame((state, delta) => {
    const points = pointsRef.current;

    if (!points) {
      return;
    }

    const safeDelta =
      Math.min(delta, 0.033);

    const easing =
      1 - Math.exp(-safeDelta * 2.6);

    const time =
      state.clock.elapsedTime;

    const {
      revealAmount,
      freedomAmount,
    } = getHeroTimeline(time);

    const interactionAmount =
      1 - revealAmount * 0.96;

    const freedomExpansion =
      1 + freedomAmount * 0.14;

    for (
      let index = 0;
      index < HERO_PARTICLE_COUNT;
      index += 1
    ) {
      const offset = index * 3;

      const phase =
        particleData.phases[index] ?? 0;

      const baseX =
        (particleData.basePositions[offset] ??
          0) *
        freedomExpansion;

      const baseY =
        (particleData.basePositions[
          offset + 1
        ] ?? 0) *
        freedomExpansion;

      const baseZ =
        particleData.basePositions[
          offset + 2
        ] ?? 0;

      const revealX =
        particleData.revealPositions[
          offset
        ] ?? 0;

      const revealY =
        particleData.revealPositions[
          offset + 1
        ] ?? 0;

      const revealZ =
        particleData.revealPositions[
          offset + 2
        ] ?? 1;

      /**
       * Sparks remain alive during Reveal, but their
       * motion is constrained to tiny edge glimmers.
       */
      const glimmerAmount =
        MathUtils.lerp(
          0.045,
          0.012,
          revealAmount,
        );

      const glimmerX =
        Math.sin(time * 1.1 + phase) *
        glimmerAmount;

      const glimmerY =
        Math.cos(time * 0.92 + phase) *
        glimmerAmount;

      const targetX =
        MathUtils.lerp(
          baseX,
          revealX,
          revealAmount,
        ) + glimmerX;

      const targetY =
        MathUtils.lerp(
          baseY,
          revealY,
          revealAmount,
        ) + glimmerY;

      const targetZ =
        MathUtils.lerp(
          baseZ,
          revealZ,
          revealAmount,
        );

      particleData.positions[offset] =
        MathUtils.lerp(
          particleData.positions[offset] ??
            0,
          targetX,
          easing,
        );

      particleData.positions[offset + 1] =
        MathUtils.lerp(
          particleData.positions[
            offset + 1
          ] ?? 0,
          targetY,
          easing,
        );

      particleData.positions[offset + 2] =
        MathUtils.lerp(
          particleData.positions[
            offset + 2
          ] ?? 0,
          targetZ,
          easing,
        );
    }

    if (positionAttributeRef.current) {
      positionAttributeRef.current.needsUpdate =
        true;
    }

    points.position.x = MathUtils.lerp(
      points.position.x,
      state.pointer.x *
        0.16 *
        interactionAmount,
      easing,
    );

    points.position.y = MathUtils.lerp(
      points.position.y,
      state.pointer.y *
        0.12 *
        interactionAmount,
      easing,
    );

    const targetRotation =
      time *
      0.018 *
      interactionAmount;

    points.rotation.z = MathUtils.lerp(
      points.rotation.z,
      targetRotation,
      easing,
    );

    const freePulse =
      1 +
      Math.sin(time * 0.55) *
        0.035 *
        interactionAmount;

    const revealPulse =
      1 +
      Math.sin(time * 2.3) *
        0.012 *
        revealAmount;

    const targetScale =
      freePulse * revealPulse;

    const nextScale =
      MathUtils.lerp(
        points.scale.x,
        targetScale,
        easing,
      );

    points.scale.setScalar(nextScale);

    if (materialRef.current) {
      /**
       * Foreground sparks become slightly cleaner and
       * brighter around the completed logo.
       */
      materialRef.current.opacity =
        MathUtils.lerp(
          0.68,
          0.86,
          revealAmount,
        );

      materialRef.current.size =
        MathUtils.lerp(
          0.085,
          0.064,
          revealAmount,
        );
    }
  });

  return (
    <points
      ref={pointsRef}
      frustumCulled={false}
    >
      <bufferGeometry>
        <bufferAttribute
          ref={positionAttributeRef}
          attach="attributes-position"
          args={[
            particleData.positions,
            3,
          ]}
        />
      </bufferGeometry>

      <pointsMaterial
        ref={materialRef}
        color="#ffffff"
        size={0.085}
        sizeAttenuation
        transparent
        opacity={0.68}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}