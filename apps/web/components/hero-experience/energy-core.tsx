"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  MathUtils,
  type Group,
} from "three";

const CORE_PARTICLE_COUNT = 120;

export function EnergyCore() {
  const groupRef = useRef<Group>(null);

  const positions = useMemo(() => {
    const values = new Float32Array(CORE_PARTICLE_COUNT * 3);

    for (let index = 0; index < CORE_PARTICLE_COUNT; index += 1) {
      const offset = index * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 2.4) * 0.72;

      values[offset] = Math.cos(angle) * radius;
      values[offset + 1] = Math.sin(angle) * radius;
      values[offset + 2] = (Math.random() - 0.5) * 0.5;
    }

    return values;
  }, []);

  useFrame((state, delta) => {
    const group = groupRef.current;

    if (!group) return;

    const time = state.clock.elapsedTime;
    const easing = 1 - Math.exp(-delta * 2.2);

    group.position.x = MathUtils.lerp(
      group.position.x,
      state.pointer.x * 0.06,
      easing,
    );

    group.position.y = MathUtils.lerp(
      group.position.y,
      state.pointer.y * 0.045,
      easing,
    );

    group.rotation.z = time * 0.055;
    group.rotation.y = Math.sin(time * 0.18) * 0.16;

    const pulse =
      1 +
      Math.sin(time * 0.68) * 0.08 +
      Math.sin(time * 0.21) * 0.035;

    group.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>

        <pointsMaterial
          color="#ffffff"
          size={0.028}
          sizeAttenuation
          transparent
          opacity={0.48}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>

      <pointLight
        color="#f43f8d"
        intensity={2.2}
        distance={4.2}
        decay={2}
        position={[-0.16, 0.08, 0.35]}
      />

      <pointLight
        color="#8b5cf6"
        intensity={2.8}
        distance={4.6}
        decay={2}
        position={[0, 0, 0.25]}
      />

      <pointLight
        color="#22d3ee"
        intensity={1.8}
        distance={4}
        decay={2}
        position={[0.18, -0.1, 0.4]}
      />
    </group>
  );
}