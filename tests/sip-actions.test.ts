import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), db: vi.fn(), revalidatePath: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({ db: mocks.db }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { saveSip } from "../src/app/admin/sips/actions";

describe("saveSip authorization", () => {
  beforeEach(() => vi.resetAllMocks());

  it("rejects direct unauthenticated calls before accessing the database", async () => {
    mocks.auth.mockResolvedValue(null);
    expect(await saveSip({ error: "" }, new FormData())).toEqual({ error: "Please sign in before saving." });
    expect(mocks.db).not.toHaveBeenCalled();
  });

  it("rejects malformed submissions before accessing the database", async () => {
    mocks.auth.mockResolvedValue({ user: { name: "Jamie" } });
    expect((await saveSip({ error: "" }, new FormData())).error).toBeTruthy();
    expect(mocks.db).not.toHaveBeenCalled();
  });

  it("creates a sip with a computed score inside a transaction", async () => {
    mocks.auth.mockResolvedValue({ user: { name: "Jamie" } });
    const values = vi.fn().mockResolvedValue(undefined);
    const transaction = {
      query: { cafes: { findFirst: vi.fn().mockResolvedValue({ id: "cafe-1" }) } },
      insert: vi.fn().mockReturnValue({ values }),
    };
    mocks.db.mockReturnValue({ transaction: async (operation: (value: typeof transaction) => Promise<void>) => operation(transaction) });
    const form = new FormData();
    Object.entries({ cafeId: "cafe-1", title: "Coffee", body: "Great", visitDate: "2026-09-09", taste: "2", atmosphere: "0", foam: "0", cost: "0", overall: "2" }).forEach(([name, value]) => form.set(name, value));
    await saveSip({ error: "" }, form);
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ cafeId: "cafe-1", overall: 0.5, published: false }));
    expect(mocks.redirect).toHaveBeenCalledWith("/admin?saved=1");
  });

  it("updates an entry without replacing its photos", async () => {
    mocks.auth.mockResolvedValue({ user: { name: "Jamie" } });
    const where = vi.fn().mockResolvedValue(undefined);
    const set = vi.fn().mockReturnValue({ where });
    const transaction = {
      query: {
        cafes: { findFirst: vi.fn().mockResolvedValue({ id: "cafe-1" }) },
        sips: { findFirst: vi.fn().mockResolvedValue({ id: "sip-1" }) },
      },
      update: vi.fn().mockReturnValue({ set }),
    };
    mocks.db.mockReturnValue({ transaction: async (operation: (value: typeof transaction) => Promise<void>) => operation(transaction) });
    const form = new FormData();
    Object.entries({ id: "sip-1", cafeId: "cafe-1", title: "Updated", body: "Great", visitDate: "2026-09-09", taste: "2", atmosphere: "0", foam: "0", cost: "0" }).forEach(([name, value]) => form.set(name, value));
    await saveSip({ error: "" }, form);
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ title: "Updated" }));
    expect(set.mock.calls[0][0]).not.toHaveProperty("photos");
    expect(where).toHaveBeenCalledOnce();
  });
});
