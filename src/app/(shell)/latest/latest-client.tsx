'use client';

import { useCallback, useMemo, useState } from 'react';

import { FlutterJobListGroup } from '@/components/flutter-job-list-group';
import type { FlutterJobItemData } from '@/components/flutter-job-item';
import { InfiniteScrollSentinel } from '@/components/infinite-scroll-sentinel';
import { createClient } from '@/lib/supabase/browser';

type JobRow = {
  id: string | number;
  job_number?: number | string | null;
  title: string;
  company_name: string;
  city: string;
  create_time: string;
  min_salary?: string | null;
  max_salary?: string | null;
  company_logo?: string | null;
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

export function LatestJobsClient({
  initialJobs,
  initialHasMore,
  limit,
}: {
  initialJobs: FlutterJobItemData[];
  initialHasMore: boolean;
  limit: number;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [jobs, setJobs] = useState<FlutterJobItemData[]>(initialJobs);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const offset = jobs.length;
      const { data, error } = await supabase
        .from('jobs')
        .select('id, job_number, title, company_name, company_logo, city, create_time, min_salary, max_salary')
        .eq('status', true)
        .order('create_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      const rows = (Array.isArray(data) ? (data as JobRow[]) : []).filter(Boolean);
      const next = rows.map(toFlutterJobItem);
      setJobs((prev) => prev.concat(next));
      if (rows.length < limit) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, jobs.length, limit, loadingMore, supabase]);

  return (
    <div className="p-2">
      <FlutterJobListGroup jobs={jobs} />
      <InfiniteScrollSentinel onVisible={() => void loadMore()} disabled={!hasMore || loadingMore} className="h-10" />
    </div>
  );
}
