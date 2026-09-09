"use client";

import { useEffect } from "react";
import styles from "./error.module.css";

/**
 * Next.js App Router error boundary for the `/cafes` route (required to
 * be a client component — see the `error.tsx` file convention). Catches
 * failures from `page.tsx`'s data fetch, most likely `listCafesWithRatings()`
 * throwing because `DATABASE_URL` isn't configured yet (see `src/lib/db.ts`),
 * and shows a plain-language message instead of a raw stack trace.
 */
export default function CafesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Failed to load /cafes:", error);
  }, [error]);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Couldn&apos;t load cafes</h1>
      <p className={styles.message}>
        Something went wrong fetching the cafe list. If this is a fresh
        deploy, the database may not be configured yet — see{" "}
        <code>UserToDo.md</code> for setup. Otherwise, try again.
      </p>
      <button type="button" onClick={() => reset()} className={styles.button}>
        Try again
      </button>
    </main>
  );
}
