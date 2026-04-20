'use client';

import { useCallback, useMemo, useState } from 'react';

import { WalletMinus } from 'iconsax-react';

import { InfiniteScrollSentinel } from '@/components/infinite-scroll-sentinel';
import { useI18n } from '@/lib/i18n/client';
import { createClient } from '@/lib/supabase/browser';

type WalletTxRow = {
  id: string;
  amount: number;
  source?: string | null;
  type?: string | null;
  number?: number | null;
  title?: string | null;
  created_at: string;
};

function formatDetailedDate(iso: string, t: (key: string) => string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfD = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const hhmm = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

  if (startOfD.getTime() === startToday.getTime()) return `${t('today')}, ${hhmm}`;
  if (startOfD.getTime() === startYesterday.getTime()) return `${t('yesterday')}, ${hhmm}`;

  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function titleText(item: WalletTxRow, t: (key: string) => string) {
  const raw = (item.title ?? '').trim();
  if (raw) return raw;

  const priceStr = `${Math.abs(item.amount)} ${t('currency_azn')}`;
  const source = (item.source ?? '').toLowerCase();
  const typ = (item.type ?? '').toLowerCase();

  if (source === 'make_premium') {
    if (typ === 'resume') return t('spendings_premium_resume_cost').replace('{price}', priceStr);
    return t('spendings_premium_job_cost').replace('{price}', priceStr);
  }

  if (source === 'post_resume') return t('spendings_resume_cost').replace('{price}', priceStr);
  return t('spendings_job_cost').replace('{price}', priceStr);
}

function subtitleText(item: WalletTxRow, t: (key: string) => string) {
  const parts: string[] = [];
  if (item.number != null) parts.push(`#${item.number}`);

  const source = (item.source ?? '').toLowerCase();
  const typ = (item.type ?? '').toLowerCase();

  if (source === 'post_job') parts.push(t('spendings_source_post_job'));
  if (source === 'post_resume') parts.push(t('spendings_source_post_resume'));
  if (source === 'make_premium') {
    if (typ === 'resume') parts.push(t('spendings_source_make_premium_resume'));
    else if (typ === 'job') parts.push(t('spendings_source_make_premium_job'));
    else parts.push(t('spendings_source_make_premium'));
  }

  return parts.filter(Boolean).join(' • ');
}

export function WalletTransactionsClient({
  initialItems,
  initialHasMore,
  limit,
}: {
  initialItems: WalletTxRow[];
  initialHasMore: boolean;
  limit: number;
}) {
  const { t } = useI18n();
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<WalletTxRow[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        setHasMore(false);
        return;
      }

      const offset = items.length;
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('id, amount, source, type, number, title, created_at')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      const rows = (Array.isArray(data) ? (data as WalletTxRow[]) : []).filter(Boolean);
      setItems((prev) => prev.concat(rows));
      if (rows.length < limit) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, items.length, limit, loadingMore, supabase]);

  return (
    <div>
      {items.map((tx, idx) => {
        const isLast = idx === items.length - 1;
        const amountAbs = Math.abs(tx.amount);
        return (
          <div key={tx.id}>
            <div className="flex items-start px-4 py-3">
              <div className="grid h-[42px] w-[42px] place-items-center rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.10)' }}>
                <span style={{ color: 'rgb(185, 28, 28)' }}>
                  <WalletMinus size={22} variant="Linear" color="currentColor" />
                </span>
              </div>
              <div className="w-3 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-foreground">
                  {titleText(tx, t)}
                </div>
                <div className="mt-1 text-[13.5px] font-medium text-muted-foreground">
                  {subtitleText(tx, t)}
                </div>
              </div>
              <div className="w-3 shrink-0" />
              <div className="shrink-0 text-right">
                <div className="text-[16px] font-bold" style={{ color: 'rgb(185, 28, 28)' }}>
                  {tx.amount === 0 ? `0 ${t('currency_azn')}` : `- ${amountAbs} ${t('currency_azn')}`}
                </div>
                <div className="mt-1 text-[12px] font-medium text-muted-foreground">
                  {formatDetailedDate(tx.created_at, t)}
                </div>
              </div>
            </div>
            {!isLast ? <div className="h-[0.8px] w-full bg-black/10 dark:bg-white/10" /> : null}
          </div>
        );
      })}
      <InfiniteScrollSentinel onVisible={() => void loadMore()} disabled={!hasMore || loadingMore} className="h-10" />
    </div>
  );
}
