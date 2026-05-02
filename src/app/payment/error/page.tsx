import Link from 'next/link';

import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function PaymentErrorPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-[520px] flex-col items-center justify-center px-6">
      <div className="w-full rounded-2xl border border-border bg-card p-6 text-center">
        <div className="text-lg font-semibold text-foreground">
          {t('payment_failed_title')}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {t('payment_failed_subtitle')}
        </div>
        <Link
          href="/wallet"
          className="mt-5 inline-block h-12 w-full rounded-2xl text-center text-sm font-semibold leading-[48px] bg-primary text-primary-foreground"
        >
          {t('payment_try_again')}
        </Link>
      </div>
    </div>
  );
}
