'use client';

import { useCallback, useMemo, useState } from 'react';
import { SearchNormal1 } from 'iconsax-react';

import { FlutterJobListGroup } from '@/components/flutter-job-list-group';
import type { FlutterJobItemData } from '@/components/flutter-job-item';
import { InfiniteScrollSentinel } from '@/components/infinite-scroll-sentinel';
import { createClient } from '@/lib/supabase/browser';
import { Input } from '@/components/ui/input';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) =>
      j.title.toLowerCase().includes(q) ||
      j.company_name.toLowerCase().includes(q)
    );
  }, [jobs, searchQuery]);

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
    <div className="flex flex-col gap-4">
      <form
        className="relative lg:hidden"
        onSubmit={(e) => e.preventDefault()}
      >
        <Input
          className="pl-14"
          placeholder="Axtar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <SearchNormal1 size={21} variant="Linear" color="currentColor" className="text-muted-foreground" />
        </div>
      </form>
      <div className="p-2">
        <FlutterJobListGroup jobs={filteredJobs} />
        <InfiniteScrollSentinel onVisible={() => void loadMore()} disabled={!hasMore || loadingMore} className="h-10" />
      </div>
    </div>
  );
}
