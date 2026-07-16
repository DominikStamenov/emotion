import { MathUtils } from "three";

export const HERO_CYCLE_DURATION = 12;

export type HeroTimeline = {
  cycleProgress: number;
  gatherAmount: number;
  formationAmount: number;
  revealAmount: number;
  dissolveAmount: number;
  freedomAmount: number;
};

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

export function getHeroTimeline(
  elapsedTime: number,
): HeroTimeline {
  const normalizedTime =
    ((elapsedTime % HERO_CYCLE_DURATION) +
      HERO_CYCLE_DURATION) %
    HERO_CYCLE_DURATION;

  const cycleProgress =
    normalizedTime / HERO_CYCLE_DURATION;

  /**
   * 00–24%  Stillness / awakening
   * 24–49%  Gathering
   * 49–74%  Formation and reveal
   * 74–95%  Dissolve
   * 95–100% Freedom
   */
  const gatherAmount = smoothRange(
    cycleProgress,
    0.24,
    0.49,
  );

  const dissolveAmount = smoothRange(
    cycleProgress,
    0.74,
    0.95,
  );

  const formationAmount = MathUtils.clamp(
    gatherAmount * (1 - dissolveAmount),
    0,
    1,
  );

  const revealAmount = smoothRange(
    formationAmount,
    0.3,
    0.9,
  );

  const freedomAmount = smoothRange(
    cycleProgress,
    0.92,
    1,
  );

  return {
    cycleProgress,
    gatherAmount,
    formationAmount,
    revealAmount,
    dissolveAmount,
    freedomAmount,
  };
}

export function getLogoFormationAmount(
  elapsedTime: number,
) {
  return getHeroTimeline(
    elapsedTime,
  ).formationAmount;
}