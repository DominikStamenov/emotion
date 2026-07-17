export type LogoMaskTargets = {
  count: number;
  positions: Float32Array;
  colors: Float32Array;
  edgeStrengths: Float32Array;
};

type LogoMaskOptions = {
  src: string;
  count: number;
  seed: number;
  resolution?: number;
  alphaThreshold?: number;
  edgeParticleShare?: number;
};

const DEFAULT_RESOLUTION = 512;
const DEFAULT_ALPHA_THRESHOLD = 12;
const DEFAULT_EDGE_PARTICLE_SHARE = 0.38;

function createRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10_000;

    return value - Math.floor(value);
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.decoding = "async";

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      reject(new Error(`Unable to load logo source: ${src}`));
    };

    image.src = src;
  });
}

function isEdgePixel(
  activePixels: Uint8Array,
  x: number,
  y: number,
  resolution: number,
) {
  for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (offsetX === 0 && offsetY === 0) {
        continue;
      }

      const neighborX = x + offsetX;
      const neighborY = y + offsetY;

      if (
        neighborX < 0 ||
        neighborX >= resolution ||
        neighborY < 0 ||
        neighborY >= resolution
      ) {
        return true;
      }

      const neighborIndex = neighborY * resolution + neighborX;

      if (activePixels[neighborIndex] === 0) {
        return true;
      }
    }
  }

  return false;
}

function getCandidate(candidates: number[], random: () => number) {
  const candidateIndex = Math.min(
    candidates.length - 1,
    Math.floor(random() * candidates.length),
  );

  return candidates[candidateIndex] ?? 0;
}

export async function loadLogoMaskTargets({
  src,
  count,
  seed,
  resolution = DEFAULT_RESOLUTION,
  alphaThreshold = DEFAULT_ALPHA_THRESHOLD,
  edgeParticleShare = DEFAULT_EDGE_PARTICLE_SHARE,
}: LogoMaskOptions): Promise<LogoMaskTargets> {
  const image = await loadImage(src);

  const canvas = document.createElement("canvas");

  canvas.width = resolution;
  canvas.height = resolution;

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    throw new Error("Unable to create logo mask canvas context.");
  }

  context.clearRect(0, 0, resolution, resolution);

  const sourceWidth = image.naturalWidth || image.width;

  const sourceHeight = image.naturalHeight || image.height;

  const sourceAspect = sourceWidth / sourceHeight;

  let drawWidth = resolution;
  let drawHeight = resolution;

  if (sourceAspect > 1) {
    drawHeight = resolution / sourceAspect;
  } else {
    drawWidth = resolution * sourceAspect;
  }

  const drawX = (resolution - drawWidth) * 0.5;

  const drawY = (resolution - drawHeight) * 0.5;

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  const imageData = context.getImageData(0, 0, resolution, resolution);

  const pixelData = imageData.data;
  const pixelCount = resolution * resolution;

  const activePixels = new Uint8Array(pixelCount);

  const interiorCandidates: number[] = [];
  const edgeCandidates: number[] = [];

  let minX = resolution;
  let maxX = -1;
  let minY = resolution;
  let maxY = -1;

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const alpha = pixelData[pixelIndex * 4 + 3] ?? 0;

    if (alpha < alphaThreshold) {
      continue;
    }

    activePixels[pixelIndex] = 1;

    const x = pixelIndex % resolution;
    const y = Math.floor(pixelIndex / resolution);

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  if (maxX < minX || maxY < minY) {
    throw new Error(`No visible pixels detected in ${src}.`);
  }

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const pixelIndex = y * resolution + x;

      if (activePixels[pixelIndex] === 0) {
        continue;
      }

      if (isEdgePixel(activePixels, x, y, resolution)) {
        edgeCandidates.push(pixelIndex);
      } else {
        interiorCandidates.push(pixelIndex);
      }
    }
  }

  const allCandidates = [...interiorCandidates, ...edgeCandidates];

  if (allCandidates.length === 0) {
    throw new Error(`Logo source ${src} contains no usable pixels.`);
  }

  const random = createRandom(seed);

  const positions = new Float32Array(count * 2);

  const colors = new Float32Array(count * 3);

  const edgeStrengths = new Float32Array(count);

  const activeWidth = maxX - minX + 1;
  const activeHeight = maxY - minY + 1;

  const centerX = (minX + maxX + 1) * 0.5;

  const centerY = (minY + maxY + 1) * 0.5;

  const halfExtent = Math.max(activeWidth, activeHeight) * 0.5;

  for (let index = 0; index < count; index += 1) {
    const useEdge = edgeCandidates.length > 0 && random() < edgeParticleShare;

    const candidatePool =
      useEdge || interiorCandidates.length === 0
        ? edgeCandidates
        : interiorCandidates;

    const fallbackPool =
      candidatePool.length > 0 ? candidatePool : allCandidates;

    const pixelIndex = getCandidate(fallbackPool, random);

    const pixelX = pixelIndex % resolution;

    const pixelY = Math.floor(pixelIndex / resolution);

    const jitterX = (random() - 0.5) * 0.72;

    const jitterY = (random() - 0.5) * 0.72;

    const normalizedX = (pixelX + 0.5 + jitterX - centerX) / halfExtent;

    const normalizedY = -(pixelY + 0.5 + jitterY - centerY) / halfExtent;

    const positionOffset = index * 2;

    positions[positionOffset] = normalizedX;

    positions[positionOffset + 1] = normalizedY;

    const sourceColorOffset = pixelIndex * 4;

    const targetColorOffset = index * 3;

    const edgeGain = useEdge ? 1.12 : 1.04;

    colors[targetColorOffset] = Math.min(
      1,
      ((pixelData[sourceColorOffset] ?? 255) / 255) * edgeGain,
    );

    colors[targetColorOffset + 1] = Math.min(
      1,
      ((pixelData[sourceColorOffset + 1] ?? 255) / 255) * edgeGain,
    );

    colors[targetColorOffset + 2] = Math.min(
      1,
      ((pixelData[sourceColorOffset + 2] ?? 255) / 255) * edgeGain,
    );

    edgeStrengths[index] = useEdge ? 1 : 0;
  }

  return {
    count,
    positions,
    colors,
    edgeStrengths,
  };
}
