"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "./hero-experience.module.css";

const LOGO_SOURCE = "/brand/emotion-mark-transparent-1024.png";
const MASK_RESOLUTION = 480;
const FORMATION_DURATION = 6_400;
const FORMATION_DELAY = 420;
const TARGET_FRAME_DURATION = 1_000 / 36;
const CIRCLE_CENTER_OFFSET = 0.087;
const CIRCLE_RADIUS_SHARE = 0.342;

type BrandParticle = {
  targetX: number;
  targetY: number;
  sourceX: number;
  sourceY: number;
  controlX: number;
  controlY: number;
  color: string;
  delay: number;
  phase: number;
  size: number;
};

type SceneMetrics = {
  width: number;
  height: number;
  dpr: number;
  markSize: number;
  centerX: number;
  visualCenterY: number;
  markCenterY: number;
  circleRadius: number;
};

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function smoothstep(value: number, start: number, end: number) {
  const amount = clamp((value - start) / (end - start));

  return amount * amount * (3 - 2 * amount);
}

function easeInOutSine(value: number) {
  return -(Math.cos(Math.PI * value) - 1) * 0.5;
}

function createRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10_000;

    return value - Math.floor(value);
  };
}

function createSceneMetrics(element: HTMLDivElement): SceneMetrics {
  const bounds = element.getBoundingClientRect();
  const width = Math.max(1, bounds.width);
  const height = Math.max(1, bounds.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  const markSize = clamp(
    Math.min(width * 0.7, height * 0.62),
    width < 620 ? 340 : 420,
    540,
  );
  const visualCenterY = height * (width < 620 ? 0.47 : 0.46);

  return {
    width,
    height,
    dpr,
    markSize,
    centerX: width * 0.5,
    visualCenterY,
    markCenterY: visualCenterY - markSize * CIRCLE_CENTER_OFFSET,
    circleRadius: markSize * CIRCLE_RADIUS_SHARE,
  };
}

function createParticles(
  image: HTMLImageElement,
  metrics: SceneMetrics,
): BrandParticle[] {
  const maskCanvas = document.createElement("canvas");

  maskCanvas.width = MASK_RESOLUTION;
  maskCanvas.height = MASK_RESOLUTION;

  const maskContext = maskCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!maskContext) {
    return [];
  }

  maskContext.clearRect(0, 0, MASK_RESOLUTION, MASK_RESOLUTION);
  maskContext.drawImage(image, 0, 0, MASK_RESOLUTION, MASK_RESOLUTION);

  const pixelData = maskContext.getImageData(
    0,
    0,
    MASK_RESOLUTION,
    MASK_RESOLUTION,
  ).data;

  const random = createRandom(metrics.width < 620 ? 827 : 412);
  const sampleStep = metrics.width < 620 ? 7 : 6;
  const particles: BrandParticle[] = [];
  const halfMask = MASK_RESOLUTION * 0.5;
  const scale = metrics.markSize / MASK_RESOLUTION;

  for (let y = 0; y < MASK_RESOLUTION; y += sampleStep) {
    for (let x = 0; x < MASK_RESOLUTION; x += sampleStep) {
      const pixelIndex = (y * MASK_RESOLUTION + x) * 4;
      const alpha = pixelData[pixelIndex + 3] ?? 0;

      if (alpha < 28) {
        continue;
      }

      const red = pixelData[pixelIndex] ?? 255;
      const green = pixelData[pixelIndex + 1] ?? 40;
      const blue = pixelData[pixelIndex + 2] ?? 70;
      const side = random() < 0.5 ? -1 : 1;
      const targetX = metrics.centerX + (x - halfMask) * scale;
      const targetY = metrics.markCenterY + (y - halfMask) * scale;
      const sourceDistance =
        metrics.markSize * (0.46 + random() * 0.44) + metrics.width * 0.08;
      const sourceX =
        metrics.centerX + side * sourceDistance + (random() - 0.5) * 70;
      const sourceY =
        metrics.visualCenterY +
        (random() - 0.5) * metrics.markSize * 0.92 +
        Math.sin(y * 0.045) * 28;
      const controlX =
        lerp(sourceX, targetX, 0.7) + side * (12 + random() * 38);
      const controlY = lerp(sourceY, targetY, 0.62) + (random() - 0.5) * 90;

      particles.push({
        targetX,
        targetY,
        sourceX,
        sourceY,
        controlX,
        controlY,
        color: `rgb(${red} ${green} ${blue})`,
        delay: random() * 0.2,
        phase: random() * Math.PI * 2,
        size: 0.72 + random() * 0.9,
      });
    }
  }

  return particles;
}

function drawFlowLines(
  context: CanvasRenderingContext2D,
  metrics: SceneMetrics,
  elapsed: number,
  formation: number,
  pointerY: number,
) {
  const gradient = context.createLinearGradient(0, 0, metrics.width, 0);

  gradient.addColorStop(0, "rgba(237, 0, 116, 0)");
  gradient.addColorStop(0.2, "rgba(237, 0, 116, 0.88)");
  gradient.addColorStop(0.52, "rgba(255, 23, 68, 0.96)");
  gradient.addColorStop(0.8, "rgba(255, 106, 0, 0.82)");
  gradient.addColorStop(1, "rgba(255, 106, 0, 0)");

  const time = elapsed * 0.00016;
  const lineVisibility = lerp(1, 0.52, formation);
  const lineCount = metrics.width < 620 ? 7 : 10;

  context.save();
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = gradient;

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
    const normalizedLine = lineIndex / Math.max(lineCount - 1, 1) - 0.5;
    const amplitude = 24 + Math.abs(normalizedLine) * 42;
    const phase = time + lineIndex * 0.63;

    context.beginPath();

    for (let pointIndex = 0; pointIndex <= 72; pointIndex += 1) {
      const progress = pointIndex / 72;
      const x = lerp(-metrics.width * 0.08, metrics.width * 1.08, progress);
      const envelope = Math.sin(progress * Math.PI);
      const y =
        metrics.visualCenterY +
        normalizedLine * metrics.markSize * 0.34 * (progress - 0.5) +
        Math.sin(progress * Math.PI * 3.1 + phase) * amplitude * envelope +
        Math.cos(progress * Math.PI * 1.4 - phase * 0.6) * 12 +
        pointerY * 4 * envelope;

      if (pointIndex === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.globalAlpha =
      (0.055 + (1 - Math.abs(normalizedLine)) * 0.075) * lineVisibility;
    context.lineWidth = 0.65 + (lineIndex % 3) * 0.28;
    context.stroke();
  }

  context.restore();
}

function drawOrbitingAccents(
  context: CanvasRenderingContext2D,
  metrics: SceneMetrics,
  elapsed: number,
  formation: number,
  pointerX: number,
) {
  const time = elapsed * 0.00012;
  const accentVisibility = lerp(0.55, 1, smoothstep(formation, 0.3, 0.95));
  const orbitGradient = context.createLinearGradient(
    metrics.centerX - metrics.circleRadius,
    metrics.visualCenterY,
    metrics.centerX + metrics.circleRadius,
    metrics.visualCenterY,
  );

  orbitGradient.addColorStop(0, "rgba(237, 0, 116, 0.1)");
  orbitGradient.addColorStop(0.5, "rgba(255, 23, 68, 0.42)");
  orbitGradient.addColorStop(1, "rgba(255, 122, 0, 0.12)");

  context.save();
  context.globalCompositeOperation = "lighter";
  context.lineCap = "round";
  context.strokeStyle = orbitGradient;

  for (let orbitIndex = 0; orbitIndex < 3; orbitIndex += 1) {
    const radius = metrics.circleRadius * (1.04 + orbitIndex * 0.115);
    const startAngle =
      time * (orbitIndex % 2 === 0 ? 1 : -0.72) + orbitIndex * 2;
    const arcLength = 0.48 + orbitIndex * 0.12;

    context.beginPath();
    context.arc(
      metrics.centerX,
      metrics.visualCenterY,
      radius,
      startAngle,
      startAngle + arcLength,
    );
    context.globalAlpha = (0.12 - orbitIndex * 0.026) * accentVisibility;
    context.lineWidth = 0.7 + orbitIndex * 0.15;
    context.stroke();
  }

  for (let sparkIndex = 0; sparkIndex < 6; sparkIndex += 1) {
    const direction = sparkIndex % 2 === 0 ? 1 : -1;
    const angle =
      time * direction * (0.72 + sparkIndex * 0.04) +
      (sparkIndex / 6) * Math.PI * 2 +
      pointerX * 0.025;
    const radius = metrics.circleRadius * (1.08 + (sparkIndex % 3) * 0.1);
    const x = metrics.centerX + Math.cos(angle) * radius;
    const y = metrics.visualCenterY + Math.sin(angle) * radius;
    const pulse = 0.78 + Math.sin(elapsed * 0.001 + sparkIndex) * 0.22;

    context.beginPath();
    context.fillStyle = sparkIndex < 3 ? "#ff4b32" : "#ff8a14";
    context.globalAlpha = (0.24 + formation * 0.22) * pulse;
    context.shadowBlur = 12;
    context.shadowColor = sparkIndex < 3 ? "#ff1744" : "#ff6a00";
    context.arc(x, y, 1 + (sparkIndex % 2) * 0.55, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function drawImpact(
  context: CanvasRenderingContext2D,
  metrics: SceneMetrics,
  impact: number,
) {
  if (impact <= 0.001) {
    return;
  }

  const progress = 1 - impact;
  const impactGradient = context.createLinearGradient(
    metrics.centerX - metrics.circleRadius,
    metrics.visualCenterY,
    metrics.centerX + metrics.circleRadius,
    metrics.visualCenterY,
  );

  impactGradient.addColorStop(0, "rgba(237, 0, 116, 0)");
  impactGradient.addColorStop(0.35, "rgba(237, 0, 116, 0.9)");
  impactGradient.addColorStop(0.68, "rgba(255, 54, 38, 0.86)");
  impactGradient.addColorStop(1, "rgba(255, 122, 0, 0)");

  context.save();
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = impactGradient;

  for (let ringIndex = 0; ringIndex < 2; ringIndex += 1) {
    const radius =
      metrics.circleRadius * (0.72 + progress * (0.75 + ringIndex * 0.24));

    context.beginPath();
    context.arc(metrics.centerX, metrics.visualCenterY, radius, 0, Math.PI * 2);
    context.globalAlpha = Math.pow(impact, 1.35) * (0.34 - ringIndex * 0.12);
    context.lineWidth = 1.15 - ringIndex * 0.25;
    context.stroke();
  }

  context.restore();
}

export function HeroExperience() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const finalMarkRef = useRef<HTMLImageElement>(null);
  const replayRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [replayCount, setReplayCount] = useState(0);

  const replay = () => {
    replayRef.current?.();
    setReplayCount((count) => count + 1);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const finalMark = finalMarkRef.current;

    if (!host || !canvas || !finalMark || reducedMotion) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      setFallback(true);
      return;
    }

    let animationFrame = 0;
    let lastFrame = 0;
    let startTime = 0;
    let metrics = createSceneMetrics(host);
    let particles: BrandParticle[] = [];
    let logoReady = false;
    let disposed = false;
    let pointerX = 0;
    let pointerY = 0;
    let replayImpact = 0;

    const logoImage = new window.Image();

    const resize = () => {
      metrics = createSceneMetrics(host);
      canvas.width = Math.round(metrics.width * metrics.dpr);
      canvas.height = Math.round(metrics.height * metrics.dpr);
      canvas.style.width = `${metrics.width}px`;
      canvas.style.height = `${metrics.height}px`;
      host.style.setProperty("--mark-size", `${metrics.markSize}px`);
      host.style.setProperty("--visual-center-y", `${metrics.visualCenterY}px`);
      host.style.setProperty("--mark-center-y", `${metrics.markCenterY}px`);
      host.style.setProperty(
        "--circle-diameter",
        `${metrics.circleRadius * 2.08}px`,
      );

      if (logoReady) {
        particles = createParticles(logoImage, metrics);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();

      pointerX =
        clamp((event.clientX - bounds.left) / bounds.width, 0, 1) * 2 - 1;
      pointerY =
        clamp((event.clientY - bounds.top) / bounds.height, 0, 1) * 2 - 1;
    };

    const render = (timestamp: number) => {
      if (disposed) {
        return;
      }

      animationFrame = window.requestAnimationFrame(render);

      const frameDelta = timestamp - lastFrame;

      if (frameDelta < TARGET_FRAME_DURATION || !logoReady) {
        return;
      }

      lastFrame = timestamp;
      replayImpact = Math.max(0, replayImpact - frameDelta / 1_050);

      const elapsed = timestamp - startTime;
      const rawFormation = clamp(
        (elapsed - FORMATION_DELAY) / FORMATION_DURATION,
      );
      const formation = smoothstep(rawFormation, 0, 1);

      context.setTransform(metrics.dpr, 0, 0, metrics.dpr, 0, 0);
      context.clearRect(0, 0, metrics.width, metrics.height);

      drawFlowLines(context, metrics, elapsed, formation, pointerY);
      drawOrbitingAccents(context, metrics, elapsed, formation, pointerX);

      const settleImpact =
        smoothstep(rawFormation, 0.78, 0.88) *
        (1 - smoothstep(rawFormation, 0.9, 1)) *
        0.42;

      drawImpact(context, metrics, Math.max(replayImpact, settleImpact));

      const identityOpacity = smoothstep(rawFormation, 0.76, 0.96);
      const particleLayerOpacity = 1 - smoothstep(rawFormation, 0.76, 0.98);

      finalMark.style.opacity = identityOpacity.toFixed(3);

      context.save();
      context.globalCompositeOperation = "lighter";

      for (const particle of particles) {
        const delayedFormation = clamp(
          (rawFormation - particle.delay) / (1 - particle.delay),
        );
        const amount = easeInOutSine(delayedFormation);
        const inverseAmount = 1 - amount;
        const curve = Math.sin(amount * Math.PI) * inverseAmount;
        const settledMotion =
          Math.sin(elapsed * 0.00042 + particle.phase) * 0.34;
        const x =
          Math.pow(inverseAmount, 2) * particle.sourceX +
          2 * inverseAmount * amount * particle.controlX +
          Math.pow(amount, 2) * particle.targetX +
          curve * pointerX * 8 +
          settledMotion * amount;
        const y =
          Math.pow(inverseAmount, 2) * particle.sourceY +
          2 * inverseAmount * amount * particle.controlY +
          Math.pow(amount, 2) * particle.targetY +
          curve * pointerY * 6 +
          Math.cos(elapsed * 0.00038 + particle.phase) * 0.28 * amount;
        const twinkle =
          0.88 + Math.sin(elapsed * 0.0012 + particle.phase) * 0.12;

        context.globalAlpha =
          lerp(0.24, 0.9, amount) * twinkle * particleLayerOpacity;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(
          x,
          y,
          particle.size * lerp(0.72, 1, amount),
          0,
          Math.PI * 2,
        );
        context.fill();
      }

      context.restore();
    };

    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(host);
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    const fallbackTimer = window.setTimeout(() => {
      if (!logoReady) {
        setFallback(true);
      }
    }, 3_500);

    replayRef.current = () => {
      if (!logoReady) {
        return;
      }

      startTime = window.performance.now();
      replayImpact = 1;
      finalMark.style.opacity = "0";
      particles = createParticles(logoImage, metrics);
    };

    logoImage.onload = () => {
      if (disposed) {
        return;
      }

      logoReady = true;
      startTime = window.performance.now();
      finalMark.style.opacity = "0";
      resize();
      setReady(true);
      setFallback(false);
      animationFrame = window.requestAnimationFrame(render);
    };

    logoImage.onerror = () => {
      finalMark.style.opacity = "1";
      setFallback(true);
    };
    logoImage.src = LOGO_SOURCE;

    return () => {
      disposed = true;
      window.clearTimeout(fallbackTimer);
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();
      replayRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <div
      ref={hostRef}
      className={styles.experience}
      data-ready={ready ? "true" : undefined}
      data-fallback={fallback || reducedMotion ? "true" : undefined}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <Image
        ref={finalMarkRef}
        className={styles.finalMark}
        src={LOGO_SOURCE}
        alt=""
        width={1024}
        height={1024}
        sizes="(max-width: 620px) 340px, 540px"
        priority
        unoptimized
        draggable={false}
        aria-hidden="true"
      />

      <button
        className={styles.replayButton}
        type="button"
        aria-label="Replay logo animation"
        disabled={!ready || fallback || reducedMotion}
        onClick={replay}
      >
        <span
          key={replayCount}
          className={styles.replayPulse}
          aria-hidden="true"
        />
        <span className={styles.replayHint}>Replay motion</span>
      </button>
    </div>
  );
}
