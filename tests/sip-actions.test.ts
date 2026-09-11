import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), db: vi.fn(), revalidatePath: vi.fn(), redirect: vi.fn(), geocodeAddress: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/db", () => ({ db: mocks.db }));
vi.mock("@/lib/geocode", () => ({ geocodeAddress: mocks.geocodeAddress }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { saveSip } from "../src/app/admin/sips/actions";
import { cafes } from "../src/lib/schema";

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
    // No `address` field in this submission (the bare shape older callers
    // and this test use) — the cafe row must be left untouched rather than
    // blanked out. See the geocoding tests below for when it does update.
    expect(transaction.update).not.toHaveBeenCalledWith(cafes);
  });

  // Issue #29: a cafe with an address but no coordinates never showed up
  // on the map, and there was no way to add coordinates after creation.
  describe("cafe address/coordinates (issue #29)", () => {
    it("geocodes a new cafe's address when no coordinates are entered", async () => {
      mocks.auth.mockResolvedValue({ user: { name: "Jamie" } });
      mocks.geocodeAddress.mockResolvedValue({ lat: 41.88, lng: -87.63 });
      const values = vi.fn().mockResolvedValue(undefined);
      const transaction = { insert: vi.fn().mockReturnValue({ values }) };
      mocks.db.mockReturnValue({ transaction: async (operation: (value: typeof transaction) => Promise<void>) => operation(transaction) });
      const form = new FormData();
      Object.entries({
        cafeId: "", cafeName: "New Cafe", address: "123 Main St, Chicago, IL",
        title: "Coffee", body: "Great", visitDate: "2026-09-09",
        taste: "2", atmosphere: "0", foam: "0", cost: "0",
      }).forEach(([name, value]) => form.set(name, value));
      await saveSip({ error: "" }, form);
      expect(mocks.geocodeAddress).toHaveBeenCalledWith("123 Main St, Chicago, IL");
      expect(values.mock.calls[0][0]).toMatchObject({ lat: 41.88, lng: -87.63 });
    });

    it("leaves manually-entered coordinates on a new cafe alone (no geocode lookup)", async () => {
      mocks.auth.mockResolvedValue({ user: { name: "Jamie" } });
      const values = vi.fn().mockResolvedValue(undefined);
      const transaction = { insert: vi.fn().mockReturnValue({ values }) };
      mocks.db.mockReturnValue({ transaction: async (operation: (value: typeof transaction) => Promise<void>) => operation(transaction) });
      const form = new FormData();
      Object.entries({
        cafeId: "", cafeName: "New Cafe", address: "123 Main St, Chicago, IL", lat: "41.5", lng: "-87.5",
        title: "Coffee", body: "Great", visitDate: "2026-09-09",
        taste: "2", atmosphere: "0", foam: "0", cost: "0",
      }).forEach(([name, value]) => form.set(name, value));
      await saveSip({ error: "" }, form);
      expect(mocks.geocodeAddress).not.toHaveBeenCalled();
      expect(values.mock.calls[0][0]).toMatchObject({ lat: 41.5, lng: -87.5 });
    });

    it("updates an existing cafe's address/coordinates when its location fields are submitted, geocoding when none were entered", async () => {
      mocks.auth.mockResolvedValue({ user: { name: "Jamie" } });
      mocks.geocodeAddress.mockResolvedValue({ lat: 41.9, lng: -87.7 });
      const cafeWhere = vi.fn().mockResolvedValue(undefined);
      const cafeSet = vi.fn().mockReturnValue({ where: cafeWhere });
      const sipValues = vi.fn().mockResolvedValue(undefined);
      const transaction = {
        query: { cafes: { findFirst: vi.fn().mockResolvedValue({ id: "cafe-1" }) } },
        update: vi.fn().mockReturnValue({ set: cafeSet }),
        insert: vi.fn().mockReturnValue({ values: sipValues }),
      };
      mocks.db.mockReturnValue({ transaction: async (operation: (value: typeof transaction) => Promise<void>) => operation(transaction) });
      const form = new FormData();
      Object.entries({
        cafeId: "cafe-1", neighborhood: "Wicker Park", address: "1543 N Milwaukee Ave, Chicago, IL",
        title: "Coffee", body: "Great", visitDate: "2026-09-09",
        taste: "2", atmosphere: "0", foam: "0", cost: "0",
      }).forEach(([name, value]) => form.set(name, value));
      await saveSip({ error: "" }, form);
      expect(mocks.geocodeAddress).toHaveBeenCalledWith("1543 N Milwaukee Ave, Chicago, IL");
      expect(transaction.update).toHaveBeenCalledWith(cafes);
      expect(cafeSet).toHaveBeenCalledWith({
        neighborhood: "Wicker Park",
        address: "1543 N Milwaukee Ave, Chicago, IL",
        lat: 41.9,
        lng: -87.7,
      });
      expect(cafeWhere).toHaveBeenCalledOnce();
    });
  });
});
