export const SUPPORTED_LOCALES = ['az', 'en', 'ru'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'az';

export const LOCALE_COOKIE = 'jobly_lang';
