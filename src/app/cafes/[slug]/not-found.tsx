import Link from "next/link";
import styles from "./not-found.module.css";

export default function CafeNotFound() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Cafe not found</h1>
      <p className={styles.status}>
        We couldn&apos;t find a cafe at that address. It may have been
        renamed, removed, or the link is just wrong.
      </p>
      <Link href="/" className={styles.link}>
        Back to Proof of Sip
      </Link>
    </main>
  );
}
