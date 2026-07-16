"use client";

import { useMemo } from "react";

const PARTICLE_COLORS = [
  [0.97, 0.96, 0.98],
  [0.96, 0.25, 0.55],
  [0.55, 0.36, 0.96],
  [0.13, 0.83, 0.93],
] as const;

function createRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10_000;
    return value - Math.floor(value);
  };
}

export function useParticleEngine(count: number) {
  return useMemo(() => {
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    const random = createRandom(42);

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;

      const radius = 0.8 + random() * 2.8;
      const angle = random() * Math.PI * 2;
      const depth = (random() - 0.5) * 3.2;

      const x =
        Math.cos(angle) * radius +
        (random() - 0.5) * 1.4;

      const y =
        Math.sin(angle) * radius * 0.68 +
        (random() - 0.5) * 1.2;

      positions[offset] = x;
      positions[offset + 1] = y;
      positions[offset + 2] = depth;

      basePositions[offset] = x;
      basePositions[offset + 1] = y;
      basePositions[offset + 2] = depth;

      phases[index] = random() * Math.PI * 2;

      const color =
        PARTICLE_COLORS[
          Math.floor(random() * PARTICLE_COLORS.length)
        ] ?? PARTICLE_COLORS[0];

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

      const springStrength = 2.2;
      const damping = Math.exp(-delta * 3.8);
      const interactionRadius = 1.25;
      const interactionRadiusSquared =
        interactionRadius * interactionRadius;

      for (let index = 0; index < count; index += 1) {
        const offset = index * 3;

        const x = positions[offset];
        const y = positions[offset + 1];

        const baseX = basePositions[offset];
        const baseY = basePositions[offset + 1];
        const baseZ = basePositions[offset + 2];

        const velocityX = velocities[offset];
        const velocityY = velocities[offset + 1];
        const velocityZ = velocities[offset + 2];

        if (
          x === undefined ||
          y === undefined ||
          baseX === undefined ||
          baseY === undefined ||
          baseZ === undefined ||
          velocityX === undefined ||
          velocityY === undefined ||
          velocityZ === undefined
        ) {
          continue;
        }

        const distanceX = x - cursorX;
        const distanceY = y - cursorY;
        const distanceSquared =
          distanceX * distanceX + distanceY * distanceY;

        let forceX = (baseX - x) * springStrength;
        let forceY = (baseY - y) * springStrength;
        let forceZ =
          (baseZ - (positions[offset + 2] ?? baseZ)) *
          springStrength;

        if (
          distanceSquared > 0.0001 &&
          distanceSquared < interactionRadiusSquared
        ) {
          const distance = Math.sqrt(distanceSquared);
          const strength =
            (1 - distance / interactionRadius) * 7;

          forceX += (distanceX / distance) * strength;
          forceY += (distanceY / distance) * strength;
        }

        const phase = phases[index] ?? 0;

        forceX += Math.sin(elapsedTime * 0.34 + phase) * 0.018;
        forceY += Math.cos(elapsedTime * 0.28 + phase) * 0.018;
        forceZ += Math.sin(elapsedTime * 0.22 + phase) * 0.012;

        velocities[offset] = (velocityX + forceX * delta) * damping;
        velocities[offset + 1] =
          (velocityY + forceY * delta) * damping;
        velocities[offset + 2] =
          (velocityZ + forceZ * delta) * damping;

        positions[offset] =
          x + (velocities[offset] ?? 0) * delta;

        positions[offset + 1] =
          y + (velocities[offset + 1] ?? 0) * delta;

        positions[offset + 2] =
          (positions[offset + 2] ?? baseZ) +
          (velocities[offset + 2] ?? 0) * delta;
      }
    }

    return {
      positions,
      colors,
      update,
    };
  }, [count]);
}