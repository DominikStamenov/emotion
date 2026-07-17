"use client";

/* eslint-disable react/no-unknown-property */

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  MathUtils,
  type Group,
  type MeshBasicMaterial,
} from "three";

import { getHeroTimeline } from "./engine/hero-timeline";
import { createRibbonEngine } from "./engine/ribbon-engine";

type RibbonBandProps = {
  color: string;
  seed: number;
  direction: -1 | 1;
  angle: number;
  length: number;
  amplitude: number;
  phase: number;
  width: number;
  opacity: number;
  points: number;
};

export function RibbonBand({
  color,
  seed,
  direction,
  angle,
  length,
  amplitude,
  phase,
  width,
  opacity,
  points,
}: RibbonBandProps) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<MeshBasicMaterial>(null);

  const engine = useMemo(
    () =>
      createRibbonEngine({
        amplitude,
        angle,
        direction,
        length,
        phase,
        pointsPerStrand: points,
        seed,
        spread: 0,
        strandCount: 1,
      }),
    [amplitude, angle, direction, length, phase, points, seed],
  );

  const { geometry, vertexAttribute } = useMemo(() => {
    const vertices = new Float32Array(points * 2 * 3);
    const indices = new Uint16Array((points - 1) * 6);

    for (let index = 0; index < points - 1; index += 1) {
      const vertex = index * 2;
      const offset = index * 6;

      indices[offset] = vertex;
      indices[offset + 1] = vertex + 1;
      indices[offset + 2] = vertex + 2;
      indices[offset + 3] = vertex + 1;
      indices[offset + 4] = vertex + 3;
      indices[offset + 5] = vertex + 2;
    }

    const nextGeometry = new BufferGeometry();
    const nextVertexAttribute = new BufferAttribute(vertices, 3);

    nextGeometry.setAttribute("position", nextVertexAttribute);
    nextGeometry.setIndex(new BufferAttribute(indices, 1));

    return {
      geometry: nextGeometry,
      vertexAttribute: nextVertexAttribute,
    };
  }, [points]);

  useEffect(
    () => () => {
      geometry.dispose();
    },
    [geometry],
  );

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const { revealAmount } = getHeroTimeline(time);
    const interactionAmount = 1 - revealAmount * 0.38;

    engine.update(
      state.pointer.x * interactionAmount,
      state.pointer.y * interactionAmount,
      time,
      delta,
    );

    const centers = engine.positions[0];

    if (!centers) {
      return;
    }

    const vertices = vertexAttribute.array as Float32Array;

    for (let index = 0; index < points; index += 1) {
      const progress = index / (points - 1);
      const centerOffset = index * 3;
      const previousOffset = Math.max(0, index - 1) * 3;
      const nextOffset = Math.min(points - 1, index + 1) * 3;

      const centerX = centers[centerOffset] ?? 0;
      const centerY = centers[centerOffset + 1] ?? 0;
      const centerZ = centers[centerOffset + 2] ?? 0;
      const tangentX =
        (centers[nextOffset] ?? 0) - (centers[previousOffset] ?? 0);
      const tangentY =
        (centers[nextOffset + 1] ?? 0) - (centers[previousOffset + 1] ?? 0);
      const tangentLength = Math.max(Math.hypot(tangentX, tangentY), 0.0001);
      const normalX = -tangentY / tangentLength;
      const normalY = tangentX / tangentLength;
      const envelope = 0.16 + Math.pow(Math.sin(progress * Math.PI), 0.62);
      const breathing =
        0.9 + Math.sin(time * 0.84 + phase + progress * 5.2) * 0.1;
      const halfWidth = width * envelope * breathing * 0.5;
      const vertexOffset = index * 6;
      const depthWave =
        Math.sin(progress * Math.PI * 2.2 + time * 0.48 + phase) * 0.035;

      vertices[vertexOffset] = centerX + normalX * halfWidth;
      vertices[vertexOffset + 1] = centerY + normalY * halfWidth;
      vertices[vertexOffset + 2] = centerZ - 0.2 + depthWave;
      vertices[vertexOffset + 3] = centerX - normalX * halfWidth;
      vertices[vertexOffset + 4] = centerY - normalY * halfWidth;
      vertices[vertexOffset + 5] = centerZ - 0.2 + depthWave;
    }

    vertexAttribute.needsUpdate = true;

    if (materialRef.current) {
      materialRef.current.opacity =
        opacity * MathUtils.lerp(1, 0.86, revealAmount);
    }

    const group = groupRef.current;

    if (group) {
      const easing = 1 - Math.exp(-Math.min(delta, 0.033) * 2.4);

      group.position.x = MathUtils.lerp(
        group.position.x,
        direction * revealAmount * 0.08,
        easing,
      );
      group.rotation.z = MathUtils.lerp(
        group.rotation.z,
        Math.sin(time * 0.28 + phase) * 0.025,
        easing,
      );
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} frustumCulled={false}>
        <meshBasicMaterial
          ref={materialRef}
          color={color}
          transparent
          opacity={opacity}
          side={DoubleSide}
          blending={AdditiveBlending}
          depthWrite={false}
          depthTest
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
