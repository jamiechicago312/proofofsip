"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function SearchInput({ query, className }: { query: string; className?: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (input.current) input.current.value = query;
  }, [query]);

  useEffect(() => {
    const form = input.current?.form;
    const cancel = () => clearTimeout(timeout.current);
    form?.addEventListener("submit", cancel);
    return () => {
      cancel();
      form?.removeEventListener("submit", cancel);
    };
  }, []);

  return <input ref={input} type="search" name="q" defaultValue={query}
    className={className} maxLength={200} placeholder="Name, neighborhood, or tag"
    onChange={() => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        const form = input.current?.form;
        if (!form) return;
        const params = new URLSearchParams();
        for (const [name, value] of new FormData(form)) {
          if (typeof value === "string" && value.trim()) params.set(name, value.trim());
        }
        router.replace(`/cafes?${params.toString()}`, { scroll: false });
      }, 350);
    }} />;
}
