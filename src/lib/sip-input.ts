import { computeOverall, RATING_CATEGORIES, type CategoryScores } from "./rating";

export function parseSipInput(form: FormData) {
  function field(name: string, max: number, required = false) {
    const raw = form.get(name);
    if (raw !== null && typeof raw !== "string") throw new Error(`Invalid ${name}.`);
    const value = (raw ?? "").trim();
    if (required && !value) throw new Error(`${name} is required.`);
    if (value.length > max) throw new Error(`${name} must be at most ${max} characters.`);
    return value;
  }

  const scores = Object.fromEntries(RATING_CATEGORIES.map((category) => {
    const value = field(category, 2, true);
    if (!/^-?[0-2]$/.test(value)) throw new Error(`Invalid ${category} rating.`);
    return [category, Number(value)];
  })) as unknown as CategoryScores;
  const date = field("visitDate", 10, true);
  const visitDate = new Date(`${date}T12:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(visitDate.getTime()) || visitDate.toISOString().slice(0, 10) !== date) {
    throw new Error("Enter a valid visit date.");
  }
  const cafeId = field("cafeId", 100);
  const cafeName = field("cafeName", 200, !cafeId);
  const tags = [...new Set(field("tags", 500).split(",").map((tag) => tag.trim()).filter(Boolean))];
  if (tags.length > 20 || tags.some((tag) => tag.length > 50)) throw new Error("Use up to 20 tags, each at most 50 characters.");

  return {
    id: field("id", 100),
    cafeId,
    cafe: { name: cafeName, neighborhood: field("neighborhood", 200) || null, address: field("address", 500) || null },
    sip: {
      title: field("title", 200, true),
      body: field("body", 50000, true),
      visitDate,
      ...scores,
      overall: computeOverall(scores),
      tags,
      priceLabel: field("priceLabel", 50) || null,
      published: form.get("published") === "on",
    },
  };
}
