"use client";

import { useState } from "react";
import { RatingDisplay, RatingSummary } from "@/components/rating-display";
import { RatingInput } from "@/components/rating-input";
import {
  RATING_CATEGORIES,
  computeOverall,
  type CategoryScores,
  type RatingScore,
} from "@/lib/rating";
import styles from "./page.module.css";

const SAMPLE_SCORES: CategoryScores = {
  taste: 2,
  atmosphere: 1,
  foam: 2,
  cost: -1,
};

/**
 * Dev-only preview of the Issue #6 rating components, so they're visually
 * reviewable before the list/map/detail/admin views (later issues) wire
 * them up for real. Not linked from the public nav.
 */
export default function RatingPreviewPage() {
  const [scores, setScores] = useState<CategoryScores>(SAMPLE_SCORES);

  function setScore(category: keyof CategoryScores, value: RatingScore) {
    setScores((prev) => ({ ...prev, [category]: value }));
  }

  return (
    <main className={styles.main}>
      <h1>Rating components preview</h1>
      <p className={styles.tagline}>
        Dev-only route for reviewing <code>RatingDisplay</code>,{" "}
        <code>RatingSummary</code>, and <code>RatingInput</code> (Issue #6).
      </p>

      <section className={styles.section}>
        <h2>RatingDisplay — single category, both sizes</h2>
        <div className={styles.row}>
          <RatingDisplay score={2} label="Taste" size="md" />
          <RatingDisplay score={0} label="Foam" size="md" />
          <RatingDisplay score={-2} label="Cost" size="sm" />
        </div>
      </section>

      <section className={styles.section}>
        <h2>RatingDisplay — overall (half-point average)</h2>
        <div className={styles.row}>
          <RatingDisplay score={computeOverall(SAMPLE_SCORES)} label="Overall" />
          <RatingDisplay score={1.5} label="Overall" />
          <RatingDisplay score={-1.5} label="Overall" />
        </div>
      </section>

      <section className={styles.section}>
        <h2>RatingSummary — compact all-four + overall</h2>
        <RatingSummary scores={SAMPLE_SCORES} />
      </section>

      <section className={styles.section}>
        <h2>RatingInput — interactive, controlled</h2>
        <div className={styles.inputGrid}>
          {RATING_CATEGORIES.map((category) => (
            <RatingInput
              key={category}
              category={category}
              value={scores[category]}
              onChange={(value) => setScore(category, value)}
            />
          ))}
        </div>
        <p className={styles.tagline}>
          Live overall from the selections above:{" "}
          <strong>{computeOverall(scores)}</strong>
        </p>
      </section>
    </main>
  );
}
