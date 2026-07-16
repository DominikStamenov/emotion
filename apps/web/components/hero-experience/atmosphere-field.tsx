"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  MathUtils,
  type Group,
} from "three";

type AtmosphereLayerProps = {
  count: number;
  spread: [number, number, number];
  size: number;
  opacity: number;
  color: string;
  depth: number;
  parallax: number;
  speed: number;
};

function AtmosphereLayer({
  count,
  spread,
  size,
  opacity,
  color,
  depth,
  parallax,
  speed,
}: AtmosphereLayerProps) {
  const groupRef = useRef<Group>(null);

  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;

      values[offset] = (Math.random() - 0.5) * spread[0];
      values[offset + 1] = (Math.random() - 0.5) * spread[1];
      values[offset + 2] =
        (Math.random() - 0.5) * spread[2] + depth;
    }

    return values;
  }, [count, depth, spread]);

  useFrame((state, delta) => {
    const group = groupRef.current;

    if (!group) return;

    const easing = 1 - Math.exp(-delta * 1.6);
    const time = state.clock.elapsedTime;

    group.position.x = MathUtils.lerp(
      group.position.x,
      state.pointer.x * parallax,
      easing,
    );

    group.position.y = MathUtils.lerp(
      group.position.y,
      state.pointer.y * parallax * 0.72,
      easing,
    );

    group.rotation.z = Math.sin(time * speed) * 0.025;
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
          color={color}
          size={size}
          sizeAttenuation
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}

export function AtmosphereField() {
  return (
    <>
      <AtmosphereLayer
        count={1400}
        spread={[7.8, 5.7, 5.4]}
        size={0.008}
        opacity={0.2}
        color="#8b5cf6"
        depth={-1.8}
        parallax={0.035}
        speed={0.045}
      />

      <AtmosphereLayer
        count={780}
        spread={[7.2, 5.1, 3.8]}
        size={0.013}
        opacity={0.3}
        color="#f7f5fb"
        depth={-0.45}
        parallax={0.075}
        speed={0.062}
      />

      <AtmosphereLayer
        count={170}
        spread={[6.5, 4.7, 2.2]}
        size={0.026}
        opacity={0.34}
        color="#22d3ee"
        depth={0.75}
        parallax={0.13}
        speed={0.08}
      />
    </>
  );
}