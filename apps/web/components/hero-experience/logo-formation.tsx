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

import { createLogoSolver } from "./engine/logo-solver";

const LOGO_PARTICLE_COUNT = 1050;

export function LogoFormation() {
  const pointsRef = useRef<Points>(null);

  const positionAttributeRef =
    useRef<BufferAttribute>(null);

  const materialRef =
    useRef<PointsMaterial>(null);

  const solver = useMemo(
    () =>
      createLogoSolver({
        count: LOGO_PARTICLE_COUNT,
        seed: 126,
        scale: 1.05,
        depth: 1.4,
      }),
    [],
  );

  useFrame((state, delta) => {
    const formationAmount = solver.update(
      state.clock.elapsedTime,
      state.pointer.x,
      state.pointer.y,
    );

    if (positionAttributeRef.current) {
      positionAttributeRef.current.needsUpdate = true;
    }

    if (materialRef.current) {
      materialRef.current.opacity = MathUtils.lerp(
        0.08,
        0.92,
        formationAmount,
      );

      materialRef.current.size = MathUtils.lerp(
        0.012,
        0.032,
        formationAmount,
      );
    }

    const points = pointsRef.current;

    if (!points) return;

    const easing = 1 - Math.exp(-delta * 1.8);

    points.rotation.y = MathUtils.lerp(
      points.rotation.y,
      state.pointer.x *
        0.025 *
        (1 - formationAmount),
      easing,
    );

    points.rotation.x = MathUtils.lerp(
      points.rotation.x,
      -state.pointer.y *
        0.018 *
        (1 - formationAmount),
      easing,
    );

    const pulse =
      1 +
      Math.sin(state.clock.elapsedTime * 1.4) *
        0.012 *
        formationAmount;

    points.scale.setScalar(pulse);
  });

  return (
    <points ref={pointsRef} position={[0, 0, 0.55]}>
      <bufferGeometry>
        <bufferAttribute
          ref={positionAttributeRef}
          attach="attributes-position"
          args={[solver.positions, 3]}
        />

        <bufferAttribute
          attach="attributes-color"
          args={[solver.colors, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        ref={materialRef}
        vertexColors
        size={0.012}
        sizeAttenuation
        transparent
        opacity={0.08}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}