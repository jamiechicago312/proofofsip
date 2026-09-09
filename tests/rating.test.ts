import { describe, expect, it } from "vitest";
import {
  CATEGORY_LABELS,
  RATING_CATEGORIES,
  THUMBS_SCALE,
  computeOverall,
  formatScore,
  getThumb,
  nearestThumb,
  type CategoryScores,
} from "@/lib/rating";

describe("THUMBS_SCALE", () => {
  it("has one step per integer from -2 to 2, in order", () => {
    expect(THUMBS_SCALE.map((step) => step.value)).toEqual([-2, -1, 0, 1, 2]);
  });

  it("gives every step a non-empty emoji and label", () => {
    for (const step of THUMBS_SCALE) {
      expect(step.emoji.length).toBeGreaterThan(0);
      expect(step.label.length).toBeGreaterThan(0);
    }
  });
});

describe("RATING_CATEGORIES / CATEGORY_LABELS", () => {
  it("has a label for every category", () => {
    for (const category of RATING_CATEGORIES) {
      expect(CATEGORY_LABELS[category]).toBeTruthy();
    }
  });
});

describe("getThumb", () => {
  it("returns the matching step for each valid score", () => {
    expect(getThumb(-2).emoji).toBe("👎👎");
    expect(getThumb(-1).emoji).toBe("👎");
    expect(getThumb(0).emoji).toBe("🤷");
    expect(getThumb(1).emoji).toBe("👍");
    expect(getThumb(2).emoji).toBe("👍👍");
  });

  it("throws for an out-of-range score", () => {
    // @ts-expect-error - deliberately passing an invalid score
    expect(() => getThumb(3)).toThrow(RangeError);
  });
});

describe("nearestThumb", () => {
  it("rounds a fractional score to the nearest whole step", () => {
    expect(nearestThumb(1.5).value).toBe(2);
    expect(nearestThumb(1.4).value).toBe(1);
    expect(nearestThumb(-1.5).value).toBe(-1);
  });

  it("clamps values outside -2..2", () => {
    expect(nearestThumb(5).value).toBe(2);
    expect(nearestThumb(-5).value).toBe(-2);
  });
});

describe("formatScore", () => {
  it("prefixes positive scores with a + sign", () => {
    expect(formatScore(2)).toBe("+2");
    expect(formatScore(1.5)).toBe("+1.5");
  });

  it("leaves zero and negative scores unprefixed", () => {
    expect(formatScore(0)).toBe("0");
    expect(formatScore(-2)).toBe("-2");
    expect(formatScore(-1.5)).toBe("-1.5");
  });
});

describe("computeOverall", () => {
  it("averages four equal scores to that same value", () => {
    const allTwo: CategoryScores = { taste: 2, atmosphere: 2, foam: 2, cost: 2 };
    expect(computeOverall(allTwo)).toBe(2);

    const allNegOne: CategoryScores = {
      taste: -1,
      atmosphere: -1,
      foam: -1,
      cost: -1,
    };
    expect(computeOverall(allNegOne)).toBe(-1);

    const allZero: CategoryScores = { taste: 0, atmosphere: 0, foam: 0, cost: 0 };
    expect(computeOverall(allZero)).toBe(0);
  });

  it("averages mixed positive and negative scores that cancel out", () => {
    const scores: CategoryScores = { taste: 2, atmosphere: -2, foam: 1, cost: -1 };
    expect(computeOverall(scores)).toBe(0);
  });

  it("averages mixed positive and negative scores to a non-zero result", () => {
    const scores: CategoryScores = { taste: 2, atmosphere: 1, foam: -1, cost: 0 };
    // sum = 2, average = 0.5 - already an exact half-point, no rounding.
    expect(computeOverall(scores)).toBe(0.5);
  });

  it("keeps an exact half-point average unrounded", () => {
    const scores: CategoryScores = { taste: 2, atmosphere: 2, foam: 1, cost: 1 };
    // sum = 6, average = 1.5
    expect(computeOverall(scores)).toBe(1.5);
  });

  it("rounds a positive .25/.75 tie up to the next half-point", () => {
    const scores: CategoryScores = { taste: 2, atmosphere: 2, foam: 2, cost: 1 };
    // sum = 7, average = 1.75 -> rounds (ties toward +Infinity) to 2
    expect(computeOverall(scores)).toBe(2);
  });

  it("rounds a negative .25/.75 tie toward +Infinity, per documented Math.round semantics", () => {
    const scores: CategoryScores = {
      taste: -2,
      atmosphere: -2,
      foam: -2,
      cost: -1,
    };
    // sum = -7, average = -1.75 -> rounds to -1.5 (not -2)
    expect(computeOverall(scores)).toBe(-1.5);
  });

  it("rounds a non-tie fractional average to the nearest half-point", () => {
    const scores: CategoryScores = { taste: 2, atmosphere: 1, foam: 1, cost: 1 };
    // sum = 5, average = 1.25 -> nearer to 1.5 than 1.0? equidistant actually -
    // 1.25 is exactly between 1.0 and 1.5, another tie case handled the same way.
    expect(computeOverall(scores)).toBe(1.5);
  });

  it("stays within -2..2 for every possible combination", () => {
    for (const taste of [-2, -1, 0, 1, 2] as const) {
      for (const atmosphere of [-2, -1, 0, 1, 2] as const) {
        for (const foam of [-2, -1, 0, 1, 2] as const) {
          for (const cost of [-2, -1, 0, 1, 2] as const) {
            const overall = computeOverall({ taste, atmosphere, foam, cost });
            expect(overall).toBeGreaterThanOrEqual(-2);
            expect(overall).toBeLessThanOrEqual(2);
            // Always a multiple of 0.5.
            expect(Number.isInteger(overall * 2)).toBe(true);
          }
        }
      }
    }
  });

  it("throws for a non-integer category score", () => {
    const scores = {
      taste: 1.5,
      atmosphere: 0,
      foam: 0,
      cost: 0,
    } as unknown as CategoryScores;
    expect(() => computeOverall(scores)).toThrow(RangeError);
  });

  it("throws for an out-of-range category score", () => {
    const scores = {
      taste: 3,
      atmosphere: 0,
      foam: 0,
      cost: 0,
    } as unknown as CategoryScores;
    expect(() => computeOverall(scores)).toThrow(RangeError);
  });
});
