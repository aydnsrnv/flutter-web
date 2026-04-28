"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function handleSearch(term: string) {
    setValue(term);
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
      params.set("page", "1");
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative w-full max-w-sm">
      <i
        className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-lg"
        style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-[var(--jobly-main)] transition-colors"
        style={{ color: "var(--foreground)" }}
      />
    </div>
  );
}
