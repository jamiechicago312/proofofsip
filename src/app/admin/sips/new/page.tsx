import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cafes } from "@/lib/schema";
import { SipForm } from "../sip-form";

export const metadata = {
  title: "New sip — Proof of Sip",
  robots: { index: false, follow: false },
};

export default async function NewSipPage() {
  if (!(await auth())?.user) redirect("/admin");
  const choices = await db().select({ id: cafes.id, name: cafes.name }).from(cafes).orderBy(asc(cafes.name));
  return <SipForm cafes={choices} />;
}
