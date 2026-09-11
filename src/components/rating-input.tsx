"use client";

import { useId } from "react";
import {
  CATEGORY_LABELS,
  RATING_SCALE,
  type RatingCategory,
  type RatingScore,
} from "@/lib/rating";
import { CoffeeBeanIcon } from "./coffee-bean-icon";
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
 * Interactive five-way rating selector for one category, used by the admin
 * sip form. A controlled component: the caller owns `value` and receives
 * updates via `onChange`. Built on native radio inputs (one per
 * rating-scale step) so keyboard support — Tab into the group, arrow keys
 * to move between options — comes from the browser, not reimplemented
 * roving-tabindex logic.
 *
 * Each option shows one coffee-bean icon, filled only when selected —
 * *not* a cumulative meter like `RatingDisplay`'s, since this is choosing
 * one of five distinct values rather than reading a filled amount — plus
 * its plain-language word, always visible (not hidden behind a tooltip or
 * an ambiguous emoji), so there's never any doubt what an option means.
 * Uses only design tokens for styling.
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
  const beanSize = size === "sm" ? 18 : 22;

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
        {RATING_SCALE.map((step) => {
          const optionId = `${groupName}-${step.value}`;
          const selected = value === step.value;
          return (
            <label
              key={step.value}
              htmlFor={optionId}
              className={cx(styles.option, selected && styles.selected)}
            >
              <input
                type="radio"
                id={optionId}
                name={groupName}
                value={step.value}
                className={styles.input}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(step.value)}
              />
              <CoffeeBeanIcon
                fill={selected ? 1 : 0}
                size={beanSize}
                filledColor="var(--color-accent)"
                outlineColor="var(--color-fg-muted)"
                className={styles.icon}
              />
              <span className={styles.optionWord}>{step.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
