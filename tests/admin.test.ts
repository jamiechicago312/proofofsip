import { describe, expect, it } from "vitest";
import { isAuthorizedAdminLogin } from "../src/lib/admin";

describe("isAuthorizedAdminLogin", () => {
  it("allows the configured admin username", () => {
    expect(isAuthorizedAdminLogin("jamiechicago312", "jamiechicago312")).toBe(
      true,
    );
  });

  it("denies any other GitHub login", () => {
    expect(isAuthorizedAdminLogin("someoneelse", "jamiechicago312")).toBe(
      false,
    );
  });

  it("is case-sensitive (GitHub usernames are compared exactly)", () => {
    expect(isAuthorizedAdminLogin("JamieChicago312", "jamiechicago312")).toBe(
      false,
    );
  });

  it("denies when the login is missing", () => {
    expect(isAuthorizedAdminLogin(undefined, "jamiechicago312")).toBe(false);
    expect(isAuthorizedAdminLogin(null, "jamiechicago312")).toBe(false);
    expect(isAuthorizedAdminLogin("", "jamiechicago312")).toBe(false);
  });

  it("denies everyone when ADMIN_GITHUB_USERNAME is not configured", () => {
    expect(isAuthorizedAdminLogin("jamiechicago312", undefined)).toBe(false);
    expect(isAuthorizedAdminLogin("jamiechicago312", null)).toBe(false);
    expect(isAuthorizedAdminLogin("jamiechicago312", "")).toBe(false);
  });
});
