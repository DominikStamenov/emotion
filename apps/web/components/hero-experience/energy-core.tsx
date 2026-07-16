"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  MathUtils,
  type Group,
} from "three";

export function EnergyCore() {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    const group = groupRef.current;

    if (!group) return;

    const time = state.clock.elapsedTime;
    const easing = 1 - Math.exp(-delta * 2.4);

    group.position.x = MathUtils.lerp(
      group.position.x,
      state.pointer.x * 0.08,
      easing,
    );

    group.position.y = MathUtils.lerp(
      group.position.y,
      state.pointer.y * 0.06,
      easing,
    );

    group.rotation.z = time * 0.035;

    const pulse =
      1 +
      Math.sin(time * 0.72) * 0.045 +
      Math.sin(time * 0.21) * 0.025;

    group.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <circleGeometry args={[0.48, 64]} />

        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.055}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 0, 0.02]}>
        <ringGeometry args={[0.18, 0.38, 64]} />

        <meshBasicMaterial
          color="#f43f8d"
          transparent
          opacity={0.085}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 0, 0.04]}>
        <circleGeometry args={[0.085, 48]} />

        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <pointLight
        color="#f43f8d"
        intensity={3.5}
        distance={4.8}
        decay={2}
      />

      <pointLight
        color="#22d3ee"
        intensity={2.4}
        distance={4.2}
        decay={2}
        position={[0.16, -0.08, 0.35]}
      />
    </group>
  );
}