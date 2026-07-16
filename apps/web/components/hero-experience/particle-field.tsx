"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  MathUtils,
  type BufferAttribute,
  type Group,
  type Points,
  type PointsMaterial,
} from "three";

import { getHeroTimeline } from "./engine/hero-timeline";
import { useParticleEngine } from "./hooks/use-particle-engine";

export function ParticleField() {
  const groupRef = useRef<Group>(null);

  const basePointsRef = useRef<Points>(null);
  const basePositionAttributeRef =
    useRef<BufferAttribute>(null);
  const baseMaterialRef =
    useRef<PointsMaterial>(null);

  const heroPointsRef = useRef<Points>(null);
  const heroPositionAttributeRef =
    useRef<BufferAttribute>(null);
  const heroMaterialRef =
    useRef<PointsMaterial>(null);

  const baseEngine = useParticleEngine({
    count: 860,
    seed: 42,
    radiusMin: 0.2,
    radiusMax: 3.55,
    depth: 3.2,
    clusterPower: 2.15,
    interactionStrength: 7.2,
  });

  const heroEngine = useParticleEngine({
    count: 46,
    seed: 84,
    radiusMin: 0.1,
    radiusMax: 2.75,
    depth: 2.3,
    clusterPower: 1.75,
    interactionStrength: 8.5,
  });

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.033);
    const elapsedTime = state.clock.elapsedTime;

    const {
      revealAmount,
      dissolveAmount,
      freedomAmount,
    } = getHeroTimeline(elapsedTime);

    /**
     * Mouse influence is reduced while the identity is
     * forming so surrounding particles stop competing
     * with the logo.
     */
    const interactionAmount =
      1 - revealAmount * 0.92;

    baseEngine.update(
      state.pointer.x * interactionAmount,
      state.pointer.y * interactionAmount,
      safeDelta,
      elapsedTime,
    );

    heroEngine.update(
      state.pointer.x * interactionAmount,
      state.pointer.y * interactionAmount,
      safeDelta,
      elapsedTime,
    );

    if (basePositionAttributeRef.current) {
      basePositionAttributeRef.current.needsUpdate =
        true;
    }

    if (heroPositionAttributeRef.current) {
      heroPositionAttributeRef.current.needsUpdate =
        true;
    }

    const easing =
      1 - Math.exp(-safeDelta * 2.4);

    const group = groupRef.current;

    if (group) {
      const breathingStrength =
        MathUtils.lerp(
          0.028,
          0.006,
          revealAmount,
        );

      const breathing =
        1 +
        Math.sin(elapsedTime * 0.68) *
          breathingStrength;

      /**
       * A small scene contraction gives the impression
       * that environmental energy is being drawn toward
       * the forming eMotion identity.
       */
      const revealContraction =
        MathUtils.lerp(
          1,
          0.89,
          revealAmount,
        );

      /**
       * Near the end of the cycle, the field expands
       * again and returns to free motion.
       */
      const freedomExpansion =
        1 +
        freedomAmount * 0.055 +
        dissolveAmount *
          (1 - revealAmount) *
          0.018;

      const targetScale =
        breathing *
        revealContraction *
        freedomExpansion;

      const nextScale = MathUtils.lerp(
        group.scale.x,
        targetScale,
        easing,
      );

      group.scale.setScalar(nextScale);

      const rotationAvailability =
        1 - revealAmount * 0.88;

      const targetRotationY =
        Math.sin(elapsedTime * 0.09) *
        0.04 *
        rotationAvailability;

      const targetRotationX =
        Math.cos(elapsedTime * 0.075) *
        0.018 *
        rotationAvailability;

      group.rotation.y = MathUtils.lerp(
        group.rotation.y,
        targetRotationY,
        easing,
      );

      group.rotation.x = MathUtils.lerp(
        group.rotation.x,
        targetRotationX,
        easing,
      );

      group.position.z = MathUtils.lerp(
        group.position.z,
        -0.12 * revealAmount,
        easing,
      );
    }

    const basePoints = basePointsRef.current;

    if (basePoints) {
      const targetRotation =
        Math.sin(elapsedTime * 0.065) *
        0.025 *
        interactionAmount;

      basePoints.rotation.z = MathUtils.lerp(
        basePoints.rotation.z,
        targetRotation,
        easing,
      );
    }

    const heroPoints = heroPointsRef.current;

    if (heroPoints) {
      const targetRotation =
        Math.cos(elapsedTime * 0.08) *
        0.035 *
        interactionAmount;

      heroPoints.rotation.z = MathUtils.lerp(
        heroPoints.rotation.z,
        targetRotation,
        easing,
      );
    }

    /**
     * The deep particle layer becomes quiet and dark,
     * while a small number of larger sparks remain to
     * frame the logo.
     */
    if (baseMaterialRef.current) {
      baseMaterialRef.current.opacity =
        MathUtils.lerp(
          0.68,
          0.16,
          revealAmount,
        );

      baseMaterialRef.current.size =
        MathUtils.lerp(
          0.021,
          0.013,
          revealAmount,
        );
    }

    if (heroMaterialRef.current) {
      heroMaterialRef.current.opacity =
        MathUtils.lerp(
          0.88,
          0.34,
          revealAmount,
        );

      heroMaterialRef.current.size =
        MathUtils.lerp(
          0.052,
          0.034,
          revealAmount,
        );
    }
  });

  return (
    <group ref={groupRef}>
      <points
        ref={basePointsRef}
        frustumCulled={false}
      >
        <bufferGeometry>
          <bufferAttribute
            ref={basePositionAttributeRef}
            attach="attributes-position"
            args={[baseEngine.positions, 3]}
          />

          <bufferAttribute
            attach="attributes-color"
            args={[baseEngine.colors, 3]}
          />
        </bufferGeometry>

        <pointsMaterial
          ref={baseMaterialRef}
          vertexColors
          size={0.021}
          sizeAttenuation
          transparent
          opacity={0.68}
          depthWrite={false}
          toneMapped={false}
        />
      </points>

      <points
        ref={heroPointsRef}
        frustumCulled={false}
      >
        <bufferGeometry>
          <bufferAttribute
            ref={heroPositionAttributeRef}
            attach="attributes-position"
            args={[heroEngine.positions, 3]}
          />

          <bufferAttribute
            attach="attributes-color"
            args={[heroEngine.colors, 3]}
          />
        </bufferGeometry>

        <pointsMaterial
          ref={heroMaterialRef}
          vertexColors
          size={0.052}
          sizeAttenuation
          transparent
          opacity={0.88}
          depthWrite={false}
          toneMapped={false}
        />
      </points>
    </group>
  );
}