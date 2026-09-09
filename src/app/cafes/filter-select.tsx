"use client";

import type { ChangeEvent, SelectHTMLAttributes } from "react";

/**
 * A `<select>` that resubmits its parent GET form on change, so choosing a
 * sort/filter option navigates immediately without a separate "Apply"
 * click. Isolated as its own client component so the surrounding
 * `/cafes` page (and its data fetching) stays a server component — the
 * form still has a plain submit button as a no-JS fallback.
 */
export function FilterSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    event.currentTarget.form?.requestSubmit();
  }

  return <select {...props} onChange={handleChange} />;
}
