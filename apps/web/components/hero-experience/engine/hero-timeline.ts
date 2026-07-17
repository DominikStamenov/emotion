import { MathUtils } from "three";
import {
  getLoopProgress,
  getPlateauAmount,
  smoothstep,
} from "@repo/motion/timeline";

export const HERO_CYCLE_DURATION = 16;

export type HeroTimeline = {
  cycleProgress: number;
  gatherAmount: number;
  formationAmount: number;
  revealAmount: number;
  holdAmount: number;
  dissolveAmount: number;
  freedomAmount: number;
};

export function getHeroTimeline(elapsedTime: number): HeroTimeline {
  const cycleProgress = getLoopProgress(elapsedTime, HERO_CYCLE_DURATION);

  /**
   * 00–18%  Stillness / awakening
   * 18–42%  Gathering
   * 42–82%  Full reveal and extended hold
   * 82–98%  Dissolve
   * 98–100% Freedom
   */
  const gatherAmount = smoothstep(cycleProgress, 0.18, 0.42);

  const dissolveAmount = smoothstep(cycleProgress, 0.82, 0.98);

  const formationAmount = MathUtils.clamp(
    gatherAmount * (1 - dissolveAmount),
    0,
    1,
  );

  const revealAmount = smoothstep(formationAmount, 0.3, 0.9);

  /**
   * A stable plateau used for subtle material polish.
   * It reaches one only after the mark is fully formed
   * and fades before the dissolve becomes noticeable.
   */
  const holdAmount = getPlateauAmount(
    cycleProgress,
    { start: 0.42, end: 0.49 },
    { start: 0.76, end: 0.82 },
  );

  const freedomAmount = smoothstep(cycleProgress, 0.96, 1);

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

export function getLogoFormationAmount(elapsedTime: number) {
  return getHeroTimeline(elapsedTime).formationAmount;
}
