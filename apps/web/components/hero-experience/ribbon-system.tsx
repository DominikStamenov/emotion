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

import { getHeroTimeline } from "./engine/hero-timeline";
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

const REVEAL_OPACITY = 0.2;
const REVEAL_HORIZONTAL_OFFSET = 0.3;
const REVEAL_DEPTH_OFFSET = -0.16;

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

        const distanceFromCenter = Math.abs(
          index - center,
        );

        const normalizedDistance =
          distanceFromCenter /
          Math.max(center, 1);

        const baseOpacity =
          opacity *
          (1 - normalizedDistance * 0.72);

        const material = new LineBasicMaterial({
          color,
          transparent: true,
          opacity: baseOpacity,
          blending: AdditiveBlending,
          depthWrite: false,
          depthTest: true,
        });

        material.userData.baseOpacity =
          baseOpacity;

        return new Line(geometry, material);
      }),
    [
      color,
      engine.positions,
      opacity,
      strandCount,
    ],
  );

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    const {
      formationAmount,
      revealAmount,
    } = getHeroTimeline(time);

    /**
     * Ribbon interaction becomes quieter while the
     * eMotion identity is being revealed.
     */
    const interactionAmount =
      1 - revealAmount * 0.88;

    engine.update(
      state.pointer.x * interactionAmount,
      state.pointer.y * interactionAmount,
      time,
      delta,
    );

    const visibility = MathUtils.lerp(
      1,
      REVEAL_OPACITY,
      revealAmount,
    );

    lines.forEach((line) => {
      const positionAttribute =
        line.geometry.getAttribute("position");

      positionAttribute.needsUpdate = true;

      const baseOpacity =
        typeof line.material.userData
          .baseOpacity === "number"
          ? line.material.userData.baseOpacity
          : opacity;

      line.material.opacity =
        baseOpacity * visibility;
    });

    const group = groupRef.current;

    if (!group) {
      return;
    }

    const easing =
      1 - Math.exp(-delta * 2.2);

    /**
     * During Reveal, left and right ribbons separate
     * and create a clean visual window around the logo.
     */
    const targetX =
      direction *
      REVEAL_HORIZONTAL_OFFSET *
      revealAmount;

    const targetY =
      Math.sin(angle) *
      0.1 *
      revealAmount;

    const targetZ =
      REVEAL_DEPTH_OFFSET *
      revealAmount;

    group.position.x = MathUtils.lerp(
      group.position.x,
      targetX,
      easing,
    );

    group.position.y = MathUtils.lerp(
      group.position.y,
      targetY,
      easing,
    );

    group.position.z = MathUtils.lerp(
      group.position.z,
      targetZ,
      easing,
    );

    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      state.pointer.x *
        0.035 *
        interactionAmount,
      easing,
    );

    group.rotation.x = MathUtils.lerp(
      group.rotation.x,
      -state.pointer.y *
        0.022 *
        interactionAmount,
      easing,
    );

    const autonomousRotation =
      Math.sin(time * 0.12 + phase) *
      0.025 *
      interactionAmount;

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
      1 - revealAmount * 0.075,
      easing,
    );

    group.scale.z = MathUtils.lerp(
      group.scale.z,
      1,
      easing,
    );
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