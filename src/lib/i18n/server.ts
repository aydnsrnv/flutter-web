import { cookies } from 'next/headers';

import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale, SUPPORTED_LOCALES } from './types';

export function normalizeLocale(input: string | undefined | null): Locale {
  const v = (input ?? '').toLowerCase();
  if ((SUPPORTED_LOCALES as readonly string[]).includes(v)) return v as Locale;
  return DEFAULT_LOCALE;
}

export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}
