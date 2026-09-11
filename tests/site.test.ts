import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { siteUrl } from "../src/lib/site";

const ENV_KEYS = ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"] as const;
const original: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    original[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

describe("siteUrl", () => {
  it("falls back to localhost when nothing is configured", () => {
    expect(siteUrl().toString()).toBe("http://localhost:3000/");
  });

  it("prefers an explicit NEXT_PUBLIC_SITE_URL over Vercel's own env vars", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://proofofsip.example";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "proofofsip.vercel.app";
    expect(siteUrl().toString()).toBe("https://proofofsip.example/");
  });

  it("falls back to Vercel's stable production URL over the per-deployment one", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "proofofsip.vercel.app";
    process.env.VERCEL_URL = "proofofsip-git-branch.vercel.app";
    expect(siteUrl().toString()).toBe("https://proofofsip.vercel.app/");
  });

  it("falls back to the current deployment's own URL for preview deploys", () => {
    process.env.VERCEL_URL = "proofofsip-git-branch.vercel.app";
    expect(siteUrl().toString()).toBe("https://proofofsip-git-branch.vercel.app/");
  });
});
