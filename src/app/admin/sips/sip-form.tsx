"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { RatingInput } from "@/components/rating-input";
import { RATING_CATEGORIES, type CategoryScores } from "@/lib/rating";
import { saveSip } from "./actions";
import styles from "./sip-form.module.css";

export type SipFormEntry = CategoryScores & {
  id: string; cafeId: string; title: string; body: string; visitDate: string;
  tags: string[]; priceLabel: string | null; published: boolean;
};

export function SipForm({ cafes, entry }: {
  cafes: { id: string; name: string }[];
  entry?: SipFormEntry;
}) {
  const [state, action, pending] = useActionState(saveSip, { error: "" });
  const [cafeId, setCafeId] = useState(entry?.cafeId ?? cafes[0]?.id ?? "");
  const [scores, setScores] = useState<CategoryScores>(entry ?? { taste: 0, atmosphere: 0, foam: 0, cost: 0 });
  const [fields, setFields] = useState({
    cafeName: "",
    neighborhood: "",
    address: "",
    title: entry?.title ?? "",
    body: entry?.body ?? "",
    visitDate: entry?.visitDate ?? new Date().toISOString().slice(0, 10),
    tags: entry?.tags.join(", ") ?? "",
    priceLabel: entry?.priceLabel ?? "",
  });
  const [published, setPublished] = useState(entry?.published ?? true);
  function textField(name: keyof typeof fields) {
    return {
      name,
      value: fields[name],
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setFields((previous) => ({ ...previous, [name]: event.target.value })),
    };
  }
  return <main className={styles.main}>
    <Link href="/admin">← Admin</Link>
    <h1>{entry ? "Edit sip" : "New sip"}</h1>
    <form action={action} className={styles.form}>
      <fieldset disabled={pending} className={styles.fields}>
        <legend>Sip details</legend>
        <input type="hidden" name="id" value={entry?.id ?? ""} />
        <label>Cafe<select name="cafeId" value={cafeId} onChange={(event) => setCafeId(event.target.value)}>
          {cafes.map((cafe) => <option key={cafe.id} value={cafe.id}>{cafe.name}</option>)}
          <option value="">Create a new cafe</option>
        </select></label>
        {!cafeId && <fieldset className={styles.fields}><legend>New cafe</legend>
          <label>Cafe name<input {...textField("cafeName")} required maxLength={200} /></label>
          <label>Neighborhood<input {...textField("neighborhood")} maxLength={200} /></label>
          <label>Address<input {...textField("address")} maxLength={500} /></label>
        </fieldset>}
        <label>Title<input {...textField("title")} required maxLength={200} /></label>
        <label>Visit date<input {...textField("visitDate")} type="date" required /></label>
        <label>Journal entry (Markdown supported)<textarea {...textField("body")} rows={12} required maxLength={50000} /></label>
        {RATING_CATEGORIES.map((category) => <RatingInput key={category} category={category} value={scores[category]} onChange={(value) => setScores((previous) => ({ ...previous, [category]: value }))} />)}
        <label>Tags (comma-separated)<input {...textField("tags")} maxLength={500} /></label>
        <label>Price (optional)<input {...textField("priceLabel")} placeholder="$5.50" maxLength={50} /></label>
        <label className={styles.checkbox}><input type="checkbox" name="published" checked={published} onChange={(event) => setPublished(event.target.checked)} />Published — visible to everyone</label>
      </fieldset>
      {state.error && <p role="alert">{state.error}</p>}
      <button disabled={pending} type="submit">{pending ? "Saving…" : "Save sip"}</button>
    </form>
  </main>;
}
