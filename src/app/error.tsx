"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className={styles.main}><h1>The journal couldn’t load</h1><p>Please try again in a moment.</p><button onClick={reset}>Try again</button><Link href="/cafes">Browse cafes</Link></main>;
}
