import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getCafeBySlugWithSips, type SipEntry } from "@/lib/cafe-detail";
import { RatingSummary } from "@/components/rating-display";
import { CafeLocationMap } from "@/components/cafe-location-map";
import { directionsLinks, hasCoordinates } from "@/lib/map";
import type { CategoryScores } from "@/lib/rating";
import styles from "./page.module.css";

// This page queries the database on every request. There is no
// DATABASE_URL in the build environment, so it must not be statically
// prerendered (or executed) at build time — force dynamic rendering.
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function instagramHref(handle: string): string {
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export async function generateMetadata({
  params,
}: PageProps<"/cafes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cafe = await getCafeBySlugWithSips(slug);

  if (!cafe) {
    return { title: "Cafe not found — Proof of Sip", robots: { index: false } };
  }

  const title = `${cafe.name} — Proof of Sip`;
  const description = cafe.neighborhood
    ? `Cappuccino journal entries for ${cafe.name} in ${cafe.neighborhood}, Chicago.`
    : `Cappuccino journal entries for ${cafe.name}.`;

  return {
    title,
    description,
    alternates: { canonical: `/cafes/${encodeURIComponent(cafe.slug)}` },
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

function SipCard({ sip }: { sip: SipEntry }) {
  return (
    <article className={styles.sip} id={`sip-${sip.id}`}>
      {sip.photos.length > 0 ? (
        <div className={styles.photos}>
          {sip.photos.map((photo) => (
            // Photo URLs are arbitrary Vercel Blob uploads, not a known set
            // of remote hosts to allowlist for next/image — a plain <img>,
            // constrained by `.photo` (max-width: 100%, fixed aspect
            // ratio), avoids that config for MVP.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.url}
              src={photo.url}
              alt={photo.alt}
              className={styles.photo}
              loading="lazy"
            />
          ))}
        </div>
      ) : null}

      <div className={styles.sipHeader}>
        <h2 className={styles.sipTitle}>{sip.title}</h2>
        <time className={styles.visitDate} dateTime={sip.visitDate.toISOString()}>
          {dateFormatter.format(sip.visitDate)}
        </time>
      </div>

      <div className={styles.body}>
        <ReactMarkdown>{sip.body}</ReactMarkdown>
      </div>

      <RatingSummary
        // The DB schema constrains these smallint columns to -2..2 (see
        // the CHECK constraints in the migration / rating.ts validation on
        // write), but Drizzle's inferred column type is a plain `number` —
        // cast to the narrower `RatingScore` union that CategoryScores
        // expects.
        scores={
          {
            taste: sip.taste,
            atmosphere: sip.atmosphere,
            foam: sip.foam,
            cost: sip.cost,
          } as CategoryScores
        }
        overall={sip.overall}
      />

      {sip.priceLabel || sip.tags.length > 0 ? (
        <div className={styles.meta}>
          {sip.priceLabel ? (
            <span className={styles.priceLabel}>{sip.priceLabel}</span>
          ) : null}
          {sip.tags.length > 0 ? (
            <ul className={styles.tags}>
              {sip.tags.map((tag) => (
                <li key={tag} className={styles.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default async function CafeDetailPage({
  params,
}: PageProps<"/cafes/[slug]">) {
  const { slug } = await params;
  const cafe = await getCafeBySlugWithSips(slug);

  if (!cafe) {
    notFound();
  }

  const directions = directionsLinks(cafe);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.name}>{cafe.name}</h1>
        <div className={styles.details}>
          {cafe.neighborhood ? (
            <span className={styles.neighborhood}>{cafe.neighborhood}</span>
          ) : null}
          {cafe.address ? (
            <span className={styles.address}>{cafe.address}</span>
          ) : null}
        </div>
        {directions ? (
          <p className={styles.directions}>
            Get directions:{" "}
            <a
              href={directions.google}
              aria-label="Get directions on Google Maps"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google
            </a>
            <span aria-hidden="true"> | </span>
            <a
              href={directions.apple}
              aria-label="Get directions on Apple Maps"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apple
            </a>
          </p>
        ) : null}
        {cafe.website || cafe.instagram ? (
          <div className={styles.links}>
            {cafe.website ? (
              <a
                href={cafe.website}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Website
              </a>
            ) : null}
            {cafe.instagram ? (
              <a
                href={instagramHref(cafe.instagram)}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {cafe.instagram}
              </a>
            ) : null}
          </div>
        ) : null}
      </header>

      {cafe.sips.length > 0 ? (
        <section className={styles.feed} aria-label="Journal entries">
          {cafe.sips.map((sip) => (
            <SipCard key={sip.id} sip={sip} />
          ))}
        </section>
      ) : (
        <p className={styles.empty}>No published sips for this cafe yet.</p>
      )}

      {hasCoordinates(cafe) ? (
        <section className={styles.location} aria-labelledby="location-title">
          <h2 id="location-title" className={styles.locationTitle}>
            Location
          </h2>
          <CafeLocationMap name={cafe.name} lat={cafe.lat} lng={cafe.lng} />
        </section>
      ) : cafe.address ? (
        <section className={styles.location} aria-labelledby="location-title">
          <h2 id="location-title" className={styles.locationTitle}>
            Location
          </h2>
          <p className={styles.empty}>
            This cafe hasn&apos;t been mapped yet — use{" "}
            {directions ? (
              <a href={directions.google} target="_blank" rel="noopener noreferrer">
                Google Maps
              </a>
            ) : (
              "a maps app"
            )}{" "}
            to look it up by address in the meantime.
          </p>
        </section>
      ) : null}
    </main>
  );
}
