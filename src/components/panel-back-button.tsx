'use client';

import { useRouter } from 'next/navigation';

import { useI18n } from '@/lib/i18n/client';

export function PanelBackButton({
  fallbackHref = '/home',
}: {
  fallbackHref?: string;
}) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <button
      type="button"
      aria-label={t('back')}
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
          return;
        }
        router.push(fallbackHref);
      }}
      className="grid h-10 w-10 place-items-center rounded-full border border-border bg-black/[0.06] text-black/70 dark:bg-white/[0.06] dark:text-white/70"
    >
      <i className="ri-arrow-left-s-line text-xl leading-none" />
    </button>
  );
}
