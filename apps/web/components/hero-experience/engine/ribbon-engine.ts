type RibbonEngineOptions = {
    strandCount: number;
    pointsPerStrand: number;
    seed: number;
    direction: -1 | 1;
    angle: number;
    length: number;
    amplitude: number;
    spread: number;
    phase: number;
  };
  
  type RibbonEngine = {
    positions: Float32Array[];
    update: (
      pointerX: number,
      pointerY: number,
      elapsedTime: number,
      delta: number,
    ) => void;
  };
  
  function createRandom(seed: number) {
    let value = seed;
  
    return () => {
      value = Math.sin(value) * 10_000;
      return value - Math.floor(value);
    };
  }
  
  export function createRibbonEngine({
    strandCount,
    pointsPerStrand,
    seed,
    direction,
    angle,
    length,
    amplitude,
    spread,
    phase,
  }: RibbonEngineOptions): RibbonEngine {
    const random = createRandom(seed);
  
    const positions = Array.from(
      { length: strandCount },
      () => new Float32Array(pointsPerStrand * 3),
    );
  
    const strandPhases = Array.from(
      { length: strandCount },
      () => phase + (random() - 0.5) * 0.38,
    );
  
    const strandSpeeds = Array.from(
      { length: strandCount },
      () => 0.82 + random() * 0.34,
    );
  
    const strandOffsets = Array.from(
      { length: strandCount },
      (_, index) => {
        const center = (strandCount - 1) / 2;
  
        return (index - center) * spread;
      },
    );
  
    function update(
      pointerX: number,
      pointerY: number,
      elapsedTime: number,
      delta: number,
    ) {
      const safeDelta = Math.min(delta, 0.033);
      const cursorX = pointerX * 2.9;
      const cursorY = pointerY * 2.05;
  
      positions.forEach((strandPositions, strandIndex) => {
        const strandPhase = strandPhases[strandIndex] ?? phase;
        const strandSpeed = strandSpeeds[strandIndex] ?? 1;
        const strandOffset = strandOffsets[strandIndex] ?? 0;
  
        for (
          let pointIndex = 0;
          pointIndex < pointsPerStrand;
          pointIndex += 1
        ) {
          const progress = pointIndex / (pointsPerStrand - 1);
          const offset = pointIndex * 3;
  
          /*
           * Vrpca je najgušća kod centra i postupno se otvara
           * prema vanjskom dijelu.
           */
          const opening = Math.pow(progress, 0.82);
          const envelope = Math.sin(progress * Math.PI);
  
          const radialDistance = opening * length * direction;

/*
 * Kod centra vrpca jače kruži, a prema van se postupno
 * vraća u svoj osnovni smjer.
 */
const swirlStrength =
  (1 - progress) *
  (1 - progress) *
  1.45 *
  direction;

const animatedAngle =
  angle +
  swirlStrength +
  Math.sin(
    elapsedTime * 0.22 +
      strandPhase +
      progress * Math.PI * 1.6,
  ) *
    0.12 *
    envelope;

const baseX = Math.cos(animatedAngle) * radialDistance;
const baseY = Math.sin(animatedAngle) * radialDistance;
          const flow =
            Math.sin(
              progress * Math.PI * 2.7 -
                elapsedTime * 0.48 * strandSpeed +
                strandPhase,
            ) *
            amplitude *
            envelope;
  
          const secondaryFlow =
            Math.sin(
              progress * Math.PI * 5.1 +
                elapsedTime * 0.27 +
                strandPhase * 1.4,
            ) *
            0.13 *
            envelope;
  
          /*
           * Vektor okomit na osnovni smjer ribbona.
           */
          const normalX = -Math.sin(animatedAngle);
          const normalY = Math.cos(animatedAngle);
  
          let x =
            baseX +
            normalX * (flow + secondaryFlow + strandOffset);
  
          let y =
            baseY +
            normalY * (flow + secondaryFlow + strandOffset);
  
          let z =
            Math.sin(
              progress * Math.PI * 2.2 +
                elapsedTime * 0.31 +
                strandPhase,
            ) *
            0.42 *
            envelope;
  
          /*
           * Suptilno uvlačenje prema centru stvara osjećaj
           * gravitacijskog polja.
           */
          const corePull = (1 - progress) * 0.16;
  
          x -= Math.cos(animatedAngle) * corePull * direction;
          y -= Math.sin(animatedAngle) * corePull * direction;
          
          const distanceX = x - cursorX;
          const distanceY = y - cursorY;
          const distanceSquared =
            distanceX * distanceX + distanceY * distanceY;
  
          const interactionRadius = 1.1;
          const interactionRadiusSquared =
            interactionRadius * interactionRadius;
  
          if (
            distanceSquared > 0.0001 &&
            distanceSquared < interactionRadiusSquared
          ) {
            const distance = Math.sqrt(distanceSquared);
            const influence =
              1 - distance / interactionRadius;
  
            const repulsion =
              influence * influence * (0.32 + safeDelta * 1.8);
  
            x += (distanceX / distance) * repulsion;
            y += (distanceY / distance) * repulsion;
  
            z +=
              Math.sin(
                elapsedTime * 5.2 -
                  distance * 5.4 +
                  progress * Math.PI * 3,
              ) *
              influence *
              0.28;
          }
  
          strandPositions[offset] = x;
          strandPositions[offset + 1] = y;
          strandPositions[offset + 2] = z;
        }
      });
    }
  
    return {
      positions,
      update,
    };
  }