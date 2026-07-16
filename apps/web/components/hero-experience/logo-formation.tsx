"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  MathUtils,
  type BufferAttribute,
  type Points,
  type PointsMaterial,
} from "three";

import {
  createLogoSolver,
  type LogoSolver,
} from "./engine/logo-solver";
import { loadLogoMaskTargets } from "./engine/logo-mask";

const LOGO_PARTICLE_COUNT = 1400;
const LOGO_SOURCE_URL =
  "/brand/emotion-mark.svg";

export function LogoFormation() {
  const pointsRef = useRef<Points>(null);

  const positionAttributeRef =
    useRef<BufferAttribute>(null);

  const materialRef =
    useRef<PointsMaterial>(null);

  const [solver, setSolver] =
    useState<LogoSolver | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializeLogo() {
      try {
        const mask =
          await loadLogoMaskTargets({
            src: LOGO_SOURCE_URL,
            count: LOGO_PARTICLE_COUNT,
            seed: 126,
            resolution: 512,
            alphaThreshold: 12,
            edgeParticleShare: 0.38,
          });

        if (cancelled) {
          return;
        }

        setSolver(
          createLogoSolver({
            mask,
            seed: 126,
            scale: 1.05,
            depth: 1.4,
          }),
        );
      } catch (error) {
        console.error(
          "Failed to initialize eMotion logo formation.",
          error,
        );
      }
    }

    void initializeLogo();

    return () => {
      cancelled = true;
    };
  }, []);

  useFrame((state, delta) => {
    if (!solver) {
      return;
    }

    const formationAmount = solver.update(
      state.clock.elapsedTime,
      state.pointer.x,
      state.pointer.y,
    );

    if (positionAttributeRef.current) {
      positionAttributeRef.current.needsUpdate =
        true;
    }

    if (materialRef.current) {
      materialRef.current.opacity =
        MathUtils.lerp(
          0.06,
          0.94,
          formationAmount,
        );

      materialRef.current.size =
        MathUtils.lerp(
          0.011,
          0.029,
          formationAmount,
        );
    }

    const points = pointsRef.current;

    if (!points) {
      return;
    }

    const easing =
      1 - Math.exp(-delta * 1.8);

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
      Math.sin(
        state.clock.elapsedTime * 1.4,
      ) *
        0.008 *
        formationAmount;

    points.scale.setScalar(pulse);
  });

  if (!solver) {
    return null;
  }

  return (
    <points
      ref={pointsRef}
      position={[0, 0, 0.55]}
      frustumCulled={false}
    >
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
        size={0.011}
        sizeAttenuation
        transparent
        opacity={0.06}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}