'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/client';

export function SectionHeader({
  title,
  titleKey,
  href,
}: {
  title: string;
  titleKey?: string;
  href?: string;
}) {
  const { t } = useI18n();
  const resolvedTitle = titleKey ? t(titleKey) : title;

  return (
    <div className="flex items-center justify-between">
      <div className="text-lg font-bold">{resolvedTitle}</div>
      {href ? (
        <Link
          href={href}
          className="rounded-full px-3 py-1 text-sm font-semibold bg-jobly-soft text-primary"
        >
          {t('see_all')}
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
