"use client";

import { useEffect, useMemo, useRef } from "react";
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

import { getHeroTimeline } from "./engine/hero-timeline";
import { createRibbonEngine } from "./engine/ribbon-engine";
import { RibbonBand } from "./ribbon-band";

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
  pointsPerStrand: number;
};

const REVEAL_OPACITY = 1.04;
const REVEAL_HORIZONTAL_OFFSET = 0.12;
const REVEAL_DEPTH_OFFSET = -0.08;

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
  pointsPerStrand,
}: LivingRibbonProps) {
  const groupRef = useRef<Group>(null);

  const engine = useMemo(
    () =>
      createRibbonEngine({
        strandCount,
        pointsPerStrand,
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
      pointsPerStrand,
      seed,
      spread,
      strandCount,
    ],
  );

  const lines = useMemo(
    () =>
      engine.positions.map((positions, index) => {
        const geometry = new BufferGeometry();

        geometry.setAttribute("position", new BufferAttribute(positions, 3));

        const center = (strandCount - 1) / 2;

        const distanceFromCenter = Math.abs(index - center);

        const normalizedDistance = distanceFromCenter / Math.max(center, 1);

        const baseOpacity = opacity * (1 - normalizedDistance * 0.52);

        const material = new LineBasicMaterial({
          color,
          transparent: true,
          opacity: baseOpacity,
          blending: AdditiveBlending,
          depthWrite: false,
          depthTest: true,
          toneMapped: false,
        });

        material.userData.baseOpacity = baseOpacity;

        return new Line(geometry, material);
      }),
    [color, engine.positions, opacity, strandCount],
  );

  useEffect(
    () => () => {
      lines.forEach((line) => {
        line.geometry.dispose();
        line.material.dispose();
      });
    },
    [lines],
  );

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    const { revealAmount } = getHeroTimeline(time);

    /**
     * Ribbon interaction becomes quieter while the
     * eMotion identity is being revealed.
     */
    const interactionAmount = 1 - revealAmount * 0.34;

    engine.update(
      state.pointer.x * interactionAmount,
      state.pointer.y * interactionAmount,
      time,
      delta,
    );

    const visibility = MathUtils.lerp(1, REVEAL_OPACITY, revealAmount);

    lines.forEach((line) => {
      const positionAttribute = line.geometry.getAttribute("position");

      positionAttribute.needsUpdate = true;

      const baseOpacity =
        typeof line.material.userData.baseOpacity === "number"
          ? line.material.userData.baseOpacity
          : opacity;

      line.material.opacity = baseOpacity * visibility;
    });

    const group = groupRef.current;

    if (!group) {
      return;
    }

    const easing = 1 - Math.exp(-delta * 2.2);

    /**
     * During Reveal, left and right ribbons separate
     * and create a clean visual window around the logo.
     */
    const targetX = direction * REVEAL_HORIZONTAL_OFFSET * revealAmount;

    const targetY = Math.sin(angle) * 0.1 * revealAmount;

    const targetZ = REVEAL_DEPTH_OFFSET * revealAmount;

    group.position.x = MathUtils.lerp(group.position.x, targetX, easing);

    group.position.y = MathUtils.lerp(group.position.y, targetY, easing);

    group.position.z = MathUtils.lerp(group.position.z, targetZ, easing);

    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      state.pointer.x * 0.052 * interactionAmount,
      easing,
    );

    group.rotation.x = MathUtils.lerp(
      group.rotation.x,
      -state.pointer.y * 0.038 * interactionAmount,
      easing,
    );

    const autonomousRotation =
      Math.sin(time * 0.32 + phase) * 0.045 * interactionAmount;

    group.rotation.z = MathUtils.lerp(
      group.rotation.z,
      autonomousRotation,
      easing,
    );

    /**
     * Slight horizontal expansion reinforces the idea
     * that energy is opening to reveal the identity.
     */
    group.scale.x = MathUtils.lerp(
      group.scale.x,
      1 + revealAmount * 0.055,
      easing,
    );

    group.scale.y = MathUtils.lerp(
      group.scale.y,
      1 - revealAmount * 0.035,
      easing,
    );

    group.scale.z = MathUtils.lerp(group.scale.z, 1, easing);
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, index) => (
        <primitive key={`${color}-${direction}-${index}`} object={line} />
      ))}
    </group>
  );
}

type RibbonSystemProps = {
  compact?: boolean;
};

export function RibbonSystem({ compact = false }: RibbonSystemProps) {
  const pointsPerStrand = compact ? 72 : 112;
  const bandPoints = compact ? 64 : 96;

  return (
    <group>
      <RibbonBand
        color="#ff168f"
        seed={321}
        direction={-1}
        angle={0.03}
        length={4.9}
        amplitude={0.38}
        phase={0.2}
        width={compact ? 0.25 : 0.34}
        opacity={0.34}
        points={bandPoints}
      />
      <RibbonBand
        color="#d629ff"
        seed={322}
        direction={-1}
        angle={-0.075}
        length={4.25}
        amplitude={0.46}
        phase={1.6}
        width={compact ? 0.21 : 0.3}
        opacity={0.3}
        points={bandPoints}
      />
      <RibbonBand
        color="#8b5cf6"
        seed={323}
        direction={1}
        angle={0.02}
        length={4.2}
        amplitude={0.42}
        phase={2.4}
        width={compact ? 0.23 : 0.32}
        opacity={0.3}
        points={bandPoints}
      />
      <RibbonBand
        color="#12dfff"
        seed={324}
        direction={1}
        angle={-0.08}
        length={4.9}
        amplitude={0.36}
        phase={4.1}
        width={compact ? 0.24 : 0.34}
        opacity={0.34}
        points={bandPoints}
      />

      {/* Pink energy — upper left and lower right */}
      <LivingRibbon
        color="#f43f8d"
        seed={21}
        direction={-1}
        angle={0.02}
        length={4.7}
        strandCount={compact ? 14 : 28}
        amplitude={0.4}
        spread={0.022}
        phase={0}
        opacity={0.95}
        pointsPerStrand={pointsPerStrand}
      />

      <LivingRibbon
        color="#f43f8d"
        seed={22}
        direction={1}
        angle={0.08}
        length={3.8}
        strandCount={compact ? 10 : 18}
        amplitude={0.34}
        spread={0.024}
        phase={Math.PI * 0.8}
        opacity={0.68}
        pointsPerStrand={pointsPerStrand}
      />

      {/* Violet energy — dominant central flow */}
      <LivingRibbon
        color="#8b5cf6"
        seed={42}
        direction={-1}
        angle={-0.06}
        length={4.2}
        strandCount={compact ? 14 : 26}
        amplitude={0.43}
        spread={0.021}
        phase={Math.PI * 0.62}
        opacity={0.9}
        pointsPerStrand={pointsPerStrand}
      />

      <LivingRibbon
        color="#8b5cf6"
        seed={43}
        direction={1}
        angle={-0.04}
        length={4.25}
        strandCount={compact ? 14 : 26}
        amplitude={0.42}
        spread={0.021}
        phase={Math.PI * 1.18}
        opacity={0.84}
        pointsPerStrand={pointsPerStrand}
      />

      {/* Cyan energy — lower depth layer */}
      <LivingRibbon
        color="#22d3ee"
        seed={84}
        direction={-1}
        angle={-0.12}
        length={3.25}
        strandCount={compact ? 8 : 14}
        amplitude={0.3}
        spread={0.025}
        phase={Math.PI * 1.4}
        opacity={0.6}
        pointsPerStrand={pointsPerStrand}
      />

      <LivingRibbon
        color="#22d3ee"
        seed={85}
        direction={1}
        angle={-0.07}
        length={4.8}
        strandCount={compact ? 14 : 28}
        amplitude={0.38}
        spread={0.023}
        phase={Math.PI * 1.72}
        opacity={0.94}
        pointsPerStrand={pointsPerStrand}
      />
    </group>
  );
}
