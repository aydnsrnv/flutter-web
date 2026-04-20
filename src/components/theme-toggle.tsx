'use client';

import { useCallback, useEffect, useState } from 'react';

import { useI18n } from '@/lib/i18n/client';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);

    const root = document.documentElement;
    if (next === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');

    document.cookie = `jobly_theme=${next}; path=/; max-age=31536000`;
  }, [theme]);

  return (
    <button
      type="button"
      className="inline-flex h-9 w-full items-center justify-between rounded-xl border border-border bg-card px-3 text-sm"
      onClick={toggle}
    >
      <span>{t('theme_title')}</span>
      <span className="text-muted-foreground">{theme === 'dark' ? t('theme_dark') : t('theme_light')}</span>
    </button>
  );
}
