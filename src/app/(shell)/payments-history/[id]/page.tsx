import { notFound, redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';
import { ManatIcon } from '@/components/ui/manat-icon';

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

function formatFullDateTime(iso: string, locale: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const baku = new Date(d.getTime() + 4 * 60 * 60 * 1000);

  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(baku);
  } catch {
    const pad2 = (n: number) => String(n).padStart(2, '0');
    return `${pad2(baku.getDate())}.${pad2(baku.getMonth() + 1)}.${baku.getFullYear()} ${pad2(baku.getHours())}:${pad2(
      baku.getMinutes(),
    )}`;
  }
}

type PaymentRow = {
  id: string;
  amount: number;
  created_at: string;
  user_email?: string | null;
  transaction_code?: number | null;
};

function DetailRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-[14px] text-muted-foreground">
        {label}
      </div>
      <div className="text-[14px] font-semibold" style={{ color: valueColor ?? 'rgba(0,0,0,0.87)' }}>
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-[0.8px] w-full bg-black/10 dark:bg-white/10" />;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
    .select('id, amount, created_at, user_email, transaction_code')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const payment = data as PaymentRow;

  const dateLabel = formatFullDateTime(payment.created_at, locale);
  const amountLabel = `+ ${Number(payment.amount).toFixed(2)}`;
  const statusValue = t('payment_status_successful');

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('payment_receipt_title')}</h1>
      </header>

      <div className="flex flex-col items-center">
        <div className="flex items-end justify-center gap-2">
          <div className="text-[36px] font-bold text-foreground">
            {amountLabel}
          </div>
          <div className="pb-[6px] text-[28px] font-bold text-foreground">
            <ManatIcon size={28} color="var(--jobly-main, #245BEB)" />
          </div>
        </div>
        <div className="mt-2 text-[16px] text-muted-foreground">
          {t('payment_type')}
        </div>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-border"
        style={{ backgroundColor: 'var(--card, #ffffff)', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}
      >
        <div className="px-4 py-1">
          <DetailRow label={t('payment_status')} value={statusValue} valueColor={'rgb(21, 128, 61)'} />
          <Divider />
          <DetailRow label={t('wallet_date')} value={dateLabel} />
          <Divider />
          <DetailRow label={t('payment_user_email')} value={(payment.user_email ?? user.email ?? '-') as string} />
          <Divider />
          <DetailRow label={t('payment_recipient')} value={t('payment_recipient_jobly')} />
          <Divider />
          <DetailRow
            label={t('payment_transaction_code')}
            value={payment.transaction_code != null ? String(payment.transaction_code) : '-'}
          />
        </div>
      </div>
    </div>
  );
}
