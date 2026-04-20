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
      className="grid h-10 w-10 place-items-center rounded-full border border-border"
      style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.70)' }}
    >
      <i className="ri-arrow-left-s-line text-[22px] leading-none" />
    </button>
  );
}
