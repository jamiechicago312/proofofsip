import {
  CATEGORY_LABELS,
  RATING_CATEGORIES,
  computeOverall,
  formatScore,
  nearestRatingStep,
  toBeanFill,
  type CategoryScores,
} from "@/lib/rating";
import { CoffeeBeanIcon } from "./coffee-bean-icon";
import { cx } from "@/lib/cx";
import styles from "./rating-display.module.css";

export type RatingDisplaySize = "sm" | "md";

export interface RatingDisplayProps {
  /**
   * The score to render as a four-bean meter. Category scores are exact
   * integers (-2..2); `overall` may land on a half-point (e.g. 1.5) — the
   * word shown is the nearest whole step's meaning, with the exact value
   * and a half-filled bean shown alongside it.
   */
  score: number;
  /** Optional caption shown before the meter, e.g. "Taste" or "Overall". */
  label?: string;
  /** Show the exact numeric value (e.g. "+1.5") next to the meter. */
  showScore?: boolean;
  size?: RatingDisplaySize;
  className?: string;
}

/**
 * Read-only rendering of a single rating value (one category, or the
 * computed overall): a four-bean fill meter, the plain-language word for
 * where it lands (always visible, not just implied by an icon), and
 * optionally the exact number. Pure display — no interaction, no
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
  const step = nearestRatingStep(score);
  const fill = toBeanFill(score);
  const beanSize = size === "sm" ? 13 : 16;
  const accessibleName = [
    label,
    step.label,
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
      <span className={styles.beans} aria-hidden="true">
        {[1, 2, 3, 4].map((position) => (
          <CoffeeBeanIcon
            key={position}
            fill={Math.max(0, Math.min(1, fill - (position - 1)))}
            size={beanSize}
            filledColor="var(--color-accent)"
            outlineColor="var(--color-fg-muted)"
          />
        ))}
      </span>
      <span className={styles.word} aria-hidden="true">
        {step.label}
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
