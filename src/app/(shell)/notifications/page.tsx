'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createClient } from '@/lib/supabase/browser';
import { useI18n } from '@/lib/i18n/client';

import { Notification } from 'iconsax-react';

import { InfiniteScrollSentinel } from '@/components/infinite-scroll-sentinel';
import { PageShimmer } from '@/components/page-shimmer';

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  number?: string | number | null;
  created_at: string;
  seen?: boolean | null;
  title?: string | null;
};

function formatTimeAndPostDate(iso: string, t: (k: string) => string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const hhmm = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfD = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (startOfD.getTime() === startToday.getTime()) return `${hhmm}, ${t('today')}`;
  if (startOfD.getTime() === startYesterday.getTime()) return `${hhmm}, ${t('yesterday')}`;

  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${hhmm}, ${dd}.${mm}.${yyyy}`;
}

export default function NotificationsPage() {
  const { t } = useI18n();
  const supabase = useMemo(() => createClient(), []);

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const limit = 15;
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const fetchingMoreRef = useRef(false);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    fetchingMoreRef.current = fetchingMore;
  }, [fetchingMore]);

  const load = useCallback(
    async ({ refresh }: { refresh: boolean }) => {
      setError(null);
      if (refresh) {
        offsetRef.current = 0;
        setHasMore(true);
        hasMoreRef.current = true;
        setRows([]);
      }

      const currentOffset = offsetRef.current;
      if (!refresh && (!hasMoreRef.current || fetchingMoreRef.current)) return;

      if (refresh) setLoading(true);
      else setFetchingMore(true);

      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user) {
          setAuthUserId(null);
          setRows([]);
          setHasMore(false);
          setError(t('login_to_view_notifications'));
          return;
        }
        setAuthUserId(user.id);

        const { data: notifs, error: qErr } = await supabase
          .from('notifications')
          .select('id, user_id, type, number, created_at, seen, title')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(currentOffset, currentOffset + limit - 1);

        if (qErr) throw new Error(qErr.message);

        const list = (Array.isArray(notifs) ? (notifs as NotificationRow[]) : []).filter(Boolean);

        setRows((prev) => (currentOffset === 0 ? list : prev.concat(list)));
        offsetRef.current = currentOffset + list.length;
        if (list.length < limit) {
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } catch (e: any) {
        setError(String(e?.message ?? e));
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [supabase, t],
  );

  useEffect(() => {
    void load({ refresh: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      const uid = authUserId;
      if (!uid) return;
      void supabase
        .from('notifications')
        .update({ seen: true })
        .eq('user_id', uid)
        .then(() => {
          // ignore
        });
    };
  }, [authUserId, supabase]);

  const markAsRead = useCallback(
    async (id: string) => {
      setRows((prev) => prev.map((n) => (n.id === id ? { ...n, seen: true } : n)));
      try {
        await supabase.from('notifications').update({ seen: true }).eq('id', id);
      } catch {
        // ignore
      }
    },
    [supabase],
  );

  const footerText = t('payments_history_footer_note');

  return (
    <div className="flex flex-col gap-4">

      {loading && rows.length === 0 ? (
        <PageShimmer />
      ) : error ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {t('notifications_error').replace('{error}', error)}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-[14px] text-muted-foreground">
          {t('notifications_none')}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          {rows.map((n, idx) => {
            const isLast = idx === rows.length - 1;
            const seen = Boolean(n.seen);
            const titleText = (n.title ?? '').trim() || t(n.type);
            const typeText = t(n.type);
            const number = String(n.number ?? '').trim();
            return (
              <div key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!seen) void markAsRead(n.id);
                  }}
                  className="block w-full px-4 py-3 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="grid h-[42px] w-[42px] place-items-center rounded-full"
                      style={{ backgroundColor: 'rgba(36,91,235,0.12)' }}
                    >
                      <Notification size={22} variant={seen ? 'Linear' : 'Bold'} color={'#245BEB'} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15.5px] font-bold text-foreground">
                        {titleText}
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        {!seen ? <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#245BEB' }} /> : null}
                        <div className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-muted-foreground">
                          {number ? (
                            <>
                              <span className="font-bold" style={{ color: '#245BEB' }}>#{number}</span>
                              <span className="px-2"> </span>
                              <span>{typeText}</span>
                            </>
                          ) : (
                            <span>{typeText}</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-1 text-right text-[12px] font-medium text-muted-foreground">
                        {formatTimeAndPostDate(n.created_at, t)}
                      </div>
                    </div>
                  </div>
                </button>
                {!isLast ? <div className="h-[0.8px] w-full bg-black/10 dark:bg-white/10" /> : null}
              </div>
            );
          })}

          {hasMore ? (
            <div className="p-3">
              <InfiniteScrollSentinel onVisible={() => void load({ refresh: false })} disabled={fetchingMore} className="h-10" />
            </div>
          ) : null}
        </div>
      )}

      <div className="pb-2 text-center text-[12px] text-muted-foreground">
        {footerText}
      </div>
    </div>
  );
}
