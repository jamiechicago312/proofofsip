import styles from "./page.module.css";

export default function Loading() {
  return <main className={styles.main}><p role="status">Loading the journal…</p></main>;
}
