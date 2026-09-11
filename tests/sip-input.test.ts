import { describe, expect, it } from "vitest";
import { parseSipInput } from "../src/lib/sip-input";

function validForm() {
  const form = new FormData();
  Object.entries({ cafeId: "cafe-1", title: "Morning coffee", body: "Lovely foam.", visitDate: "2026-09-09", taste: "2", atmosphere: "1", foam: "0", cost: "-1", published: "on" }).forEach(([name, value]) => form.set(name, value));
  return form;
}

describe("sip validation", () => {
  it("requires valid paired map coordinates for a new cafe", () => {
    const form = validForm();
    form.set("lat", "41.88");
    expect(() => parseSipInput(form)).toThrow("both valid");
    form.set("lng", "-87.63");
    expect(parseSipInput(form).cafe).toMatchObject({ lat: 41.88, lng: -87.63 });
    form.set("lat", "91");
    expect(() => parseSipInput(form)).toThrow("both valid");
  });
  it("computes the score on the server and normalizes tags", () => {
    const form = validForm();
    form.set("overall", "2");
    form.set("tags", " oat milk, wifi, oat milk, ");
    expect(parseSipInput(form).sip).toMatchObject({ overall: 0.5, tags: ["oat milk", "wifi"], published: true });
  });

  it("saves unchecked publication as a draft", () => {
    const form = validForm();
    form.delete("published");
    expect(parseSipInput(form).sip.published).toBe(false);
  });

  it.each(["", "3", "-3", "1.5", "NaN", "on"])("rejects invalid ratings: %s", (rating) => {
    const form = validForm();
    form.set("taste", rating);
    expect(() => parseSipInput(form)).toThrow();
  });

  it.each(["2026-02-30", "2026-13-01", "invalid"])("rejects impossible dates: %s", (date) => {
    const form = validForm();
    form.set("visitDate", date);
    expect(() => parseSipInput(form)).toThrow("valid visit date");
  });

  it("requires a name when creating a cafe", () => {
    const form = validForm();
    form.set("cafeId", "");
    expect(() => parseSipInput(form)).toThrow("cafeName is required");
    form.set("cafeName", " New cafe ");
    expect(parseSipInput(form).cafe.name).toBe("New cafe");
  });

  it.each(["title", "body"])("rejects blank %s", (field) => {
    const form = validForm();
    form.set(field, "   ");
    expect(() => parseSipInput(form)).toThrow();
  });

  // `hasCafeLocationFields` distinguishes "the sip form's cafe-location
  // fieldset was actually submitted" from a bare/minimal submission (e.g. a
  // future API caller, or these tests' own `validForm()`), independent of
  // whether those fields are blank — see saveSip's use of it in
  // src/app/admin/sips/actions.ts (issue #29).
  it("flags whether cafe-location fields were submitted at all, regardless of their values", () => {
    expect(parseSipInput(validForm()).hasCafeLocationFields).toBe(false);
    const form = validForm();
    form.set("address", "");
    expect(parseSipInput(form).hasCafeLocationFields).toBe(true);
    form.set("address", "1543 N Milwaukee Ave");
    expect(parseSipInput(form).hasCafeLocationFields).toBe(true);
  });
});
