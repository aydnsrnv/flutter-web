 'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createClient } from '@/lib/supabase/browser';
import { useI18n } from '@/lib/i18n/client';
import { PageShimmer } from '@/components/page-shimmer';
import { Input } from '@/components/ui/input';
import { RequestCompanyFab } from '@/components/request-company-fab';

type CompanyRow = {
  id: string | number;
  slug?: string | null;
  company_name: string;
  company_logo?: string | null;
  job_count?: number | null;
};

export default function CompaniesPage() {
  const { t } = useI18n();
  const supabase = useMemo(() => createClient(), []);

  const dividerColor = 'rgba(0,0,0,0.06)';
  const pageSize = 20;

  const [inputValue, setInputValue] = useState('');
  const [queryValue, setQueryValue] = useState('');

  const [items, setItems] = useState<CompanyRow[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const v = inputValue.trim();
    const handle = window.setTimeout(() => {
      if (v.length >= 3) setQueryValue(v);
      else setQueryValue('');
    }, 350);
    return () => window.clearTimeout(handle);
  }, [inputValue]);

  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
  }, [queryValue]);

  const loadMore = useCallback(
    async (nextOffset: number) => {
      if (loading) return;
      if (!hasMore && nextOffset !== 0) return;

      setLoading(true);
      setError(null);
      if (nextOffset === 0) setInitialLoading(true);
      try {
        let q = supabase
          .from('companies')
          .select('id, slug, company_name, company_logo, job_count')
          .order('job_count', { ascending: false })
          .range(nextOffset, nextOffset + pageSize - 1);

        if (queryValue) q = q.filter('company_name', 'ilike', `%${queryValue}%`);

        const { data, error: qErr } = await q;
        if (qErr) throw qErr;

        const rows = (data ?? []) as CompanyRow[];
        setItems((prev) => (nextOffset === 0 ? rows : prev.concat(rows)));
        setOffset(nextOffset + rows.length);
        setHasMore(rows.length === pageSize);
      } catch (e: any) {
        setError(e?.message ?? String(e));
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [hasMore, loading, pageSize, queryValue, supabase],
  );

  useEffect(() => {
    void loadMore(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryValue]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (loading) return;
        if (!hasMore) return;
        void loadMore(offset);
      },
      { root: null, rootMargin: '200px', threshold: 0 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [offset, hasMore, loading, loadMore]);

  if (initialLoading) return <PageShimmer />;

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="rounded-2xl">
        <div className="px-4 pt-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('search_company')}
          />
        </div>

        {error ? (
          <div className="px-4 py-4 text-sm text-muted-foreground">
            {t('company_load_error').replace('{error}', error)}
          </div>
        ) : (!loading && items.length === 0) ? (
          <div className="px-4 py-6 text-center text-[14px] text-foreground/80">
            {t('no_company')}
          </div>
        ) : (
          <div>
            {items.map((c, idx) => {
              const name = (c.company_name ?? '').trim();
              const logo = c.company_logo ?? null;
              const count = c.job_count ?? 0;
              const companyKey = (String((c as any)?.slug ?? '').trim() || String(c.id));
              const href = `/company/${encodeURIComponent(companyKey)}`;

              return (
                <div key={`${c.id}-${idx}`}>
                  <Link href={href} className="block px-4 py-3">
                    <div className="flex items-center gap-4">
                      <div
                        className="grid shrink-0 place-items-center overflow-hidden rounded-full"
                        style={{ width: 60, height: 60, backgroundColor: 'rgba(36, 91, 235, 0.10)', border: `1px solid ${dividerColor}` }}
                      >
                        {logo ? (
                          <img src={logo} alt={name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="text-[18px] font-bold text-foreground/80">
                            {(name?.[0] ?? '?').toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[16px] text-foreground" style={{ fontWeight: 400 }}>
                          {name || '—'}
                        </div>
                      </div>

                      <div className="shrink-0 text-[15px] font-bold text-foreground/70">
                        {count}
                      </div>
                    </div>
                  </Link>

                  {idx !== items.length - 1 ? (
                    <div className="mx-4" style={{ height: 1, backgroundColor: dividerColor }} />
                  ) : null}
                </div>
              );
            })}

            <div ref={sentinelRef} className="px-4 py-4" />
          </div>
        )}
      </div>
      <RequestCompanyFab />
    </div>
  );
}
