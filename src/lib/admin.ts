/**
 * Authorization (not authentication) for the single-admin sign-in flow.
 *
 * Kept as a pure function, independent of Auth.js and `process.env`, so the
 * comparison logic is unit-testable without mocking a callback or the
 * environment. `src/lib/auth.ts` calls this from the `signIn` callback with
 * `process.env.ADMIN_GITHUB_USERNAME` supplied explicitly.
 */
export function isAuthorizedAdminLogin(
  login: string | null | undefined,
  adminUsername: string | null | undefined,
): boolean {
  if (!login || !adminUsername) return false;
  return login === adminUsername;
}
