import styles from "./page.module.css";
import Link from "next/link";
import { getHomeJournal } from "@/lib/home";
import { RatingDisplay } from "@/components/rating-display";

export const dynamic = "force-dynamic";
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function Home() {
  const journal = await getHomeJournal();
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
      <p className={styles.eyebrow}>Chicago, one cappuccino at a time</p>
      <h1 className={styles.title}>Proof of Sip</h1>
      <p className={styles.tagline}>
        A cappuccino-tasting journal for Chicago cafes — one write-up, photo,
        and rating per visit.
      </p>
      <div className={styles.actions}>
        <Link href="/cafes" className={styles.button}>Explore the cafes</Link>
        <Link href="/admin">Write a sip</Link>
      </div>
      </header>
      <section aria-label="Journal statistics" className={styles.stats}>
        <div><strong>{journal.cafesVisited}</strong><span>Cafes visited</span></div>
        <div><strong>{journal.sipCount}</strong><span>Published sips</span></div>
        <div>{journal.average === null ? <strong>—</strong> : <RatingDisplay score={journal.average} />}<span>Average sip rating</span></div>
      </section>
      <section className={styles.mapTeaser} aria-labelledby="explore-title">
        <svg viewBox="0 0 300 160" aria-hidden="true" className={styles.mapArt}>
          <path d="M20 0V160M75 0V160M130 0V160M185 0V160M240 0V160M0 25H300M0 80H300M0 135H300" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M245 0Q200 55 250 100T275 160H300V0Z" fill="currentColor" opacity="0.15" />
          <circle cx="75" cy="80" r="9" fill="currentColor" /><circle cx="185" cy="25" r="9" fill="currentColor" /><circle cx="130" cy="135" r="9" fill="currentColor" />
        </svg>
        <div><h2 id="explore-title">Find your next coffee stop</h2><p>Browse the journal by neighborhood, or explore cafes on the map.</p><Link href="/cafes?view=map">Explore the map →</Link></div>
      </section>
      <section className={styles.recent} aria-labelledby="recent-title">
        <h2 id="recent-title">Recent sips</h2>
        {journal.recent.length === 0 ? <p>The journal is just getting started. Check back for the first sip.</p> :
          <ul className={styles.grid}>{journal.recent.map((sip) => <li key={sip.id}>
            <Link href={`/cafes/${encodeURIComponent(sip.slug)}#sip-${encodeURIComponent(sip.id)}`} className={styles.card}>
              {sip.photos[0] ? <picture><img src={sip.photos[0].url} alt={sip.photos[0].alt} width={600} height={400} loading="lazy" /></picture> : <div className={styles.placeholder} aria-hidden="true">☕</div>}
              <div className={styles.cardBody}>
                <p className={styles.eyebrow}>{sip.cafeName}{sip.neighborhood ? ` · ${sip.neighborhood}` : ""}</p>
                <h3>{sip.title}</h3>
                <time dateTime={sip.visitDate.toISOString()}>{dateFormatter.format(sip.visitDate)}</time>
                <RatingDisplay score={sip.overall} size="sm" />
              </div>
            </Link>
          </li>)}</ul>}
      </section>
    </main>
  );
}
