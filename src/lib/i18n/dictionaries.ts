import type { Locale } from './types';

import az from './dictionaries/az.json';
import en from './dictionaries/en.json';
import ru from './dictionaries/ru.json';

export type Dictionary = Record<string, string>;

const DICTS: Record<Locale, Dictionary> = {
  az: az as Dictionary,
  en: en as Dictionary,
  ru: ru as Dictionary,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTS[locale];
}
