'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { FlutterJobItem, type FlutterJobItemData } from '@/components/flutter-job-item';
import { InfiniteScrollSentinel } from '@/components/infinite-scroll-sentinel';
import { JobActions } from '@/components/job-actions';
import { createClient } from '@/lib/supabase/browser';

type JobRow = {
  id: string | number;
  job_number?: number | string | null;
  title: string;
  company_name: string;
  company_logo?: string | null;
  city: string;
  create_time: string;
  min_salary?: string | null;
  max_salary?: string | null;
  is_premium?: boolean | null;
};

function toFlutterJobItem(j: JobRow): FlutterJobItemData {
  return {
    id: String(j.id),
    job_number: j.job_number,
    title: j.title,
    company_name: j.company_name,
    company_logo: j.company_logo ?? '',
    city: j.city,
    create_time: j.create_time,
    min_salary: j.min_salary,
    max_salary: j.max_salary,
  };
}

export function MyJobsClient({
  initialJobs,
  initialHasMore,
  limit,
  isActive,
}: {
  initialJobs: JobRow[];
  initialHasMore: boolean;
  limit: number;
  isActive: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [jobs, setJobs] = useState<JobRow[]>(initialJobs);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setJobs(initialJobs);
    setHasMore(initialHasMore);
    setLoadingMore(false);
  }, [initialHasMore, initialJobs, isActive]);

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

      const offset = jobs.length;
      const { data, error } = await supabase
        .from('jobs')
        .select('id, job_number, title, company_name, company_logo, city, create_time, min_salary, max_salary, status, is_premium, creator_id')
        .eq('creator_id', uid)
        .eq('status', isActive)
        .order('create_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      const rows = (Array.isArray(data) ? (data as any[]) : []).filter(Boolean) as JobRow[];
      setJobs((prev) => prev.concat(rows));
      if (rows.length < limit) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, isActive, jobs.length, limit, loadingMore, supabase]);

  return (
    <div className="overflow-hidden rounded-lg bg-background">
      {jobs.map((j, idx) => (
        <div key={String(j.id)}>
          <div className="px-0 py-3">
            <FlutterJobItem job={toFlutterJobItem(j)} />
            <JobActions
              jobId={String(j.id)}
              isActive={isActive}
              isPremium={j.is_premium ?? false}
              onDelete={() => setJobs((prev) => prev.filter((x) => String(x.id) !== String(j.id)))}
            />
          </div>
          {idx !== jobs.length - 1 && <div className="mx-2.5 h-[0.8px] bg-border/60" />}
        </div>
      ))}
      <InfiniteScrollSentinel onVisible={() => void loadMore()} disabled={!hasMore || loadingMore} className="h-10" />
    </div>
  );
}
