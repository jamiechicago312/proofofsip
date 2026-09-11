import { auth, signIn, signOut } from "@/lib/auth";
import styles from "./page.module.css";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cafes, sips } from "@/lib/schema";

export const metadata = {
  title: "Admin — Proof of Sip",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: PageProps<"/admin">) {
  const session = await auth();
  const params = await searchParams;
  const wasDenied = params?.error === "AccessDenied";

  if (!session?.user) {
    return (
      <main className={styles.main}>
        <h1 className={styles.title}>Admin sign-in</h1>
        <p className={styles.status}>
          This area is restricted to Proof of Sip&apos;s author. Sign in with
          the authorized GitHub account to continue.
        </p>
        {wasDenied ? (
          <p className={styles.status}>
            That GitHub account isn&apos;t authorized for admin access.
          </p>
        ) : null}
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/admin" });
          }}
        >
          <button type="submit" className={styles.button}>
            Sign in with GitHub
          </button>
        </form>
      </main>
    );
  }

  const name = session.user.name ?? session.user.email ?? "the admin account";
  const entries = await db().select({ id: sips.id, title: sips.title, published: sips.published, cafeName: cafes.name }).from(sips).innerJoin(cafes, eq(sips.cafeId, cafes.id)).orderBy(desc(sips.updatedAt));

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Admin</h1>
      <p className={styles.status}>
        Signed in as <strong>{name}</strong>.
      </p>
      {params?.saved === "1" && <p role="status">Sip saved.</p>}
      <Link href="/admin/sips/new" className={styles.button}>Write a sip</Link>
      <Link href="/cafes">Browse cafes</Link>
      {entries.length ? <ul>{entries.map((entry) => <li key={entry.id}><Link href={`/admin/sips/${entry.id}/edit`}>{entry.title}</Link> — {entry.cafeName} ({entry.published ? "Published" : "Draft"})</li>)}</ul> : <p>No sips yet. Write your first entry.</p>}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/admin" });
        }}
      >
        <button type="submit" className={`${styles.button} ${styles.secondary}`}>
          Sign out
        </button>
      </form>
    </main>
  );
}
