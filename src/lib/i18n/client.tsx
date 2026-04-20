'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { DEFAULT_LOCALE, type Locale, LOCALE_COOKIE, SUPPORTED_LOCALES } from './types';
import type { Dictionary } from './dictionaries';
import { getDictionary } from './dictionaries';

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);

  const dict: Dictionary = useMemo(() => getDictionary(locale), [locale]);

  const setLocale = useCallback((next: Locale) => {
    if (!(SUPPORTED_LOCALES as readonly string[]).includes(next)) return;
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
  }, []);

  const t = useCallback(
    (key: string) => {
      const direct = dict[key];
      if (direct != null) return direct;

      const snake = toSnakeCase(key);
      const snakeHit = dict[snake];
      if (snakeHit != null) return snakeHit;

      return key;
    },
    [dict],
  );

  const value: I18nContextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
