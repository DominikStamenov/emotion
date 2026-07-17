"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  MathUtils,
  type BufferAttribute,
  type Group,
  type PointsMaterial,
} from "three";

import { loadLogoMaskTargets } from "./engine/logo-mask";
import { getHeroTimeline } from "./engine/hero-timeline";
import { createLogoSolver, type LogoSolver } from "./engine/logo-solver";

const FULL_LOGO_PARTICLE_COUNT = 2100;
const COMPACT_LOGO_PARTICLE_COUNT = 1300;

const LOGO_SOURCE_URL = "/brand/emotion-mark.svg";

type LogoFormationProps = {
  compact?: boolean;
};

export function LogoFormation({ compact = false }: LogoFormationProps) {
  const particleCount = compact
    ? COMPACT_LOGO_PARTICLE_COUNT
    : FULL_LOGO_PARTICLE_COUNT;

  const formationGroupRef = useRef<Group>(null);

  const positionAttributeRef = useRef<BufferAttribute>(null);

  const glowPositionAttributeRef = useRef<BufferAttribute>(null);

  const materialRef = useRef<PointsMaterial>(null);

  const glowMaterialRef = useRef<PointsMaterial>(null);

  const [solver, setSolver] = useState<LogoSolver | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializeLogo() {
      try {
        const mask = await loadLogoMaskTargets({
          src: LOGO_SOURCE_URL,
          count: particleCount,
          seed: 126,
          resolution: 512,
          alphaThreshold: 12,
          edgeParticleShare: 0.46,
        });

        if (cancelled) {
          return;
        }

        const nextSolver = createLogoSolver({
          mask,
          seed: 126,
          scale: compact ? 0.62 : 0.52,
          depth: 1.4,
        });

        setSolver(nextSolver);
      } catch (error) {
        console.error("Failed to initialize eMotion logo formation.", error);
      }
    }

    void initializeLogo();

    return () => {
      cancelled = true;
    };
  }, [compact, particleCount]);

  useFrame((state, delta) => {
    if (!solver) {
      return;
    }

    const formationAmount = solver.update(
      state.clock.elapsedTime,
      state.pointer.x,
      state.pointer.y,
    );

    const { holdAmount } = getHeroTimeline(state.clock.elapsedTime);

    /**
     * Both particle geometries use the same position
     * array, but each BufferAttribute has its own GPU
     * buffer and therefore needs to be invalidated.
     */
    if (positionAttributeRef.current) {
      positionAttributeRef.current.needsUpdate = true;
    }

    if (glowPositionAttributeRef.current) {
      glowPositionAttributeRef.current.needsUpdate = true;
    }

    if (materialRef.current) {
      materialRef.current.opacity =
        MathUtils.lerp(0.05, 0.98, formationAmount) + holdAmount * 0.02;

      materialRef.current.size = MathUtils.lerp(0.008, 0.021, formationAmount);
    }

    if (glowMaterialRef.current) {
      glowMaterialRef.current.opacity =
        MathUtils.lerp(0, 0.16, formationAmount) *
        MathUtils.lerp(1, 0.88, holdAmount);

      glowMaterialRef.current.size =
        MathUtils.lerp(0.018, 0.058, formationAmount) *
        MathUtils.lerp(1, 0.94, holdAmount);
    }

    const formationGroup = formationGroupRef.current;

    if (!formationGroup) {
      return;
    }

    const safeDelta = Math.min(delta, 0.033);

    const easing = 1 - Math.exp(-safeDelta * 1.8);

    /**
     * The whole formation rotates as one object so the
     * sharp layer and the glow layer remain aligned.
     */
    formationGroup.rotation.y = MathUtils.lerp(
      formationGroup.rotation.y,
      state.pointer.x * 0.025 * (1 - formationAmount),
      easing,
    );

    formationGroup.rotation.x = MathUtils.lerp(
      formationGroup.rotation.x,
      -state.pointer.y * 0.018 * (1 - formationAmount),
      easing,
    );

    const pulse =
      1 +
      Math.sin(state.clock.elapsedTime * 1.25) *
        0.011 *
        formationAmount *
        MathUtils.lerp(1, 0.45, holdAmount);

    const nextScale = MathUtils.lerp(formationGroup.scale.x, pulse, easing);

    formationGroup.scale.setScalar(nextScale);
  });

  if (!solver) {
    return null;
  }

  return (
    <group ref={formationGroupRef} position={[0, 0.1, 0.55]}>
      {/* Sharp identity layer */}
      <points frustumCulled={false}>
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
          size={0.008}
          sizeAttenuation
          transparent
          opacity={0.05}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </points>

      {/* Soft energetic glow layer */}
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            ref={glowPositionAttributeRef}
            attach="attributes-position"
            args={[solver.positions, 3]}
          />

          <bufferAttribute
            attach="attributes-color"
            args={[solver.colors, 3]}
          />
        </bufferGeometry>

        <pointsMaterial
          ref={glowMaterialRef}
          vertexColors
          size={0.018}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          depthTest
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
