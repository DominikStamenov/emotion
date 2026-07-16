import { MathUtils } from "three";

type LogoSolverOptions = {
  count: number;
  seed: number;
  scale: number;
  depth: number;
};

type LogoSolver = {
  positions: Float32Array;
  colors: Float32Array;
  update: (
    elapsedTime: number,
    pointerX: number,
    pointerY: number,
  ) => number;
};

type RgbColor = readonly [number, number, number];
type LogoPoint = readonly [number, number];

type LogoTarget = {
  x: number;
  y: number;
  edge: boolean;
};

type EdgeSegment = {
  start: LogoPoint;
  end: LogoPoint;
  cumulativeLength: number;
};

const WHITE: RgbColor = [0.98, 0.97, 1];
const MAGENTA: RgbColor = [0.96, 0.01, 0.42];
const RED: RgbColor = [1, 0.08, 0.12];
const ORANGE: RgbColor = [1, 0.28, 0.03];

const LOGO_CYCLE_DURATION = 12;
const EDGE_PARTICLE_SHARE = 0.24;

const FALLBACK_POINT: LogoPoint = [0, -1];

/**
 * Normalized silhouette extracted from the real eMotion logo.
 *
 * Unlike the previous decorative curves, this polygon describes:
 * - the outer circular body
 * - the upper energy tail
 * - the central arrow opening
 * - both internal eMotion cuts
 */
const LOGO_POLYGON: readonly LogoPoint[] = [
    [-0.682028, 1],
    [-0.700461, 0.928571],
    [-0.700461, 0.861751],
    [-0.686636, 0.806452],
    [-0.629032, 0.707373],
    [-0.534562, 0.612903],
    [-0.417051, 0.525346],
    [0.064516, 0.223502],
    [0.698157, -0.195853],
    [0.205069, -0.536866],
    [-0.241935, -0.866359],
    [-0.24424, -0.430876],
    [-0.359447, -0.391705],
    [-0.437788, -0.327189],
    [-0.486175, -0.228111],
    [-0.486175, -0.124424],
    [-0.31106, -0.200461],
    [-0.013825, -0.297235],
    [0.016129, -0.276498],
    [-0.308756, -0.131336],
    [-0.513825, -0.016129],
    [-0.56682, 0.041475],
    [-0.596774, 0.103687],
    [-0.605991, 0.193548],
    [-0.592166, 0.25576],
    [-0.576037, 0.258065],
    [-0.357143, 0.126728],
    [-0.039171, -0.036866],
    [0.110599, -0.099078],
    [0.133641, -0.085253],
    [-0.158986, 0.085253],
    [-0.589862, 0.357143],
    [-0.686636, 0.232719],
    [-0.741935, 0.126728],
    [-0.78341, 0.006912],
    [-0.808756, -0.138249],
    [-0.808756, -0.25576],
    [-0.788018, -0.384793],
    [-0.75576, -0.486175],
    [-0.705069, -0.592166],
    [-0.612903, -0.721198],
    [-0.495392, -0.831797],
    [-0.345622, -0.921659],
    [-0.225806, -0.965438],
    [-0.036866, -0.997696],
    [0.108295, -0.993088],
    [0.260369, -0.958525],
    [0.412442, -0.889401],
    [0.543779, -0.792627],
    [0.635945, -0.693548],
    [0.709677, -0.580645],
    [0.778802, -0.407834],
    [0.804147, -0.258065],
    [0.799539, -0.09447],
    [0.767281, 0.050691],
    [0.700461, 0.205069],
    [0.626728, 0.313364],
    [0.525346, 0.417051],
    [0.40553, 0.5],
    [0.292627, 0.550691],
    [0.193548, 0.578341],
    [0.080645, 0.59447],
    [-0.064516, 0.589862],
    [-0.221198, 0.557604],
    [-0.442396, 0.709677],
    [-0.569124, 0.813364],
    [-0.652074, 0.910138],
  ];

  const LOGO_BOUNDS = {
    minX: -0.808756,
    maxX: 0.804147,
    minY: -0.997696,
    maxY: 1,
  } as const;

function createRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10_000;
    return value - Math.floor(value);
  };
}

function mixColor(
  start: RgbColor,
  end: RgbColor,
  amount: number,
): RgbColor {
  const t = MathUtils.clamp(amount, 0, 1);

  return [
    MathUtils.lerp(start[0], end[0], t),
    MathUtils.lerp(start[1], end[1], t),
    MathUtils.lerp(start[2], end[2], t),
  ];
}

function smoothRange(
  value: number,
  start: number,
  end: number,
) {
  return MathUtils.smoothstep(value, start, end);
}

/**
 * Standard ray-casting point-in-polygon test.
 *
 * Used during initialization to place particles inside the
 * real eMotion silhouette rather than only along decorative paths.
 */
function pointInsideLogo(x: number, y: number) {
  let inside = false;
  let previousIndex = LOGO_POLYGON.length - 1;

  for (
    let currentIndex = 0;
    currentIndex < LOGO_POLYGON.length;
    currentIndex += 1
  ) {
    const current =
      LOGO_POLYGON[currentIndex] ?? FALLBACK_POINT;

    const previous =
      LOGO_POLYGON[previousIndex] ?? FALLBACK_POINT;

    const currentX = current[0];
    const currentY = current[1];

    const previousX = previous[0];
    const previousY = previous[1];

    const crossesHorizontalRay =
      currentY > y !== previousY > y;

    if (crossesHorizontalRay) {
      const intersectionX =
        ((previousX - currentX) * (y - currentY)) /
          (previousY - currentY) +
        currentX;

      if (x < intersectionX) {
        inside = !inside;
      }
    }

    previousIndex = currentIndex;
  }

  return inside;
}

/**
 * Precalculates logo edge lengths so particles can be
 * distributed evenly around the complete silhouette.
 */
function createEdgeSegments() {
  const segments: EdgeSegment[] = [];
  let cumulativeLength = 0;

  for (
    let index = 0;
    index < LOGO_POLYGON.length;
    index += 1
  ) {
    const start =
      LOGO_POLYGON[index] ?? FALLBACK_POINT;

    const end =
      LOGO_POLYGON[
        (index + 1) % LOGO_POLYGON.length
      ] ?? FALLBACK_POINT;

    const deltaX = end[0] - start[0];
    const deltaY = end[1] - start[1];

    const length = Math.hypot(deltaX, deltaY);

    cumulativeLength += length;

    segments.push({
      start,
      end,
      cumulativeLength,
    });
  }

  return {
    segments,
    totalLength: cumulativeLength,
  };
}

const LOGO_EDGES = createEdgeSegments();

function sampleInteriorPoint(
  random: () => number,
): LogoTarget {
  for (let attempt = 0; attempt < 160; attempt += 1) {
    const x = MathUtils.lerp(
      LOGO_BOUNDS.minX,
      LOGO_BOUNDS.maxX,
      random(),
    );

    const y = MathUtils.lerp(
      LOGO_BOUNDS.minY,
      LOGO_BOUNDS.maxY,
      random(),
    );

    if (pointInsideLogo(x, y)) {
      return {
        x,
        y,
        edge: false,
      };
    }
  }

  return {
    x: 0,
    y: -1,
    edge: false,
  };
}

function sampleEdgePoint(
  random: () => number,
): LogoTarget {
  const distance =
    random() * LOGO_EDGES.totalLength;

  const segment =
    LOGO_EDGES.segments.find(
      (candidate) =>
        candidate.cumulativeLength >= distance,
    ) ?? LOGO_EDGES.segments[0];

  if (!segment) {
    return {
      x: FALLBACK_POINT[0],
      y: FALLBACK_POINT[1],
      edge: true,
    };
  }

  const segmentLength = Math.hypot(
    segment.end[0] - segment.start[0],
    segment.end[1] - segment.start[1],
  );

  const segmentStartLength =
    segment.cumulativeLength - segmentLength;

  const progress =
    segmentLength > 0
      ? (distance - segmentStartLength) /
        segmentLength
      : 0;

  const jitter = 0.012;

  return {
    x:
      MathUtils.lerp(
        segment.start[0],
        segment.end[0],
        progress,
      ) +
      (random() - 0.5) * jitter,

    y:
      MathUtils.lerp(
        segment.start[1],
        segment.end[1],
        progress,
      ) +
      (random() - 0.5) * jitter,

    edge: true,
  };
}

function createLogoTarget(
  random: () => number,
): LogoTarget {
  if (random() < EDGE_PARTICLE_SHARE) {
    return sampleEdgePoint(random);
  }

  return sampleInteriorPoint(random);
}

/**
 * Recreates the official eMotion pink-red-orange gradient.
 * Edge particles receive a larger chance of becoming white sparks.
 */
function getLogoColor(
  x: number,
  y: number,
  edge: boolean,
  random: () => number,
): RgbColor {
  const vertical = MathUtils.clamp(
    (y - LOGO_BOUNDS.minY) /
      (LOGO_BOUNDS.maxY - LOGO_BOUNDS.minY),
    0,
    1,
  );

  const horizontal = MathUtils.clamp(
    (x - LOGO_BOUNDS.minX) /
      (LOGO_BOUNDS.maxX - LOGO_BOUNDS.minX),
    0,
    1,
  );

  const redBase = mixColor(
    MAGENTA,
    RED,
    vertical,
  );

  const orangeInfluence = MathUtils.clamp(
    horizontal * 0.72 + vertical * 0.18,
    0,
    0.82,
  );

  let color = mixColor(
    redBase,
    ORANGE,
    orangeInfluence,
  );

  const sparkleChance = edge ? 0.2 : 0.055;

  if (random() < sparkleChance) {
    color = mixColor(
      color,
      WHITE,
      edge ? 0.7 : 0.45,
    );
  }

  return color;
}

export function getLogoFormationAmount(
  elapsedTime: number,
) {
  const cycleTime =
    (elapsedTime % LOGO_CYCLE_DURATION) /
    LOGO_CYCLE_DURATION;

  /**
   * 0.00–0.24: scatter / stillness
   * 0.24–0.49: gather and formation
   * 0.49–0.74: full reveal and hold
   * 0.74–0.95: dissolve
   * 0.95–1.00: freedom
   */
  const gather = smoothRange(
    cycleTime,
    0.24,
    0.49,
  );

  const dissolve = smoothRange(
    cycleTime,
    0.74,
    0.95,
  );

  return MathUtils.clamp(
    gather * (1 - dissolve),
    0,
    1,
  );
}

export function createLogoSolver({
  count,
  seed,
  scale,
  depth,
}: LogoSolverOptions): LogoSolver {
  const random = createRandom(seed);

  const positions =
    new Float32Array(count * 3);

  const scatterPositions =
    new Float32Array(count * 3);

  const targetPositions =
    new Float32Array(count * 3);

  const colors =
    new Float32Array(count * 3);

  const phases =
    new Float32Array(count);

  const formationDelays =
    new Float32Array(count);

  const edgeStrengths =
    new Float32Array(count);

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const offset = index * 3;

    const target =
      createLogoTarget(random);

    targetPositions[offset] =
      target.x * scale;

    targetPositions[offset + 1] =
      target.y * scale;

    /**
     * Logo collapses into a relatively flat depth plane
     * so its silhouette remains readable.
     */
    targetPositions[offset + 2] =
      (random() - 0.5) * depth * 0.08;

    const scatterAngle =
      random() * Math.PI * 2;

    const scatterRadius =
      1.4 +
      Math.pow(random(), 0.68) * 2.35;

    const scatterX =
      Math.cos(scatterAngle) *
      scatterRadius;

    const scatterY =
      Math.sin(scatterAngle) *
      scatterRadius *
      0.74;

    const scatterZ =
      (random() - 0.5) * depth;

    scatterPositions[offset] =
      scatterX;

    scatterPositions[offset + 1] =
      scatterY;

    scatterPositions[offset + 2] =
      scatterZ;

    positions[offset] = scatterX;
    positions[offset + 1] = scatterY;
    positions[offset + 2] = scatterZ;

    phases[index] =
      random() * Math.PI * 2;

    /**
     * Small per-particle delay prevents the formation
     * from looking like a simple global crossfade.
     */
    formationDelays[index] =
      random() * 0.13;

    edgeStrengths[index] =
      target.edge ? 1 : 0;

    const color = getLogoColor(
      target.x,
      target.y,
      target.edge,
      random,
    );

    colors[offset] = color[0];
    colors[offset + 1] = color[1];
    colors[offset + 2] = color[2];
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

    /**
     * Mouse interaction fades out while the logo forms.
     * During the full reveal it becomes completely inactive.
     */
    const pointerAvailability =
      1 -
      smoothRange(
        formationAmount,
        0.58,
        0.9,
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

      /**
       * Strong ease-out makes particles snap naturally
       * into the final silhouette near the end.
       */
      const easedFormation =
        1 -
        Math.pow(
          1 - delayedFormation,
          3,
        );

      const lockAmount =
        smoothRange(
          delayedFormation,
          0.78,
          0.98,
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

      /**
       * Interior particles continue breathing slightly.
       * Edge particles become almost completely stationary.
       */
      const residualMotion =
        MathUtils.lerp(
          0.018,
          edgeStrength > 0
            ? 0.0015
            : 0.003,
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
          distance /
            interactionRadius;

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