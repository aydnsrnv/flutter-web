"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { CloseCircle } from "iconsax-react";

import { useI18n } from "@/lib/i18n/client";
import { Input } from "@/components/ui/input";

const mainColor = "#245BEB";

type Option = {
  value: string;
  label: string;
  right?: ReactNode;
};

function CheckBox({ checked }: { checked: boolean }) {
  if (!checked) return null;

  return (
    <i
      className="ri-checkbox-circle-fill text-[21px]"
      style={{ color: mainColor }}
      aria-hidden="true"
    />
  );
}

export function SingleSelectDropdown({
  value,
  onChange,
  placeholder,
  options,
  searchPlaceholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  options: Option[];
  searchPlaceholder?: string;
}) {
  const { t } = useI18n();
  const id = useId();
  const searchable = Boolean(searchPlaceholder);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const selectedLabel = useMemo(() => {
    const opt = options.find((o) => o.value === value) ?? null;
    return opt?.label ?? "";
  }, [options, value]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    if (!searchable) return;
    setQuery("");
    const raf = requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onSelect = useCallback(
    (next: string) => {
      onChange(next);
      close();
    },
    [close, onChange],
  );

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-12 w-full items-center justify-between rounded-[21px] border border-input bg-black/5 px-4 text-[14px] outline-none dark:bg-white/5 ${value ? "text-foreground/80" : "text-foreground/50"}`}
      >
        <div className="min-w-0 flex-1 truncate text-left">
          {value ? selectedLabel : placeholder}
        </div>
        <div className="ml-3 shrink-0 text-muted-foreground">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[10001]">
          <button
            type="button"
            className="absolute inset-0"
            onClick={close}
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            aria-label={t("close")}
          />
          <div className="absolute left-0 right-0 top-1/2 mx-auto w-full max-w-[360px] -translate-y-1/2 px-4">
            <div
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              role="listbox"
              aria-labelledby={id}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="truncate pr-4 text-[16px] font-semibold text-foreground">
                  {placeholder}
                </div>
                <button type="button" onClick={close} aria-label={t("close")}>
                  <CloseCircle
                    size={22}
                    variant="Linear"
                    color="rgba(0,0,0,0.55)"
                  />
                </button>
              </div>

              <div className="h-[0.35px] w-full bg-black/15 dark:bg-white/15" />

              {searchable ? (
                <>
                  <div className="px-4 py-3">
                    <Input
                      ref={searchRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={searchPlaceholder ?? t("search_title")}
                    />
                  </div>

                  <div className="h-px bg-border" />
                </>
              ) : null}

              <div className="max-h-[360px] overflow-auto p-2">
                {filteredOptions.map((o) => {
                  const checked = o.value === value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => onSelect(o.value)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left"
                      style={{
                        backgroundColor: checked
                          ? "rgba(36, 91, 235, 0.10)"
                          : "transparent",
                      }}
                    >
                      <div
                        className="min-w-0 flex-1 truncate text-[16px]"
                        style={{
                          color: checked ? mainColor : "inherit",
                          fontWeight: checked ? 700 : 400,
                        }}
                      >
                        {o.label}
                      </div>
                      <div className="shrink-0">
                        <CheckBox checked={checked} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
