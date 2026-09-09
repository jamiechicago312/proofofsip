"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cafes, sips } from "@/lib/schema";
import { parseSipInput } from "@/lib/sip-input";

export async function saveSip(_previous: { error: string }, form: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in before saving." };
  let input: ReturnType<typeof parseSipInput>;
  try {
    input = parseSipInput(form);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Check your entry." };
  }
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
      } else {
        cafeId = randomUUID();
        const slug = input.cafe.name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "cafe";
        await transaction.insert(cafes).values({ id: cafeId, slug: `${slug}-${cafeId}`, ...input.cafe });
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
