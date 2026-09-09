import { auth, signIn, signOut } from "@/lib/auth";
import styles from "./page.module.css";

export const metadata = {
  title: "Admin — Proof of Sip",
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

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Admin</h1>
      <p className={styles.status}>
        Signed in as <strong>{name}</strong>. The admin area (creating and
        editing sips) is coming in a later issue.
      </p>
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
