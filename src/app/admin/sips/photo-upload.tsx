"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { Photo } from "@/lib/schema";
import { MAX_PHOTOS, PHOTO_TYPES, validatePhotoFile } from "@/lib/photos";
import styles from "./sip-form.module.css";

export function PhotoUpload({ photos, onChange, onBusyChange, disabled }: {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  onBusyChange: (busy: boolean) => void;
  disabled: boolean;
}) {
  const busy = useRef(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function addFiles(files: File[]) {
    if (busy.current || disabled || !files.length) return;
    setError("");
    try {
      if (photos.length + files.length > MAX_PHOTOS) throw new Error("Use up to 8 photos per sip.");
      files.forEach(validatePhotoFile);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Invalid photo.");
      return;
    }
    busy.current = true;
    onBusyChange(true);
    const uploaded = [...photos];
    try {
      for (const [index, file] of files.entries()) {
        setStatus(`Uploading photo ${index + 1} of ${files.length}…`);
        const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
        const blob = await upload(`sips/${crypto.randomUUID()}.${extension}`, file, {
          access: "public",
          handleUploadUrl: "/api/photos/upload",
        });
        uploaded.push({ url: blob.url, alt: "" });
        onChange([...uploaded]);
      }
      setStatus("Photos uploaded. Add descriptions, then save your sip.");
    } catch {
      setStatus("");
      setError("Photo upload failed. Check your connection and sign-in, and confirm BLOB_READ_WRITE_TOKEN is configured. Any completed uploads are kept; retry the remaining files.");
    } finally {
      busy.current = false;
      onBusyChange(false);
    }
  }

  return <section className={styles.photos} aria-label="Photos">
    <h2>Photos</h2>
    <p>Up to 8 JPEG, PNG, or WebP images, 8 MB each. Uploaded images have public URLs, including for drafts.</p>
    <div className={styles.dropZone} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
      event.preventDefault();
      void addFiles(Array.from(event.dataTransfer.files));
    }}>
      <label>Choose photos or drop them here<input type="file" accept={PHOTO_TYPES.join(",")} multiple disabled={disabled} onChange={(event) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        void addFiles(files);
      }} /></label>
    </div>
    <input type="hidden" name="photos" value={JSON.stringify(photos)} />
    {photos.map((photo, index) => <div key={photo.url} className={styles.photoRow}>
      <picture><img src={photo.url} alt={photo.alt} width={160} height={120} /></picture>
      <label>Description for photo {index + 1}<input value={photo.alt} maxLength={300} disabled={disabled} onChange={(event) => onChange(photos.map((item, position) => position === index ? { ...item, alt: event.target.value } : item))} /></label>
      <button type="button" disabled={disabled} onClick={() => onChange(photos.filter((_, position) => position !== index))}>Remove photo {index + 1}</button>
    </div>)}
    <p role="status">{status}</p>
    {error && <p role="alert">{error}</p>}
  </section>;
}
