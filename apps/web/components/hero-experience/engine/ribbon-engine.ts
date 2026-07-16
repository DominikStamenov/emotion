type RibbonEngineOptions = {
    strandCount: number;
    pointsPerStrand: number;
    seed: number;
    verticalOffset: number;
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
    verticalOffset,
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
      () => phase + (random() - 0.5) * 0.45,
    );
  
    const strandSpeeds = Array.from(
      { length: strandCount },
      () => 0.72 + random() * 0.42,
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
      const cursorX = pointerX * 3.15;
      const cursorY = pointerY * 2.25;
      const safeDelta = Math.min(delta, 0.033);
  
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
  
          const x = -3.55 + progress * 7.1;
  
          const primaryWave =
            Math.sin(
              progress * Math.PI * 2.15 +
                elapsedTime * 0.42 * strandSpeed +
                strandPhase,
            ) * amplitude;
  
          const secondaryWave =
            Math.sin(
              progress * Math.PI * 4.6 -
                elapsedTime * 0.27 +
                strandPhase * 1.4,
            ) * 0.18;
  
          const breathing =
            Math.sin(elapsedTime * 0.31 + progress * Math.PI) *
            0.1;
  
          let y =
            verticalOffset +
            strandOffset +
            primaryWave +
            secondaryWave +
            breathing;
  
          let z =
            Math.cos(
              progress * Math.PI * 2.4 +
                elapsedTime * 0.24 +
                strandPhase,
            ) *
            (0.36 + Math.abs(strandOffset) * 0.42);
  
          const distanceX = x - cursorX;
          const distanceY = y - cursorY;
          const distanceSquared =
            distanceX * distanceX + distanceY * distanceY;
  
          const interactionRadius = 1.2;
  
          if (
            distanceSquared > 0.0001 &&
            distanceSquared < interactionRadius * interactionRadius
          ) {
            const distance = Math.sqrt(distanceSquared);
            const influence = 1 - distance / interactionRadius;
            const disturbance =
              influence * influence * (0.42 + safeDelta * 2);
  
            y += (distanceY / distance) * disturbance;
  
            z +=
              Math.sin(
                elapsedTime * 6 -
                  distance * 5 +
                  progress * Math.PI * 3,
              ) *
              influence *
              0.34;
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