/**
 * Rating system shared types and pure logic.
 *
 * See `plan.md` → "Rating system": every sip is scored on four categories,
 * each a five-step thumbs scale from -2 to +2. The `overall` score is the
 * average of those four, computed here so both the display and input
 * components (and, later, the admin form / API route that saves a sip)
 * share one source of truth instead of re-deriving it independently.
 */

/** The four independently-rated categories for a sip. */
export type RatingCategory = "taste" | "atmosphere" | "foam" | "cost";

/** Every rating category, in the canonical display order. */
export const RATING_CATEGORIES: readonly RatingCategory[] = [
  "taste",
  "atmosphere",
  "foam",
  "cost",
];

/** Human-friendly label for each category, shared by display and input UI. */
export const CATEGORY_LABELS: Readonly<Record<RatingCategory, string>> = {
  taste: "Taste",
  atmosphere: "Atmosphere",
  foam: "Foam",
  cost: "Cost",
};

/** A single category score: five discrete steps from -2 to +2. */
export type RatingScore = -2 | -1 | 0 | 1 | 2;

/** One sip's four raw category scores. */
export interface CategoryScores {
  taste: RatingScore;
  atmosphere: RatingScore;
  foam: RatingScore;
  cost: RatingScore;
}

/** One step of the thumbs scale: the value plus its emoji/text rendering. */
export interface ThumbStep {
  value: RatingScore;
  emoji: string;
  /** Short text label, used for accessible names and tooltips. */
  label: string;
}

/**
 * The five-step thumbs scale, -2..+2, as a single typed source of truth.
 * `rating-display.tsx` (read-only) and `rating-input.tsx` (interactive)
 * both render from this array so the emoji/labels never drift apart.
 */
export const THUMBS_SCALE: readonly ThumbStep[] = [
  { value: -2, emoji: "👎👎", label: "Terrible" },
  { value: -1, emoji: "👎", label: "Not great" },
  { value: 0, emoji: "🤷", label: "Okay" },
  { value: 1, emoji: "👍", label: "Good" },
  { value: 2, emoji: "👍👍", label: "Excellent" },
];

const THUMBS_BY_VALUE = new Map(THUMBS_SCALE.map((step) => [step.value, step]));

/** Looks up the thumbs-scale step for an exact -2..2 integer score. */
export function getThumb(score: RatingScore): ThumbStep {
  const step = THUMBS_BY_VALUE.get(score);
  if (!step) {
    throw new RangeError(
      `Invalid rating score: ${score}. Expected an integer from -2 to 2.`,
    );
  }
  return step;
}

/**
 * Rounds an arbitrary score to the nearest thumbs-scale step, for choosing
 * which emoji best represents a value that isn't necessarily an exact
 * integer (e.g. an `overall` average). Clamps to the -2..2 range first.
 */
export function nearestThumb(score: number): ThumbStep {
  const clamped = Math.max(-2, Math.min(2, score));
  const rounded = Math.round(clamped) as RatingScore;
  return getThumb(rounded);
}

function assertValidScore(category: RatingCategory, value: RatingScore): void {
  if (!Number.isInteger(value) || value < -2 || value > 2) {
    throw new RangeError(
      `Invalid ${category} score: ${value}. Expected an integer from -2 to 2.`,
    );
  }
}

/**
 * Computes the `overall` score for a sip as the average of its four
 * category scores (taste, atmosphere, foam, cost).
 *
 * Rounding choice: the average is rounded to the **nearest 0.5**, not to a
 * whole thumb step, using JS `Math.round` tie-breaking (exact `.25`/`.75`
 * ties round toward +Infinity — e.g. `1.75 -> 2`, `-1.75 -> -1.5`). Keeping
 * one decimal of half-point precision avoids implying false accuracy from a
 * raw average like `1.1666...`, while still distinguishing sips a plain
 * integer average would collapse together (e.g. `1,1,1,2` -> `1.25` ->
 * `1.5`, vs. `1,1,1,1` -> `1.0`) — which matters once cafes are ranked by
 * the average of their sips' overall scores.
 */
export function computeOverall(scores: CategoryScores): number {
  for (const category of RATING_CATEGORIES) {
    assertValidScore(category, scores[category]);
  }

  const sum = scores.taste + scores.atmosphere + scores.foam + scores.cost;
  const average = sum / RATING_CATEGORIES.length;

  return Math.round(average * 2) / 2;
}

/** Formats a score (integer or the half-point `overall`) with an explicit sign. */
export function formatScore(score: number): string {
  const sign = score > 0 ? "+" : "";
  return `${sign}${score}`;
}
