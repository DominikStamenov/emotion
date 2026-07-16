"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type {
  BufferAttribute,
  Group,
  Points,
} from "three";

import { useParticleEngine } from "./hooks/use-particle-engine";

export function ParticleField() {
  const groupRef = useRef<Group>(null);

  const basePointsRef = useRef<Points>(null);
  const basePositionAttributeRef =
    useRef<BufferAttribute>(null);

  const heroPointsRef = useRef<Points>(null);
  const heroPositionAttributeRef =
    useRef<BufferAttribute>(null);

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

    baseEngine.update(
      state.pointer.x,
      state.pointer.y,
      safeDelta,
      elapsedTime,
    );

    heroEngine.update(
      state.pointer.x,
      state.pointer.y,
      safeDelta,
      elapsedTime,
    );

    if (basePositionAttributeRef.current) {
      basePositionAttributeRef.current.needsUpdate = true;
    }

    if (heroPositionAttributeRef.current) {
      heroPositionAttributeRef.current.needsUpdate = true;
    }

    if (groupRef.current) {
      const breathing =
        1 + Math.sin(elapsedTime * 0.68) * 0.028;

      groupRef.current.scale.setScalar(breathing);

      groupRef.current.rotation.y =
        Math.sin(elapsedTime * 0.09) * 0.04;

      groupRef.current.rotation.x =
        Math.cos(elapsedTime * 0.075) * 0.018;
    }

    if (basePointsRef.current) {
      basePointsRef.current.rotation.z =
        Math.sin(elapsedTime * 0.065) * 0.025;
    }

    if (heroPointsRef.current) {
      heroPointsRef.current.rotation.z =
        Math.cos(elapsedTime * 0.08) * 0.035;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={basePointsRef}>
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
          vertexColors
          size={0.021}
          sizeAttenuation
          transparent
          opacity={0.68}
          depthWrite={false}
        />
      </points>

      <points ref={heroPointsRef}>
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
          vertexColors
          size={0.052}
          sizeAttenuation
          transparent
          opacity={0.88}
          depthWrite={false}
        />
      </points>
    </group>
  );
}