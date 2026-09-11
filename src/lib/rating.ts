/**
 * Rating system shared types and pure logic.
 *
 * See `plan.md` → "Rating system": every sip is scored on four categories,
 * each a five-step scale from -2 to +2. The `overall` score is the average
 * of those four, computed here so both the display and input components
 * (and, later, the admin form / API route that saves a sip) share one
 * source of truth instead of re-deriving it independently.
 *
 * Originally displayed as a thumbs-up/thumbs-down emoji per step
 * (👎👎/👎/🤷/👍/👍👍), which read as ambiguous and a little juvenile for a
 * tasting journal — two thumbs-down and one thumbs-down are hard to
 * tell apart at a glance, and an emoji alone doesn't say what it means.
 * Replaced with a plain-language word (always shown, never just implied by
 * an icon) plus a four-segment "bean meter" — see `toBeanFill` below and
 * `src/components/coffee-bean-icon.tsx`.
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

/** One step of the rating scale: the value plus its plain-language meaning. */
export interface RatingStep {
  value: RatingScore;
  /**
   * Plain-language meaning, always shown alongside the bean meter and the
   * exact number — the wording Yelp-style rating scales use (plan.md cites
   * Yelp as a direct reference), chosen so the middle step reads as a true
   * neutral rather than a shrug.
   */
  label: string;
}

/**
 * The five-step rating scale, -2..+2, as a single typed source of truth.
 * `rating-display.tsx` (read-only) and `rating-input.tsx` (interactive)
 * both render from this array so the wording never drifts between them.
 */
export const RATING_SCALE: readonly RatingStep[] = [
  { value: -2, label: "Poor" },
  { value: -1, label: "Fair" },
  { value: 0, label: "Average" },
  { value: 1, label: "Very good" },
  { value: 2, label: "Exceptional" },
];

const STEPS_BY_VALUE = new Map(RATING_SCALE.map((step) => [step.value, step]));

/** Looks up the rating-scale step for an exact -2..2 integer score. */
export function getRatingStep(score: RatingScore): RatingStep {
  const step = STEPS_BY_VALUE.get(score);
  if (!step) {
    throw new RangeError(
      `Invalid rating score: ${score}. Expected an integer from -2 to 2.`,
    );
  }
  return step;
}

/**
 * Rounds an arbitrary score to the nearest rating-scale step, for choosing
 * which word best describes a value that isn't necessarily an exact
 * integer (e.g. an `overall` average). Clamps to the -2..2 range first.
 */
export function nearestRatingStep(score: number): RatingStep {
  const clamped = Math.max(-2, Math.min(2, score));
  const rounded = Math.round(clamped) as RatingScore;
  return getRatingStep(rounded);
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
 * whole step, using JS `Math.round` tie-breaking (exact `.25`/`.75` ties
 * round toward +Infinity — e.g. `1.75 -> 2`, `-1.75 -> -1.5`). Keeping one
 * decimal of half-point precision avoids implying false accuracy from a
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

/**
 * Maps a -2..+2 score onto a 0..4 "beans filled" amount for the four-bean
 * meter (`src/components/coffee-bean-icon.tsx`) — four segments for a
 * four-unit range (-2 to +2), so each bean represents exactly one point of
 * the scale, rather than an arbitrary fifth "fencepost" bean. Supports the
 * half-point precision `overall` can land on (e.g. a score of `1.5` fills
 * 3.5 of the 4 beans).
 */
export function toBeanFill(score: number): number {
  return Math.max(0, Math.min(4, score + 2));
}
