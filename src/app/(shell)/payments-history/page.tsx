import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';

import { PaymentsHistoryClient } from '@/app/(shell)/payments-history/payments-history-client';

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

type PaymentRow = {
  id: string;
  amount: number;
  created_at: string;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function PaymentsHistoryPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? dict[toSnakeCase(key)] ?? key;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('payments')
    .select('id, amount, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const items = (Array.isArray(data) ? (data as PaymentRow[]) : []).filter(Boolean);
  const limit = 20;

  const mainColor = 'var(--jobly-main, #245BEB)';
  const footerText = t('payments_history_footer_note');

  return (
    <div className="flex flex-col gap-4">

      {error ? (
        <div className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
          {String(error.message ?? '')}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border">
        {items.length === 0 ? (
          <div className="p-6 text-center text-[14px] text-muted-foreground">
            {t('no_payments_found')}
          </div>
        ) : (
          <PaymentsHistoryClient
            initialItems={items}
            initialHasMore={items.length >= limit}
            limit={limit}
            todayText={t('today')}
            yesterdayText={t('yesterday')}
            currencyLabel={t('currency_azn')}
          />
        )}
      </div>

      <div className="pb-2 text-center text-[12px] text-muted-foreground">
        {footerText}
      </div>

      <div className="h-2" />

      <div className="text-center text-[13px] font-semibold" style={{ color: mainColor }}>
        &nbsp;
      </div>
    </div>
  );
}
