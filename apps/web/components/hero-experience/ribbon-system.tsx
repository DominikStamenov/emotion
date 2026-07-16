"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  MathUtils,
  type Group,
} from "three";

import { createRibbonEngine } from "./engine/ribbon-engine";

type LivingRibbonProps = {
  color: string;
  seed: number;
  direction: -1 | 1;
  angle: number;
  length: number;
  strandCount: number;
  amplitude: number;
  spread: number;
  phase: number;
  opacity: number;
};

const POINTS_PER_STRAND = 112;

function LivingRibbon({
  color,
  seed,
  direction,
  angle,
  length,
  strandCount,
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
        direction,
        angle,
        length,
        amplitude,
        spread,
        phase,
      }),
    [
      amplitude,
      angle,
      direction,
      length,
      phase,
      seed,
      spread,
      strandCount,
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
          opacity: opacity * (1 - normalizedDistance * 0.72),
          blending: AdditiveBlending,
          depthWrite: false,
          depthTest: true,
        });

        return new Line(geometry, material);
      }),
    [color, engine.positions, opacity, strandCount],
  );

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    engine.update(
      state.pointer.x,
      state.pointer.y,
      time,
      delta,
    );

    lines.forEach((line) => {
      const positionAttribute =
        line.geometry.getAttribute("position");

      positionAttribute.needsUpdate = true;
    });

    const group = groupRef.current;

    if (!group) return;

    const easing = 1 - Math.exp(-delta * 1.7);

    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      state.pointer.x * 0.035,
      easing,
    );

    group.rotation.x = MathUtils.lerp(
      group.rotation.x,
      -state.pointer.y * 0.022,
      easing,
    );

    group.rotation.z =
      Math.sin(time * 0.12 + phase) * 0.025;
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, index) => (
        <primitive
          key={`${color}-${direction}-${index}`}
          object={line}
        />
      ))}
    </group>
  );
}

export function RibbonSystem() {
  return (
    <group>
      {/* Pink energy — upper left and lower right */}
      <LivingRibbon
        color="#f43f8d"
        seed={21}
        direction={-1}
        angle={0.28}
        length={3.15}
        strandCount={16}
        amplitude={0.52}
        spread={0.022}
        phase={0}
        opacity={0.42}
      />

      <LivingRibbon
        color="#f43f8d"
        seed={22}
        direction={1}
        angle={0.42}
        length={2.65}
        strandCount={11}
        amplitude={0.42}
        spread={0.024}
        phase={Math.PI * 0.8}
        opacity={0.25}
      />

      {/* Violet energy — dominant central flow */}
      <LivingRibbon
        color="#8b5cf6"
        seed={42}
        direction={-1}
        angle={-0.12}
        length={2.75}
        strandCount={18}
        amplitude={0.6}
        spread={0.021}
        phase={Math.PI * 0.62}
        opacity={0.45}
      />

      <LivingRibbon
        color="#8b5cf6"
        seed={43}
        direction={1}
        angle={-0.18}
        length={3.05}
        strandCount={18}
        amplitude={0.58}
        spread={0.021}
        phase={Math.PI * 1.18}
        opacity={0.4}
      />

      {/* Cyan energy — lower depth layer */}
      <LivingRibbon
        color="#22d3ee"
        seed={84}
        direction={-1}
        angle={-0.52}
        length={2.5}
        strandCount={10}
        amplitude={0.4}
        spread={0.025}
        phase={Math.PI * 1.4}
        opacity={0.27}
      />

      <LivingRibbon
        color="#22d3ee"
        seed={85}
        direction={1}
        angle={-0.36}
        length={3.2}
        strandCount={14}
        amplitude={0.48}
        spread={0.023}
        phase={Math.PI * 1.72}
        opacity={0.35}
      />
    </group>
  );
}