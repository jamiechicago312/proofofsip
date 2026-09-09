"use client";

import { useId } from "react";
import {
  CATEGORY_LABELS,
  THUMBS_SCALE,
  type RatingCategory,
  type RatingScore,
} from "@/lib/rating";
import { cx } from "@/lib/cx";
import styles from "./rating-input.module.css";

export type RatingInputSize = "sm" | "md";

export interface RatingInputProps {
  /** Known category this input is for — supplies the default label. */
  category?: RatingCategory;
  /** Caption shown above the options. Overrides the category's default label. */
  label?: string;
  /** The controlled current value. */
  value: RatingScore;
  /** Called with the newly selected score. */
  onChange: (value: RatingScore) => void;
  /** `name` for the underlying radio group; derived from `category`/`label` if omitted. */
  name?: string;
  size?: RatingInputSize;
  disabled?: boolean;
  className?: string;
}

/**
 * Interactive five-way thumbs selector for one rating category, used by the
 * (future) admin sip form. A controlled component: the caller owns `value`
 * and receives updates via `onChange`. Built on native radio inputs (one
 * per thumbs-scale step) so keyboard support — Tab into the group, arrow
 * keys to move between options — comes from the browser, not reimplemented
 * roving-tabindex logic. Uses only design tokens for styling.
 */
export function RatingInput({
  category,
  label,
  value,
  onChange,
  name,
  size = "md",
  disabled = false,
  className,
}: RatingInputProps) {
  const autoId = useId();
  const groupName = name ?? category ?? autoId;
  const groupLabel = label ?? (category ? CATEGORY_LABELS[category] : undefined);

  return (
    <div
      className={cx(styles.group, styles[size], disabled && styles.disabled, className)}
      role="group"
      aria-label={groupLabel}
    >
      {groupLabel ? (
        <span className={styles.groupLabel} aria-hidden="true">
          {groupLabel}
        </span>
      ) : null}
      <div className={styles.options}>
        {THUMBS_SCALE.map((thumb) => {
          const optionId = `${groupName}-${thumb.value}`;
          const selected = value === thumb.value;
          return (
            <label
              key={thumb.value}
              htmlFor={optionId}
              className={cx(styles.option, selected && styles.selected)}
            >
              <input
                type="radio"
                id={optionId}
                name={groupName}
                className={styles.input}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(thumb.value)}
              />
              <span className={styles.emoji} aria-hidden="true">
                {thumb.emoji}
              </span>
              <span className={styles.visuallyHidden}>{thumb.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
