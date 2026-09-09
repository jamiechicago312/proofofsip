import styles from "./loading.module.css";

/**
 * Shown while the async `CafesPage` server component (in `page.tsx`) is
 * fetching cafe/sip data — Next.js renders this automatically via the App
 * Router's `loading.tsx` convention for the duration of that fetch.
 */
export default function CafesLoading() {
  return (
    <main className={styles.main} aria-busy="true" aria-live="polite">
      <span className={styles.srOnly}>Loading cafes…</span>
      <div className={styles.header} aria-hidden="true">
        <div className={`${styles.skeleton} ${styles.title}`} />
        <div className={`${styles.skeleton} ${styles.subtitle}`} />
      </div>
      <ul className={styles.grid} aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <li key={index} className={styles.card}>
            <div className={`${styles.skeleton} ${styles.photo}`} />
            <div className={styles.cardBody}>
              <div className={`${styles.skeleton} ${styles.cardName}`} />
              <div className={`${styles.skeleton} ${styles.cardLine}`} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
