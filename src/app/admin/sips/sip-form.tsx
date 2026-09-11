"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { RatingInput } from "@/components/rating-input";
import { RATING_CATEGORIES, type CategoryScores } from "@/lib/rating";
import { saveSip } from "./actions";
import styles from "./sip-form.module.css";
import type { Photo } from "@/lib/schema";
import { PhotoUpload } from "./photo-upload";

export type SipFormEntry = CategoryScores & {
  id: string; cafeId: string; title: string; body: string; visitDate: string;
  tags: string[]; priceLabel: string | null; published: boolean;
  photos?: Photo[];
};

/**
 * A cafe as offered in the "Cafe" dropdown. The location fields are
 * optional so a minimal `{ id, name }` still satisfies the type — but the
 * admin pages always fetch the full row, so selecting a cafe can pre-fill
 * its current address/coordinates for editing (see issue #29).
 */
export type CafeOption = {
  id: string;
  name: string;
  neighborhood?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
};

function locationFieldsFor(cafe: CafeOption | undefined) {
  return {
    neighborhood: cafe?.neighborhood ?? "",
    address: cafe?.address ?? "",
    lat: cafe?.lat != null ? String(cafe.lat) : "",
    lng: cafe?.lng != null ? String(cafe.lng) : "",
  };
}

export function SipForm({ cafes, entry }: {
  cafes: CafeOption[];
  entry?: SipFormEntry;
}) {
  const [state, action, pending] = useActionState(saveSip, { error: "" });
  const [cafeId, setCafeId] = useState(entry?.cafeId ?? cafes[0]?.id ?? "");
  const [scores, setScores] = useState<CategoryScores>(entry ?? { taste: 0, atmosphere: 0, foam: 0, cost: 0 });
  const [fields, setFields] = useState({
    cafeName: "",
    ...locationFieldsFor(cafes.find((cafe) => cafe.id === cafeId)),
    title: entry?.title ?? "",
    body: entry?.body ?? "",
    visitDate: entry?.visitDate ?? new Date().toISOString().slice(0, 10),
    tags: entry?.tags.join(", ") ?? "",
    priceLabel: entry?.priceLabel ?? "",
  });
  const [published, setPublished] = useState(entry?.published ?? true);
  const [photos, setPhotos] = useState<Photo[]>(entry?.photos ?? []);
  const [uploading, setUploading] = useState(false);
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
    <form action={action} className={styles.form} onSubmit={(event) => { if (uploading) event.preventDefault(); }}>
      <fieldset disabled={pending} className={styles.fields}>
        <legend>Sip details</legend>
        <input type="hidden" name="id" value={entry?.id ?? ""} />
        <label>Cafe<select name="cafeId" value={cafeId} onChange={(event) => {
          const nextId = event.target.value;
          setCafeId(nextId);
          setFields((previous) => ({ ...previous, ...locationFieldsFor(cafes.find((cafe) => cafe.id === nextId)) }));
        }}>
          {cafes.map((cafe) => <option key={cafe.id} value={cafe.id}>{cafe.name}</option>)}
          <option value="">Create a new cafe</option>
        </select></label>
        <fieldset className={styles.fields}>
          <legend>{cafeId ? "Cafe location" : "New cafe"}</legend>
          {!cafeId && <label>Cafe name<input {...textField("cafeName")} required maxLength={200} /></label>}
          <label>Neighborhood<input {...textField("neighborhood")} maxLength={200} /></label>
          <label>Address<input {...textField("address")} maxLength={500} /></label>
          <p>
            Optional map location: enter both coordinates, or leave them
            blank and Proof of Sip will look them up from the address when
            you save.
          </p>
          <label>Latitude<input {...textField("lat")} type="number" step="any" min={-90} max={90} /></label>
          <label>Longitude<input {...textField("lng")} type="number" step="any" min={-180} max={180} /></label>
        </fieldset>
        <label>Title<input {...textField("title")} required maxLength={200} /></label>
        <label>Visit date<input {...textField("visitDate")} type="date" required /></label>
        <label>Journal entry (Markdown supported)<textarea {...textField("body")} rows={12} required maxLength={50000} /></label>
        {RATING_CATEGORIES.map((category) => <RatingInput key={category} category={category} value={scores[category]} onChange={(value) => setScores((previous) => ({ ...previous, [category]: value }))} />)}
        <label>Tags (comma-separated)<input {...textField("tags")} maxLength={500} /></label>
        <label>Price (optional)<input {...textField("priceLabel")} placeholder="$5.50" maxLength={50} /></label>
        <label className={styles.checkbox}><input type="checkbox" name="published" checked={published} onChange={(event) => setPublished(event.target.checked)} />Published — visible to everyone</label>
      </fieldset>
      <PhotoUpload photos={photos} onChange={setPhotos} onBusyChange={setUploading} disabled={pending || uploading} />
      {state.error && <p role="alert">{state.error}</p>}
      <button disabled={pending || uploading} type="submit">{pending ? "Saving…" : uploading ? "Uploading photos…" : "Save sip"}</button>
    </form>
  </main>;
}
