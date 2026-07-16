"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CatmullRomCurve3,
  MathUtils,
  Vector3,
  type Group,
} from "three";
import { Line } from "@react-three/drei";

type RibbonDefinition = {
  color: string;
  width: number;
  phase: number;
  amplitude: number;
  verticalOffset: number;
};

const RIBBONS: RibbonDefinition[] = [
  {
    color: "#f43f8d",
    width: 2.5,
    phase: 0,
    amplitude: 0.7,
    verticalOffset: 0.55,
  },
  {
    color: "#8b5cf6",
    width: 3,
    phase: Math.PI * 0.66,
    amplitude: 0.9,
    verticalOffset: 0,
  },
  {
    color: "#22d3ee",
    width: 2.2,
    phase: Math.PI * 1.25,
    amplitude: 0.72,
    verticalOffset: -0.5,
  },
];

function createRibbonPoints(
  phase: number,
  amplitude: number,
  verticalOffset: number,
) {
  const controlPoints: Vector3[] = [];

  for (let index = 0; index < 8; index += 1) {
    const progress = index / 7;
    const x = MathUtils.lerp(-3.4, 3.4, progress);

    const wave =
      Math.sin(progress * Math.PI * 2.2 + phase) * amplitude;

    const secondaryWave =
      Math.cos(progress * Math.PI * 3.4 + phase * 0.7) * 0.22;

    controlPoints.push(
      new Vector3(
        x,
        wave + secondaryWave + verticalOffset,
        Math.sin(progress * Math.PI * 1.8 + phase) * 0.65,
      ),
    );
  }

  const curve = new CatmullRomCurve3(
    controlPoints,
    false,
    "catmullrom",
    0.45,
  );

  return curve.getPoints(120);
}

export function RibbonSystem() {
  const groupRef = useRef<Group>(null);

  const ribbons = useMemo(
    () =>
      RIBBONS.map((ribbon) => ({
        ...ribbon,
        points: createRibbonPoints(
          ribbon.phase,
          ribbon.amplitude,
          ribbon.verticalOffset,
        ),
      })),
    [],
  );

  useFrame((state, delta) => {
    const group = groupRef.current;

    if (!group) return;

    const time = state.clock.elapsedTime;

    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      state.pointer.x * 0.08,
      1 - Math.exp(-delta * 1.8),
    );

    group.rotation.x = MathUtils.lerp(
      group.rotation.x,
      -state.pointer.y * 0.045,
      1 - Math.exp(-delta * 1.8),
    );

    group.position.y = Math.sin(time * 0.32) * 0.08;
    group.rotation.z = Math.sin(time * 0.16) * 0.035;
  });

  return (
    <group ref={groupRef}>
      {ribbons.map((ribbon) => (
        <Line
          key={ribbon.color}
          points={ribbon.points}
          color={ribbon.color}
          lineWidth={ribbon.width}
          transparent
          opacity={0.62}
          depthWrite={false}
        />
      ))}
    </group>
  );
}