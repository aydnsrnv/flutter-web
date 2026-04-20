'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import { WalletCheck } from 'iconsax-react';

import { InfiniteScrollSentinel } from '@/components/infinite-scroll-sentinel';
import { createClient } from '@/lib/supabase/browser';

type PaymentRow = {
  id: string;
  amount: number;
  created_at: string;
};

function formatDetailedDate(iso: string, today: string, yesterday: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfD = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const hhmm = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

  if (startOfD.getTime() === startToday.getTime()) return `${today}, ${hhmm}`;
  if (startOfD.getTime() === startYesterday.getTime()) return `${yesterday}, ${hhmm}`;

  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function PaymentsHistoryClient({
  initialItems,
  initialHasMore,
  limit,
  todayText,
  yesterdayText,
  currencyLabel,
}: {
  initialItems: PaymentRow[];
  initialHasMore: boolean;
  limit: number;
  todayText: string;
  yesterdayText: string;
  currencyLabel: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<PaymentRow[]>(initialItems);
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
        .from('payments')
        .select('id, amount, created_at')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      const rows = (Array.isArray(data) ? (data as PaymentRow[]) : []).filter(Boolean);
      setItems((prev) => prev.concat(rows));
      if (rows.length < limit) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, items.length, limit, loadingMore, supabase]);

  return (
    <div>
      {items.map((p, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={p.id}>
            <Link href={`/payments-history/${p.id}`} className="block">
              <div className="flex items-start px-4 py-3">
                <div className="grid h-[42px] w-[42px] place-items-center rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.10)' }}>
                  <WalletCheck size={22} variant="Linear" color="rgb(21, 128, 61)" />
                </div>
                <div className="w-3 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-foreground/80">
                    {formatDetailedDate(p.created_at, todayText, yesterdayText)}
                  </div>
                </div>
                <div className="w-3 shrink-0" />
                <div className="shrink-0 text-[16px] font-bold" style={{ color: 'rgb(21, 128, 61)' }}>
                  + {p.amount} {currencyLabel}
                </div>
              </div>
            </Link>
            {!isLast ? <div className="h-[0.8px] w-full bg-black/10 dark:bg-white/10" /> : null}
          </div>
        );
      })}
      <InfiniteScrollSentinel onVisible={() => void loadMore()} disabled={!hasMore || loadingMore} className="h-10" />
    </div>
  );
}
