'use client';

import { useRouter } from 'next/navigation';

import { useI18n } from '@/lib/i18n/client';
import type { Locale } from '@/lib/i18n/types';
import { Select } from '@/components/ui/select';

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();

  const options: Array<{ value: Locale; label: string }> = [
    { value: 'az', label: t('resume_wizard_lang_azerbaijani') },
    { value: 'en', label: t('resume_wizard_lang_english') },
    { value: 'ru', label: t('resume_wizard_lang_russian') },
  ];

  return (
    <Select
      aria-label={t('select_lang')}
      value={locale}
      onChange={(e) => {
        const next = e.target.value as Locale;
        setLocale(next);
        router.refresh();
      }}
      className="h-9 rounded-full border border-border bg-card px-4 text-[12px]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
