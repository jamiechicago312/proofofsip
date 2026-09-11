import { asc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cafes, sips } from "@/lib/schema";
import type { CategoryScores } from "@/lib/rating";
import { SipForm } from "../../sip-form";

export const metadata = {
  title: "Edit sip — Proof of Sip",
  robots: { index: false, follow: false },
};

export default async function EditSipPage({ params }: PageProps<"/admin/sips/[id]/edit">) {
  if (!(await auth())?.user) redirect("/admin");
  const { id } = await params;
  const [entry, choices] = await Promise.all([
    db().query.sips.findFirst({ where: eq(sips.id, id) }),
    db().select({ id: cafes.id, name: cafes.name }).from(cafes).orderBy(asc(cafes.name)),
  ]);
  if (!entry) notFound();
  return <SipForm cafes={choices} entry={{ ...entry, ...({ taste: entry.taste, atmosphere: entry.atmosphere, foam: entry.foam, cost: entry.cost } as CategoryScores), visitDate: entry.visitDate.toISOString().slice(0, 10) }} />;
}
