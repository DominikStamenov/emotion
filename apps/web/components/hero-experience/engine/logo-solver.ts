import { MathUtils } from "three";  
import {
  getLogoFormationAmount,
} from "./hero-timeline";

import type { LogoMaskTargets } from "./logo-mask";

type LogoSolverOptions = {
  mask: LogoMaskTargets;
  seed: number;
  scale: number;
  depth: number;
};

export type LogoSolver = {
  positions: Float32Array;
  colors: Float32Array;
  update: (
    elapsedTime: number,
    pointerX: number,
    pointerY: number,
  ) => number;
};



function createRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10_000;

    return value - Math.floor(value);
  };
}
function smoothRange(
  value: number,
  start: number,
  end: number,
) {
  return MathUtils.smoothstep(
    value,
    start,
    end,
  );
}

export function createLogoSolver({
  mask,
  seed,
  scale,
  depth,
}: LogoSolverOptions): LogoSolver {
  const count = mask.count;

  if (
    mask.positions.length !== count * 2 ||
    mask.colors.length !== count * 3 ||
    mask.edgeStrengths.length !== count
  ) {
    throw new Error(
      "Logo mask data has invalid dimensions.",
    );
  }

  const random = createRandom(seed);

  const positions =
    new Float32Array(count * 3);

  const scatterPositions =
    new Float32Array(count * 3);

  const targetPositions =
    new Float32Array(count * 3);

  const colors =
    new Float32Array(mask.colors);

  const phases =
    new Float32Array(count);

  const formationDelays =
    new Float32Array(count);

  const edgeStrengths =
    new Float32Array(mask.edgeStrengths);

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const offset = index * 3;
    const maskOffset = index * 2;

    const edgeStrength =
      edgeStrengths[index] ?? 0;

    targetPositions[offset] =
      (mask.positions[maskOffset] ?? 0) *
      scale;

    targetPositions[offset + 1] =
      (mask.positions[maskOffset + 1] ?? 0) *
      scale;

    targetPositions[offset + 2] =
      (random() - 0.5) *
      depth *
      0.065;

    const scatterAngle =
      random() * Math.PI * 2;

    const scatterRadius =
      1.35 +
      Math.pow(random(), 0.68) * 2.4;

    const scatterX =
      Math.cos(scatterAngle) *
      scatterRadius;

    const scatterY =
      Math.sin(scatterAngle) *
      scatterRadius *
      0.74;

    const scatterZ =
      (random() - 0.5) * depth;

    scatterPositions[offset] = scatterX;
    scatterPositions[offset + 1] = scatterY;
    scatterPositions[offset + 2] = scatterZ;

    positions[offset] = scatterX;
    positions[offset + 1] = scatterY;
    positions[offset + 2] = scatterZ;

    phases[index] =
      random() * Math.PI * 2;

    formationDelays[index] =
      random() *
      (edgeStrength > 0 ? 0.075 : 0.12);
  }

  function update(
    elapsedTime: number,
    pointerX: number,
    pointerY: number,
  ) {
    const formationAmount =
      getLogoFormationAmount(elapsedTime);

    const cursorX = pointerX * 2.8;
    const cursorY = pointerY * 2;

    const pointerAvailability =
      1 -
      smoothRange(
        formationAmount,
        0.55,
        0.88,
      );

    for (
      let index = 0;
      index < count;
      index += 1
    ) {
      const offset = index * 3;

      const phase =
        phases[index] ?? 0;

      const delay =
        formationDelays[index] ?? 0;

      const edgeStrength =
        edgeStrengths[index] ?? 0;

      const delayedFormation =
        MathUtils.clamp(
          (formationAmount - delay) /
            (1 - delay),
          0,
          1,
        );

      const easedFormation =
        1 -
        Math.pow(
          1 - delayedFormation,
          3,
        );

      const lockAmount =
        smoothRange(
          delayedFormation,
          0.75,
          0.97,
        );

      const scatterX =
        (scatterPositions[offset] ?? 0) +
        Math.sin(
          elapsedTime * 0.24 + phase,
        ) *
          0.1;

      const scatterY =
        (scatterPositions[offset + 1] ?? 0) +
        Math.cos(
          elapsedTime * 0.21 + phase,
        ) *
          0.085;

      const scatterZ =
        (scatterPositions[offset + 2] ?? 0) +
        Math.sin(
          elapsedTime * 0.18 + phase,
        ) *
          0.06;

      const unlockedMotion =
        edgeStrength > 0
          ? 0.01
          : 0.016;

      const lockedMotion =
        edgeStrength > 0
          ? 0.001
          : 0.0023;

      const residualMotion =
        MathUtils.lerp(
          unlockedMotion,
          lockedMotion,
          lockAmount,
        );

      const targetX =
        (targetPositions[offset] ?? 0) +
        Math.sin(
          elapsedTime * 0.72 + phase,
        ) *
          residualMotion;

      const targetY =
        (targetPositions[offset + 1] ?? 0) +
        Math.cos(
          elapsedTime * 0.66 + phase,
        ) *
          residualMotion;

      const targetZ =
        (targetPositions[offset + 2] ?? 0) +
        Math.sin(
          elapsedTime * 0.84 + phase,
        ) *
          residualMotion *
          0.55;

      let x = MathUtils.lerp(
        scatterX,
        targetX,
        easedFormation,
      );

      let y = MathUtils.lerp(
        scatterY,
        targetY,
        easedFormation,
      );

      let z = MathUtils.lerp(
        scatterZ,
        targetZ,
        easedFormation,
      );

      const distanceX = x - cursorX;
      const distanceY = y - cursorY;

      const distanceSquared =
        distanceX * distanceX +
        distanceY * distanceY;

      const interactionRadius = 0.92;

      if (
        pointerAvailability > 0 &&
        distanceSquared > 0.0001 &&
        distanceSquared <
          interactionRadius *
            interactionRadius
      ) {
        const distance =
          Math.sqrt(distanceSquared);

        const influence =
          1 -
          distance / interactionRadius;

        const repulsion =
          influence *
          influence *
          0.2 *
          pointerAvailability;

        x +=
          (distanceX / distance) *
          repulsion;

        y +=
          (distanceY / distance) *
          repulsion;

        z +=
          influence *
          0.08 *
          pointerAvailability;
      }

      positions[offset] = x;
      positions[offset + 1] = y;
      positions[offset + 2] = z;
    }

    return formationAmount;
  }

  return {
    positions,
    colors,
    update,
  };
}