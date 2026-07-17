"use client";

import { useEffect, useRef } from "react";

import { BRAND_FIELD_PULSE_EVENT } from "./living-brand-field-events";
import styles from "./living-brand-field.module.css";

const TARGET_FRAME_DURATION = 1_000 / 30;

type FieldMetrics = {
  width: number;
  height: number;
  dpr: number;
  focusX: number;
  focusY: number;
};

type FieldSpark = {
  lane: number;
  offset: number;
  phase: number;
  speed: number;
  tone: "orange" | "pink" | "red";
};

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function createRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.sin(value) * 10_000;

    return value - Math.floor(value);
  };
}

function createSparks(compact: boolean): FieldSpark[] {
  const random = createRandom(compact ? 703 : 1_109);
  const count = compact ? 12 : 24;

  return Array.from({ length: count }, (_, index) => ({
    lane: random() * 1.8 - 0.9,
    offset: random(),
    phase: random() * Math.PI * 2,
    speed: 0.008 + random() * 0.009,
    tone: index % 3 === 0 ? "orange" : index % 2 === 0 ? "pink" : "red",
  }));
}

function getMetrics(element: HTMLDivElement): FieldMetrics {
  const bounds = element.getBoundingClientRect();
  const width = Math.max(1, bounds.width);
  const height = Math.max(1, bounds.height);
  const compact = width < 700;

  return {
    width,
    height,
    dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    focusX: width * (compact ? 0.5 : 0.73),
    focusY: height * (compact ? 0.44 : 0.48),
  };
}

function getFieldPoint(
  metrics: FieldMetrics,
  lane: number,
  progress: number,
  time: number,
  pointerX: number,
  pointerY: number,
) {
  const x = lerp(-metrics.width * 0.08, metrics.width * 1.08, progress);
  const focusX = metrics.focusX + pointerX * 12;
  const focusY = metrics.focusY + pointerY * 8;
  const normalizedDistance = (x - focusX) / (metrics.width * 0.31);
  const proximity = Math.exp(-normalizedDistance * normalizedDistance);
  const baseY = focusY + lane * metrics.height * 0.52;
  const gatheredY = focusY + lane * metrics.height * 0.095;
  const convergence = proximity * 0.68;
  const outerWave =
    Math.sin(progress * Math.PI * 2.35 + time + lane * 2.8) *
    (9 + Math.abs(lane) * 25) *
    (0.3 + (1 - proximity) * 0.7);
  const curl =
    Math.sin(normalizedDistance * 2.2 - time * 0.28 + lane * 1.6) *
    proximity *
    (20 + Math.abs(lane) * 48);
  const bypass =
    (lane < 0 ? -1 : 1) *
    proximity *
    metrics.height *
    (0.055 + (1 - Math.abs(lane)) * 0.105);

  return {
    x,
    y: lerp(baseY, gatheredY, convergence) + outerWave + curl + bypass,
  };
}

function drawLuminousAtmosphere(
  context: CanvasRenderingContext2D,
  metrics: FieldMetrics,
  pointerX: number,
  pointerY: number,
) {
  const compact = metrics.width < 700;
  const intensity = compact ? 0.68 : 1;
  const focusX = metrics.focusX + pointerX * 10;
  const focusY = metrics.focusY + pointerY * 7;
  const core = context.createRadialGradient(
    focusX + metrics.width * 0.055,
    focusY - metrics.height * 0.085,
    metrics.width * 0.015,
    focusX,
    focusY,
    metrics.width * (compact ? 0.62 : 0.42),
  );

  core.addColorStop(0, `rgba(255, 126, 12, ${0.16 * intensity})`);
  core.addColorStop(0.22, `rgba(255, 44, 47, ${0.11 * intensity})`);
  core.addColorStop(0.5, `rgba(237, 0, 116, ${0.052 * intensity})`);
  core.addColorStop(1, "rgba(8, 8, 10, 0)");

  context.fillStyle = core;
  context.fillRect(0, 0, metrics.width, metrics.height);

  const lowerBloom = context.createRadialGradient(
    focusX - metrics.width * 0.17,
    focusY + metrics.height * 0.2,
    0,
    focusX - metrics.width * 0.1,
    focusY + metrics.height * 0.1,
    metrics.width * (compact ? 0.5 : 0.34),
  );

  lowerBloom.addColorStop(0, `rgba(237, 0, 116, ${0.115 * intensity})`);
  lowerBloom.addColorStop(0.42, `rgba(255, 23, 68, ${0.05 * intensity})`);
  lowerBloom.addColorStop(1, "rgba(8, 8, 10, 0)");

  context.fillStyle = lowerBloom;
  context.fillRect(0, 0, metrics.width, metrics.height);
}

function drawSignatureStrands(
  context: CanvasRenderingContext2D,
  metrics: FieldMetrics,
  elapsed: number,
  pointerX: number,
  pointerY: number,
) {
  const compact = metrics.width < 700;
  const lanes = compact
    ? [-0.62, -0.28, 0.26, 0.58]
    : [-0.72, -0.48, -0.24, 0.2, 0.43, 0.7];
  const pointCount = compact ? 58 : 86;
  const time = elapsed * 0.000075;
  const stroke = context.createLinearGradient(0, 0, metrics.width, 0);

  stroke.addColorStop(0, "rgba(237, 0, 116, 0)");
  stroke.addColorStop(0.22, "rgba(237, 0, 116, 0.46)");
  stroke.addColorStop(0.52, "rgba(255, 38, 56, 0.78)");
  stroke.addColorStop(0.77, "rgba(255, 122, 12, 0.7)");
  stroke.addColorStop(1, "rgba(255, 122, 12, 0)");

  context.save();
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = stroke;
  context.lineCap = "round";
  context.shadowBlur = compact ? 8 : 18;
  context.shadowColor = "rgba(255, 46, 54, 0.42)";

  lanes.forEach((lane, index) => {
    context.beginPath();

    for (let pointIndex = 0; pointIndex <= pointCount; pointIndex += 1) {
      const progress = pointIndex / pointCount;
      const point = getFieldPoint(
        metrics,
        lane,
        progress,
        time + index * 0.19,
        pointerX,
        pointerY,
      );

      if (pointIndex === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    }

    context.globalAlpha = compact ? 0.12 : 0.21 + (index % 2) * 0.055;
    context.lineWidth = compact ? 0.95 : 1.35 + (index % 3) * 0.32;
    context.stroke();
  });

  context.restore();
}

function drawFieldLines(
  context: CanvasRenderingContext2D,
  metrics: FieldMetrics,
  elapsed: number,
  pointerX: number,
  pointerY: number,
) {
  const compact = metrics.width < 700;
  const lineCount = compact ? 20 : 36;
  const pointCount = compact ? 64 : 92;
  const time = elapsed * 0.00011;
  const stroke = context.createLinearGradient(0, 0, metrics.width, 0);

  stroke.addColorStop(0, "rgba(237, 0, 116, 0)");
  stroke.addColorStop(0.16, "rgba(237, 0, 116, 0.34)");
  stroke.addColorStop(0.5, "rgba(255, 23, 68, 0.68)");
  stroke.addColorStop(0.76, "rgba(255, 106, 0, 0.54)");
  stroke.addColorStop(1, "rgba(255, 106, 0, 0)");

  context.save();
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = stroke;
  context.lineCap = "round";

  for (let index = 0; index < lineCount; index += 1) {
    const lane = (index / Math.max(lineCount - 1, 1)) * 2 - 1;

    context.beginPath();

    for (let pointIndex = 0; pointIndex <= pointCount; pointIndex += 1) {
      const progress = pointIndex / pointCount;
      const point = getFieldPoint(
        metrics,
        lane,
        progress,
        time + index * 0.024,
        pointerX,
        pointerY,
      );

      if (pointIndex === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    }

    const centerWeight = 1 - Math.abs(lane);

    context.globalAlpha = 0.085 + centerWeight * 0.145;
    context.lineWidth = 0.52 + (index % 4) * 0.15;
    context.stroke();
  }

  context.restore();
}

function drawSparks(
  context: CanvasRenderingContext2D,
  metrics: FieldMetrics,
  sparks: FieldSpark[],
  elapsed: number,
  pointerX: number,
  pointerY: number,
) {
  const time = elapsed * 0.001;
  const colors = {
    orange: "#ff7a0c",
    pink: "#ed0074",
    red: "#ff273f",
  } as const;

  context.save();
  context.globalCompositeOperation = "lighter";

  for (const spark of sparks) {
    const progress = (spark.offset + time * spark.speed) % 1;
    const point = getFieldPoint(
      metrics,
      spark.lane,
      progress,
      elapsed * 0.00011,
      pointerX,
      pointerY,
    );
    const pulse = 0.68 + Math.sin(time * 1.4 + spark.phase) * 0.32;
    const color = colors[spark.tone];

    context.beginPath();
    context.fillStyle = color;
    context.globalAlpha = 0.42 * pulse;
    context.shadowBlur = 12;
    context.shadowColor = color;
    context.arc(point.x, point.y, 0.8 + pulse * 0.65, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function drawPulse(
  context: CanvasRenderingContext2D,
  metrics: FieldMetrics,
  pulse: number,
) {
  if (pulse <= 0.001) {
    return;
  }

  const progress = 1 - pulse;
  const radius = lerp(
    metrics.width < 700 ? metrics.width * 0.2 : metrics.height * 0.18,
    metrics.width * 0.66,
    progress,
  );
  const stroke = context.createLinearGradient(
    metrics.focusX - radius,
    metrics.focusY,
    metrics.focusX + radius,
    metrics.focusY,
  );

  stroke.addColorStop(0, "rgba(237, 0, 116, 0)");
  stroke.addColorStop(0.38, "rgba(237, 0, 116, 0.72)");
  stroke.addColorStop(0.66, "rgba(255, 58, 43, 0.64)");
  stroke.addColorStop(1, "rgba(255, 106, 0, 0)");

  context.save();
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = stroke;
  context.lineWidth = 1.2;

  for (let ringIndex = 0; ringIndex < 2; ringIndex += 1) {
    const ringRadius = radius * (1 + ringIndex * 0.07);

    context.globalAlpha = Math.pow(pulse, 1.35) * (0.38 - ringIndex * 0.14);
    context.beginPath();
    context.ellipse(
      metrics.focusX,
      metrics.focusY,
      ringRadius,
      ringRadius * 0.68,
      0,
      0,
      Math.PI * 2,
    );
    context.stroke();
  }
  context.restore();
}

export function LivingBrandField() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;

    if (!host || !canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let metrics = getMetrics(host);
    let sparks = createSparks(metrics.width < 700);
    let animationFrame = 0;
    let lastFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pulse = 0;
    let disposed = false;

    const resize = () => {
      metrics = getMetrics(host);
      canvas.width = Math.round(metrics.width * metrics.dpr);
      canvas.height = Math.round(metrics.height * metrics.dpr);
      canvas.style.width = `${metrics.width}px`;
      canvas.style.height = `${metrics.height}px`;
      sparks = createSparks(metrics.width < 700);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = clamp(event.clientX / window.innerWidth, 0, 1) * 2 - 1;
      pointerY = clamp(event.clientY / window.innerHeight, 0, 1) * 2 - 1;
    };

    const handlePulse = () => {
      pulse = 1;
    };

    const draw = (timestamp: number) => {
      if (disposed) {
        return;
      }

      const frameDelta = timestamp - lastFrame;

      if (frameDelta < TARGET_FRAME_DURATION && lastFrame > 0) {
        animationFrame = window.requestAnimationFrame(draw);
        return;
      }

      lastFrame = timestamp;
      pulse = Math.max(0, pulse - frameDelta / 1_500);

      context.setTransform(metrics.dpr, 0, 0, metrics.dpr, 0, 0);
      context.clearRect(0, 0, metrics.width, metrics.height);
      drawLuminousAtmosphere(context, metrics, pointerX, pointerY);
      drawSignatureStrands(context, metrics, timestamp, pointerX, pointerY);
      drawFieldLines(context, metrics, timestamp, pointerX, pointerY);
      drawSparks(context, metrics, sparks, timestamp, pointerX, pointerY);
      drawPulse(context, metrics, pulse);

      if (!mediaQuery.matches) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (mediaQuery.matches) {
        draw(window.performance.now());
      }
    });

    resize();
    resizeObserver.observe(host);
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener(BRAND_FIELD_PULSE_EVENT, handlePulse);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener(BRAND_FIELD_PULSE_EVENT, handlePulse);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={hostRef} className={styles.field} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
