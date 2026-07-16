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
    strandCount: number;
    strandSpread: number;
  };
  const RIBBONS: RibbonDefinition[] = [
    {
      color: "#f43f8d",
      width: 1.8,
      phase: 0,
      amplitude: 0.7,
      verticalOffset: 0.55,
      strandCount: 7,
      strandSpread: 0.16,
    },
    {
      color: "#8b5cf6",
      width: 2.1,
      phase: Math.PI * 0.66,
      amplitude: 0.9,
      verticalOffset: 0,
      strandCount: 9,
      strandSpread: 0.2,
    },
    {
      color: "#22d3ee",
      width: 1.6,
      phase: Math.PI * 1.25,
      amplitude: 0.72,
      verticalOffset: -0.5,
      strandCount: 6,
      strandSpread: 0.14,
    },
  ]; 
   
  function createRibbonStrands(ribbon: RibbonDefinition) {
    return Array.from(
      { length: ribbon.strandCount },
      (_, strandIndex) => {
        const center = (ribbon.strandCount - 1) / 2;
        const strandOffset =
          (strandIndex - center) * ribbon.strandSpread;
  
        return {
          id: `${ribbon.color}-${strandIndex}`,
          width:
            ribbon.width *
            (1 - Math.abs(strandIndex - center) * 0.08),
          opacity:
            0.16 +
            (1 -
              Math.abs(strandIndex - center) /
                Math.max(center, 1)) *
              0.34,
          points: createRibbonPoints(
            ribbon.phase + strandIndex * 0.045,
            ribbon.amplitude + strandOffset * 0.32,
            ribbon.verticalOffset + strandOffset,
          ),
        };
      },
    );
  }

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
        strands: createRibbonStrands(ribbon),
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
      {ribbons.flatMap((ribbon) =>
  ribbon.strands.map((strand) => (
    <Line
      key={strand.id}
      points={strand.points}
      color={ribbon.color}
      lineWidth={strand.width}
      transparent
      opacity={strand.opacity}
      depthWrite={false}
    />
  )),
)}
    </group>
  );
}