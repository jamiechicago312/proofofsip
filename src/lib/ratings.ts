/** A single thumbs-scale category rating: 👎👎 -2 … +2 👍👍 */
export type CategoryRating = -2 | -1 | 0 | 1 | 2;

/**
 * Computes a sip's overall rating from its four category ratings.
 *
 * This is the "computed on save" value described in plan.md's data model:
 * it runs in application code (not as a generated SQL column) and the
 * result is stored on the `sips.overall` column so list/sort/filter views
 * never need to recompute it at read time.
 *
 * Rounded to two decimal places to match the `numeric(3, 2)` column.
 */
export function computeOverall(
  taste: CategoryRating,
  atmosphere: CategoryRating,
  foam: CategoryRating,
  cost: CategoryRating,
): number {
  const average = (taste + atmosphere + foam + cost) / 4;
  return Math.round(average * 100) / 100;
}
