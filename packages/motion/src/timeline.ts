export type TimelineWindow = {
  start: number;
  end: number;
};

export function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function smoothstep(value: number, start: number, end: number) {
  if (start === end) {
    return value >= end ? 1 : 0;
  }

  const progress = clamp((value - start) / (end - start));

  return progress * progress * (3 - 2 * progress);
}

export function getLoopProgress(elapsedTime: number, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Motion timeline duration must be greater than zero.");
  }

  const normalizedTime = ((elapsedTime % duration) + duration) % duration;

  return normalizedTime / duration;
}

export function getWindowAmount(
  progress: number,
  { start, end }: TimelineWindow,
) {
  return smoothstep(progress, start, end);
}

export function getPlateauAmount(
  progress: number,
  enter: TimelineWindow,
  exit: TimelineWindow,
) {
  return clamp(
    getWindowAmount(progress, enter) * (1 - getWindowAmount(progress, exit)),
  );
}
