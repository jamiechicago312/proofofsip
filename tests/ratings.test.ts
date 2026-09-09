import { describe, expect, it } from "vitest";
import { computeOverall } from "../src/lib/ratings";

describe("computeOverall", () => {
  it("averages the four category ratings", () => {
    expect(computeOverall(2, 2, 2, 2)).toBe(2);
    expect(computeOverall(-2, -2, -2, -2)).toBe(-2);
    expect(computeOverall(0, 0, 0, 0)).toBe(0);
  });

  it("rounds to two decimal places", () => {
    // (2 + 1 + 1 + 0) / 4 = 1.0
    expect(computeOverall(2, 1, 1, 0)).toBe(1);
    // (2 + 2 + 1 + 0) / 4 = 1.25
    expect(computeOverall(2, 2, 1, 0)).toBe(1.25);
    // (1 + 1 + 1 + 0) / 4 = 0.75
    expect(computeOverall(1, 1, 1, 0)).toBe(0.75);
  });

  it("handles mixed positive/negative ratings", () => {
    // (2 + -2 + 1 + -1) / 4 = 0
    expect(computeOverall(2, -2, 1, -1)).toBe(0);
    // (-1 + -1 + -1 + -2) / 4 = -1.25
    expect(computeOverall(-1, -1, -1, -2)).toBe(-1.25);
  });

  it("never exceeds the -2..2 category range", () => {
    for (const t of [-2, -1, 0, 1, 2] as const) {
      for (const a of [-2, -1, 0, 1, 2] as const) {
        for (const f of [-2, -1, 0, 1, 2] as const) {
          for (const c of [-2, -1, 0, 1, 2] as const) {
            const overall = computeOverall(t, a, f, c);
            expect(overall).toBeGreaterThanOrEqual(-2);
            expect(overall).toBeLessThanOrEqual(2);
          }
        }
      }
    }
  });
});
