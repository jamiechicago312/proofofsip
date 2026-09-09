import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Proof of Sip</h1>
      <p className={styles.tagline}>
        A cappuccino-tasting journal for Chicago cafes — one write-up, photo,
        and rating per visit.
      </p>
    </main>
  );
}
