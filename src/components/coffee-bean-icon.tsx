/**
 * A single coffee-bean glyph, filled from 0 (empty outline) to 1 (solid),
 * used to build the four-bean rating meter (see `toBeanFill` in
 * `src/lib/rating.ts`) and the single-bean highlight in `RatingInput`.
 *
 * Colors are passed in explicitly as CSS color strings (including a
 * `var(--color-*)` reference, which resolves normally in a real browser)
 * rather than read from `currentColor` — kept deliberately simple and
 * dependency-free rather than reaching for `currentColor`'s inheritance
 * rules, since this same shape may be worth reusing somewhere that can't
 * resolve CSS custom properties later (e.g. a generated image).
 */

export interface CoffeeBeanIconProps {
  /** 0 (empty) to 1 (fully filled); values between render a partial fill (e.g. 0.5 for a half bean). */
  fill: number;
  size?: number;
  filledColor?: string;
  outlineColor?: string;
  className?: string;
}

// A vertical bean-shaped oval with a gentle S-crease down the middle —
// hand-drawn rather than a plain circle/ellipse so it reads as a coffee
// bean, not a generic dot, even at small sizes.
const BEAN_OUTLINE =
  "M12 2C16.14 2 19.5 6.48 19.5 12C19.5 17.52 16.14 22 12 22C7.86 22 4.5 17.52 4.5 12C4.5 6.48 7.86 2 12 2Z";
const BEAN_CREASE = "M12 4C9.5 7 14.5 9.5 12 12C9.5 14.5 14.5 17 12 20";

export function CoffeeBeanIcon({
  fill,
  size = 16,
  filledColor = "currentColor",
  outlineColor = "currentColor",
  className,
}: CoffeeBeanIconProps) {
  const clamped = Math.max(0, Math.min(1, fill));

  return (
    <span
      className={className}
      style={{ position: "relative", display: "inline-block", width: size, height: size, flexShrink: 0, lineHeight: 0 }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <path d={BEAN_OUTLINE} fill="none" stroke={outlineColor} strokeWidth={1.5} opacity={0.45} />
        <path d={BEAN_CREASE} fill="none" stroke={outlineColor} strokeWidth={1.3} strokeLinecap="round" opacity={0.45} />
      </svg>
      {clamped > 0 ? (
        <span style={{ position: "absolute", inset: 0, width: `${clamped * 100}%`, overflow: "hidden" }}>
          <svg viewBox="0 0 24 24" width={size} height={size}>
            <path d={BEAN_OUTLINE} fill={filledColor} />
          </svg>
        </span>
      ) : null}
    </span>
  );
}
