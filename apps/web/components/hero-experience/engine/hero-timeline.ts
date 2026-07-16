import { MathUtils } from "three";

export const HERO_CYCLE_DURATION = 14;

export type HeroTimeline = {
  cycleProgress: number;
  gatherAmount: number;
  formationAmount: number;
  revealAmount: number;
  holdAmount: number;
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
   * 00–20%  Stillness / awakening
   * 20–45%  Gathering
   * 45–75%  Full reveal and extended hold
   * 75–95%  Dissolve
   * 95–100% Freedom
   */
  const gatherAmount = smoothRange(
    cycleProgress,
    0.2,
    0.45,
  );

  const dissolveAmount = smoothRange(
    cycleProgress,
    0.75,
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

  /**
   * A stable plateau used for subtle material polish.
   * It reaches one only after the mark is fully formed
   * and fades before the dissolve becomes noticeable.
   */
  const holdAmount = MathUtils.clamp(
    smoothRange(cycleProgress, 0.45, 0.51) *
      (1 - smoothRange(cycleProgress, 0.69, 0.75)),
    0,
    1,
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
    holdAmount,
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
