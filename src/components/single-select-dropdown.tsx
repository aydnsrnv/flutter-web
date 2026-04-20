'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { Input } from '@/components/ui/input';

const mainColor = '#245BEB';

type Option = {
  value: string;
  label: string;
  right?: ReactNode;
};

function XIcon({ size = 22, color = '#EF4444' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 6L18 18"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 6L6 18"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <div
      className={`grid place-items-center rounded-xl border ${checked ? '' : 'border-border'}`}
      style={{
        width: 26,
        height: 26,
        borderColor: checked ? mainColor : undefined,
        backgroundColor: checked ? 'rgba(36, 91, 235, 0.10)' : 'transparent',
      }}
    >
      {checked ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 6L9 17L4 12"
            stroke={mainColor}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </div>
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
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const selectedLabel = useMemo(() => {
    const opt = options.find((o) => o.value === value) ?? null;
    return opt?.label ?? '';
  }, [options, value]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    if (!searchable) return;
    setQuery('');
    const raf = requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onDocDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpen(false);
    };

    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('touchstart', onDocDown);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('touchstart', onDocDown);
    };
  }, [open]);

  const onSelect = useCallback(
    (next: string) => {
      onChange(next);
      close();
    },
    [close, onChange],
  );

  const onReset = useCallback(() => {
    onChange('');
    close();
  }, [close, onChange]);

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
        onClick={() => setOpen((v) => !v)}
        className={`flex h-12 w-full items-center justify-between rounded-[21px] border border-input bg-black/5 px-4 text-[14px] outline-none dark:bg-white/5 ${value ? 'text-foreground/80' : 'text-foreground/50'}`}
      >
        <div className="min-w-0 flex-1 truncate text-left">{value ? selectedLabel : placeholder}</div>
        <div className="ml-3 shrink-0 text-muted-foreground">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <div
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card"
          style={{ boxShadow: '0 14px 30px rgba(0,0,0,0.10)' }}
          role="listbox"
          aria-labelledby={id}
        >
          <button
            type="button"
            onClick={onReset}
            className="flex w-full items-center gap-3 px-4 py-4 text-left"
          >
            <div className="shrink-0">
              <XIcon />
            </div>
            <div className="text-[18px] font-medium text-foreground">
              {t('clear')}
            </div>
          </button>

          <div style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.06)' }} />

          {searchable ? (
            <>
              <div className="px-4 py-3">
                <Input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder ?? t('search_title')}
                />
              </div>

              <div className="h-px bg-border" />
            </>
          ) : null}

          <div className="max-h-[360px] overflow-auto">
            {filteredOptions.map((o) => {
              const checked = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onSelect(o.value)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                >
                  <div
                    className="min-w-0 flex-1 truncate text-[16px] text-foreground"
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
      ) : null}
    </div>
  );
}
