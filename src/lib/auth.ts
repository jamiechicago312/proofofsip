import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAuthorizedAdminLogin } from "./admin";

/**
 * Auth.js (next-auth v5) configuration for the single-admin GitHub sign-in.
 *
 * `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` / `AUTH_SECRET` are read from the
 * environment. They are intentionally NOT validated/thrown-on here (unlike
 * `src/lib/db.ts`'s `DATABASE_URL` check, which throws lazily on first use):
 * the GitHub provider and NextAuth() itself both accept `undefined` client
 * credentials without throwing, and Auth.js only needs `AUTH_SECRET` when it
 * actually signs a session — never at module import or `next build` time.
 * This keeps `npm run build` working in environments (like CI, or before the
 * GitHub OAuth App exists) where none of these vars are set. See
 * UserToDo.md for the one-time setup a human does to get real values.
 *
 * Authorization — not just authentication — happens in the `signIn`
 * callback: only the GitHub account whose `login` matches
 * `ADMIN_GITHUB_USERNAME` is allowed to obtain a session. Everyone else who
 * authorizes the OAuth app is denied a session outright, not merely hidden
 * from admin UI.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: "/admin",
  },
  callbacks: {
    async signIn({ profile }) {
      return isAuthorizedAdminLogin(
        profile?.login as string | undefined,
        process.env.ADMIN_GITHUB_USERNAME,
      );
    },
  },
});
