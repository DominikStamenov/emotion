"use client";

import { useMemo } from "react";

type ParticleEngineOptions = {
  count: number;
  seed: number;
  radiusMin: number;
  radiusMax: number;
  depth: number;
  clusterPower: number;
  interactionStrength: number;
};

type RgbColor = readonly [number, number, number];

const WHITE: RgbColor = [0.97, 0.96, 0.98];
const PINK: RgbColor = [0.96, 0.25, 0.55];
const VIOLET: RgbColor = [0.55, 0.36, 0.96];
const CYAN: RgbColor = [0.13, 0.83, 0.93];

function createRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10_000;
    return value - Math.floor(value);
  };
}

function mixColor(start: RgbColor, end: RgbColor, amount: number): RgbColor {
  const t = Math.max(0, Math.min(1, amount));

  return [
    start[0] + (end[0] - start[0]) * t,
    start[1] + (end[1] - start[1]) * t,
    start[2] + (end[2] - start[2]) * t,
  ];
}

function getParticleColor(normalizedRadius: number, angle: number): RgbColor {
  if (normalizedRadius < 0.18) {
    return mixColor(WHITE, VIOLET, normalizedRadius / 0.18);
  }

  if (normalizedRadius < 0.55) {
    return mixColor(VIOLET, PINK, (normalizedRadius - 0.18) / 0.37);
  }

  const directionalAmount = (Math.sin(angle + Math.PI * 0.25) + 1) * 0.5;

  return mixColor(PINK, CYAN, directionalAmount * 0.8);
}

export function useParticleEngine({
  count,
  seed,
  radiusMin,
  radiusMax,
  depth,
  clusterPower,
  interactionStrength,
}: ParticleEngineOptions) {
  return useMemo(() => {
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    const random = createRandom(seed);

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;

      const normalizedRadius = Math.pow(random(), clusterPower);
      const radius = radiusMin + normalizedRadius * (radiusMax - radiusMin);

      const angle = random() * Math.PI * 2;

      const x = Math.cos(angle) * radius + (random() - 0.5) * 0.55;

      const y = Math.sin(angle) * radius * 0.68 + (random() - 0.5) * 0.5;

      const z = (random() - 0.5) * depth * (0.45 + normalizedRadius * 0.55);

      positions[offset] = x;
      positions[offset + 1] = y;
      positions[offset + 2] = z;

      basePositions[offset] = x;
      basePositions[offset + 1] = y;
      basePositions[offset + 2] = z;

      phases[index] = random() * Math.PI * 2;

      const color = getParticleColor(normalizedRadius, angle);

      colors[offset] = color[0];
      colors[offset + 1] = color[1];
      colors[offset + 2] = color[2];
    }

    function update(
      pointerX: number,
      pointerY: number,
      delta: number,
      elapsedTime: number,
    ) {
      const cursorX = pointerX * 2.8;
      const cursorY = pointerY * 2;

      const springStrength = 2.15;
      const damping = Math.exp(-delta * 4.1);
      const interactionRadius = 1.35;
      const interactionRadiusSquared = interactionRadius * interactionRadius;

      for (let index = 0; index < count; index += 1) {
        const offset = index * 3;

        const x = positions[offset] ?? 0;
        const y = positions[offset + 1] ?? 0;
        const z = positions[offset + 2] ?? 0;

        const baseX = basePositions[offset] ?? 0;
        const baseY = basePositions[offset + 1] ?? 0;
        const baseZ = basePositions[offset + 2] ?? 0;

        const velocityX = velocities[offset] ?? 0;
        const velocityY = velocities[offset + 1] ?? 0;
        const velocityZ = velocities[offset + 2] ?? 0;

        const distanceX = x - cursorX;
        const distanceY = y - cursorY;

        const distanceSquared = distanceX * distanceX + distanceY * distanceY;

        let forceX = (baseX - x) * springStrength;
        let forceY = (baseY - y) * springStrength;
        let forceZ = (baseZ - z) * springStrength;

        if (
          distanceSquared > 0.0001 &&
          distanceSquared < interactionRadiusSquared
        ) {
          const distance = Math.sqrt(distanceSquared);
          const normalizedDistance = 1 - distance / interactionRadius;

          const repulsion =
            normalizedDistance * normalizedDistance * interactionStrength;

          forceX += (distanceX / distance) * repulsion;
          forceY += (distanceY / distance) * repulsion;

          const wave =
            Math.sin(elapsedTime * 5.5 - distance * 5 + (phases[index] ?? 0)) *
            normalizedDistance;

          forceZ += wave * 1.35;
        }

        const phase = phases[index] ?? 0;

        forceX += Math.sin(elapsedTime * 0.3 + phase) * 0.014;

        forceY += Math.cos(elapsedTime * 0.26 + phase) * 0.014;

        forceZ += Math.sin(elapsedTime * 0.22 + phase) * 0.01;

        velocities[offset] = (velocityX + forceX * delta) * damping;

        velocities[offset + 1] = (velocityY + forceY * delta) * damping;

        velocities[offset + 2] = (velocityZ + forceZ * delta) * damping;

        positions[offset] = x + (velocities[offset] ?? 0) * delta;

        positions[offset + 1] = y + (velocities[offset + 1] ?? 0) * delta;

        positions[offset + 2] = z + (velocities[offset + 2] ?? 0) * delta;
      }
    }

    return {
      positions,
      colors,
      update,
    };
  }, [
    clusterPower,
    count,
    depth,
    interactionStrength,
    radiusMax,
    radiusMin,
    seed,
  ]);
}
