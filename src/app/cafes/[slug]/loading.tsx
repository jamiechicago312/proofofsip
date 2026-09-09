import styles from "./loading.module.css";

export default function CafeDetailLoading() {
  return (
    <main className={styles.main} aria-busy="true" aria-live="polite">
      <div className={styles.header}>
        <div className={`${styles.skeleton} ${styles.title}`} />
        <div className={`${styles.skeleton} ${styles.line}`} />
      </div>
      <div className={styles.feed}>
        <div className={`${styles.skeleton} ${styles.card}`} />
        <div className={`${styles.skeleton} ${styles.card}`} />
      </div>
      <span className={styles.srOnly}>Loading cafe…</span>
    </main>
  );
}
