"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { geocodeAddress } from "@/lib/geocode";
import { cafes, sips } from "@/lib/schema";
import { parseSipInput } from "@/lib/sip-input";

/**
 * Fills in lat/lng from the address when both were left blank (issue #29:
 * Leaflet needs coordinates, and nothing previously derived them from a
 * typed street address). Manually-entered coordinates always win - this
 * only runs when there's nothing to lose. A failed/no-match lookup just
 * leaves the cafe without coordinates, same as today; it never blocks
 * saving. Done outside the DB transaction since it's a network call.
 */
async function resolveCafeCoordinates(cafe: { address: string | null; lat: number | null; lng: number | null }) {
  if (cafe.lat !== null && cafe.lng !== null) return { lat: cafe.lat, lng: cafe.lng };
  if (!cafe.address) return { lat: null, lng: null };
  const geocoded = await geocodeAddress(cafe.address);
  return geocoded ? { lat: geocoded.lat, lng: geocoded.lng } : { lat: null, lng: null };
}

export async function saveSip(_previous: { error: string }, form: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in before saving." };
  let input: ReturnType<typeof parseSipInput>;
  try {
    input = parseSipInput(form);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Check your entry." };
  }
  const coordinates = await resolveCafeCoordinates(input.cafe);
  try {
    await db().transaction(async (transaction) => {
      if (input.id) {
        const existing = await transaction.query.sips.findFirst({ where: eq(sips.id, input.id) });
        if (!existing) throw new Error("Missing sip");
      }
      let cafeId = input.cafeId;
      if (cafeId) {
        const cafe = await transaction.query.cafes.findFirst({ where: eq(cafes.id, cafeId) });
        if (!cafe) throw new Error("Missing cafe");
        // The sip form always submits the selected cafe's location fields
        // (whether reusing an existing cafe or creating one) - only a
        // bare/minimal submission omits them, in which case leave the
        // cafe's own row untouched rather than blanking it out.
        if (input.hasCafeLocationFields) {
          await transaction
            .update(cafes)
            .set({ neighborhood: input.cafe.neighborhood, address: input.cafe.address, ...coordinates })
            .where(eq(cafes.id, cafeId));
        }
      } else {
        cafeId = randomUUID();
        const slug = input.cafe.name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cafe";
        await transaction.insert(cafes).values({ id: cafeId, slug: `${slug}-${cafeId}`, ...input.cafe, ...coordinates });
      }
      if (input.id) {
        await transaction.update(sips).set({ ...input.sip, cafeId, updatedAt: new Date() }).where(eq(sips.id, input.id));
      } else {
        await transaction.insert(sips).values({ id: randomUUID(), cafeId, ...input.sip });
      }
    });
  } catch {
    return { error: "Could not save your sip. Check the cafe selection and try again." };
  }
  revalidatePath("/", "layout");
  redirect("/admin?saved=1");
}
