import { describe, expect, it } from "vitest";

import {
  getLoopProgress,
  getPlateauAmount,
  smoothstep,
} from "@repo/motion/timeline";

describe("eMotion Motion timeline", () => {
  it("keeps loop progress deterministic for positive and negative time", () => {
    expect(getLoopProgress(4, 16)).toBe(0.25);
    expect(getLoopProgress(20, 16)).toBe(0.25);
    expect(getLoopProgress(-12, 16)).toBe(0.25);
  });

  it("creates smooth clamped windows", () => {
    expect(smoothstep(0.1, 0.2, 0.6)).toBe(0);
    expect(smoothstep(0.6, 0.2, 0.6)).toBe(1);
    expect(smoothstep(0.4, 0.2, 0.6)).toBeCloseTo(0.5);
  });

  it("creates a stable hold plateau between enter and exit windows", () => {
    const enter = { start: 0.2, end: 0.3 };
    const exit = { start: 0.7, end: 0.8 };

    expect(getPlateauAmount(0.1, enter, exit)).toBe(0);
    expect(getPlateauAmount(0.5, enter, exit)).toBe(1);
    expect(getPlateauAmount(0.9, enter, exit)).toBe(0);
  });

  it("rejects non-positive loop durations", () => {
    expect(() => getLoopProgress(1, 0)).toThrow(
      "Motion timeline duration must be greater than zero.",
    );
  });
});
