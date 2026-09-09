import {
  CATEGORY_LABELS,
  RATING_CATEGORIES,
  computeOverall,
  formatScore,
  nearestThumb,
  type CategoryScores,
} from "@/lib/rating";
import { cx } from "@/lib/cx";
import styles from "./rating-display.module.css";

export type RatingDisplaySize = "sm" | "md";

export interface RatingDisplayProps {
  /**
   * The score to render, as thumbs. Category scores are exact integers
   * (-2..2); `overall` may land on a half-point (e.g. 1.5) — the emoji shown
   * is the nearest whole thumb, with the exact value alongside it.
   */
  score: number;
  /** Optional caption shown before the thumb, e.g. "Taste" or "Overall". */
  label?: string;
  /** Show the exact numeric value (e.g. "+1.5") next to the emoji. */
  showScore?: boolean;
  size?: RatingDisplaySize;
  className?: string;
}

/**
 * Read-only rendering of a single rating value (one category, or the
 * computed overall) as thumbs. Pure display — no interaction, no
 * hardcoded colors; all color/spacing comes from the design tokens in
 * `globals.css` via CSS module classes.
 */
export function RatingDisplay({
  score,
  label,
  showScore = true,
  size = "md",
  className,
}: RatingDisplayProps) {
  const thumb = nearestThumb(score);
  const accessibleName = [
    label,
    thumb.label,
    showScore ? formatScore(score) : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={cx(styles.rating, styles[size], className)}
      aria-label={accessibleName}
    >
      {label ? (
        <span className={styles.label} aria-hidden="true">
          {label}
        </span>
      ) : null}
      <span className={styles.thumb} aria-hidden="true">
        {thumb.emoji}
      </span>
      {showScore ? (
        <span className={styles.score} aria-hidden="true">
          {formatScore(score)}
        </span>
      ) : null}
    </span>
  );
}

export interface RatingSummaryProps {
  /** The four raw category scores for one sip. */
  scores: CategoryScores;
  /**
   * Precomputed overall, if already stored (matches the schema in
   * `plan.md`, where `overall` is saved alongside the raw values). Falls
   * back to computing it from `scores` when omitted.
   */
  overall?: number;
  size?: RatingDisplaySize;
  className?: string;
}

/**
 * Compact "all four categories + overall" summary, for list/map badges and
 * the cafe detail page's rating breakdown.
 */
export function RatingSummary({
  scores,
  overall,
  size = "sm",
  className,
}: RatingSummaryProps) {
  const overallScore = overall ?? computeOverall(scores);

  return (
    <div className={cx(styles.summary, styles[size], className)}>
      <RatingDisplay
        score={overallScore}
        label="Overall"
        size={size}
        className={styles.summaryOverall}
      />
      <ul className={styles.categoryList}>
        {RATING_CATEGORIES.map((category) => (
          <li key={category}>
            <RatingDisplay
              score={scores[category]}
              label={CATEGORY_LABELS[category]}
              size={size}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
