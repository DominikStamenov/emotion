"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  type Group,
} from "three";

import { createRibbonEngine } from "./engine/ribbon-engine";

type LivingRibbonProps = {
  color: string;
  seed: number;
  strandCount: number;
  verticalOffset: number;
  amplitude: number;
  spread: number;
  phase: number;
  opacity: number;
};

const POINTS_PER_STRAND = 96;

function LivingRibbon({
  color,
  seed,
  strandCount,
  verticalOffset,
  amplitude,
  spread,
  phase,
  opacity,
}: LivingRibbonProps) {
  const groupRef = useRef<Group>(null);

  const engine = useMemo(
    () =>
      createRibbonEngine({
        strandCount,
        pointsPerStrand: POINTS_PER_STRAND,
        seed,
        verticalOffset,
        amplitude,
        spread,
        phase,
      }),
    [
      amplitude,
      phase,
      seed,
      spread,
      strandCount,
      verticalOffset,
    ],
  );

  const lines = useMemo(
    () =>
      engine.positions.map((positions, index) => {
        const geometry = new BufferGeometry();

        geometry.setAttribute(
          "position",
          new BufferAttribute(positions, 3),
        );

        const center = (strandCount - 1) / 2;
        const distanceFromCenter = Math.abs(index - center);
        const normalizedDistance =
          distanceFromCenter / Math.max(center, 1);

        const material = new LineBasicMaterial({
          color,
          transparent: true,
          opacity: opacity * (1 - normalizedDistance * 0.68),
          blending: AdditiveBlending,
          depthWrite: false,
        });

        return new Line(geometry, material);
      }),
    [color, engine.positions, opacity, strandCount],
  );

  useFrame((state, delta) => {
    engine.update(
      state.pointer.x,
      state.pointer.y,
      state.clock.elapsedTime,
      delta,
    );

    lines.forEach((line) => {
      const positionAttribute =
        line.geometry.getAttribute("position");

      positionAttribute.needsUpdate = true;
      line.geometry.computeBoundingSphere();
    });

    if (groupRef.current) {
      groupRef.current.rotation.y =
        state.pointer.x * 0.025;

      groupRef.current.rotation.x =
        -state.pointer.y * 0.015;
    }
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, index) => (
        <primitive
          key={`${color}-${index}`}
          object={line}
        />
      ))}
    </group>
  );
}

export function RibbonSystem() {
  return (
    <group>
      <LivingRibbon
        color="#f43f8d"
        seed={21}
        strandCount={15}
        verticalOffset={0.55}
        amplitude={0.72}
        spread={0.026}
        phase={0}
        opacity={0.36}
      />

      <LivingRibbon
        color="#8b5cf6"
        seed={42}
        strandCount={19}
        verticalOffset={0}
        amplitude={0.88}
        spread={0.025}
        phase={Math.PI * 0.66}
        opacity={0.4}
      />

      <LivingRibbon
        color="#22d3ee"
        seed={84}
        strandCount={13}
        verticalOffset={-0.55}
        amplitude={0.68}
        spread={0.028}
        phase={Math.PI * 1.24}
        opacity={0.34}
      />
    </group>
  );
}