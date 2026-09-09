import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync("src/app/globals.css", "utf8");

const RAMP_STEPS = [
  "950",
  "900",
  "800",
  "700",
  "600",
  "500",
  "400",
  "300",
  "200",
  "100",
  "50",
  "0",
];

const SEMANTIC_TOKENS = [
  "--color-bg",
  "--color-surface",
  "--color-border",
  "--color-fg",
  "--color-fg-muted",
  "--color-accent",
  "--color-accent-fg",
  "--color-focus-ring",
];

describe("design tokens", () => {
  it("defines a full coffee neutral ramp as valid hex colors", () => {
    for (const step of RAMP_STEPS) {
      const match = stylesheet.match(
        new RegExp(`--coffee-${step}:\\s*(#[0-9a-fA-F]{6})\\s*;`),
      );
      expect(match, `expected --coffee-${step} to be a 6-digit hex color`).not
        .toBeNull();
    }
  });

  it("orders the ramp from near-black espresso to near-white cream", () => {
    const darkest = stylesheet.match(/--coffee-950:\s*#([0-9a-fA-F]{6})\s*;/);
    const lightest = stylesheet.match(/--coffee-0:\s*#([0-9a-fA-F]{6})\s*;/);
    expect(darkest).not.toBeNull();
    expect(lightest).not.toBeNull();

    const luminanceOf = (hex: string) => {
      const n = Number.parseInt(hex, 16);
      const r = (n >> 16) & 0xff;
      const g = (n >> 8) & 0xff;
      const b = n & 0xff;
      return (r + g + b) / 3;
    };

    expect(luminanceOf(darkest![1])).toBeLessThan(luminanceOf(lightest![1]));
  });

  it("defines every semantic token in the default (light) root scope", () => {
    for (const token of SEMANTIC_TOKENS) {
      expect(
        stylesheet,
        `expected ${token} to be defined in :root`,
      ).toContain(`${token}: var(--coffee-`);
    }
  });

  it("redefines every semantic token under prefers-color-scheme: dark", () => {
    const darkBlockMatch = stylesheet.match(
      /@media \(prefers-color-scheme: dark\)\s*\{([\s\S]*?)\n\}/,
    );
    expect(darkBlockMatch, "expected a prefers-color-scheme: dark block").not
      .toBeNull();

    const darkBlock = darkBlockMatch![1];
    for (const token of SEMANTIC_TOKENS) {
      expect(
        darkBlock,
        `expected ${token} to be redefined for dark mode`,
      ).toContain(`${token}: var(--coffee-`);
    }
  });

  it("does not hardcode a manual theme toggle attribute", () => {
    expect(stylesheet).not.toContain("[data-theme");
  });
});
