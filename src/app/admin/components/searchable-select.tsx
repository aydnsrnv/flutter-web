"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  renderOption,
  searchKeys = ["label"],
}: {
  options: { value: string; label: string; logo?: string | null }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  renderOption?: (opt: { value: string; label: string; logo?: string | null }) => React.ReactNode;
  searchKeys?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = search.trim()
    ? options.filter((o) =>
        searchKeys.some((k) =>
          (o as any)[k]?.toLowerCase().includes(search.toLowerCase())
        )
      )
    : options;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setSearch("");
        }}
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors",
          open && "border-[var(--jobly-main)]"
        )}
        style={{ color: selected ? "var(--foreground)" : "var(--muted-foreground)" }}
      >
        {selected?.logo ? (
          <img src={selected.logo} alt="" className="h-6 w-6 rounded-full object-cover shrink-0" />
        ) : selected ? (
          <div
            className="h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: "var(--jobly-main)" }}
          >
            {selected.label?.[0]?.toUpperCase() ?? "?"}
          </div>
        ) : null}
        <span className="flex-1 truncate text-left">
          {selected?.label || placeholder}
        </span>
        <i
          className={cn(
            "ri-arrow-down-s-line text-lg transition-transform",
            open && "rotate-180"
          )}
          style={{ color: "var(--muted-foreground)" }}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <i
                className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
              />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-sm outline-none focus:border-[var(--jobly-main)]"
                style={{ color: "var(--foreground)" }}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                No results
              </div>
            )}
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  value === opt.value
                    ? "font-medium"
                    : "hover:bg-muted"
                )}
                style={
                  value === opt.value
                    ? { backgroundColor: "var(--jobly-main-10)", color: "var(--jobly-main)" }
                    : { color: "var(--foreground)" }
                }
              >
                {renderOption ? renderOption(opt) : (
                  <>
                    {opt.logo ? (
                      <img src={opt.logo} alt="" className="h-6 w-6 rounded-full object-cover shrink-0" />
                    ) : (
                      <div
                        className="h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: "var(--jobly-main)" }}
                      >
                        {opt.label?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
