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
  company_logo?: string | null;
  city: string;
  create_time: string;
  min_salary?: string | null;
  max_salary?: string | null;
};

type SearchParamsShape = {
  q?: string;
  city?: string;
  categoryKey?: string;
  companyName?: string;
  jobType?: string;
  experience?: string;
  education?: string;
  gender?: string;
  premiumOnly?: string;
  minAge?: string;
  maxAge?: string;
  minSalary?: string;
  maxSalary?: string;
  positionContains?: string;
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

function clean(value?: string | null) {
  return String(value ?? '').trim();
}

export function FilterResultsClient({
  initialJobs,
  initialHasMore,
  limit,
  filters,
}: {
  initialJobs: FlutterJobItemData[];
  initialHasMore: boolean;
  limit: number;
  filters: SearchParamsShape;
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

      let query = supabase
        .from('jobs')
        .select(
          'id, job_number, title, company_name, company_logo, city, create_time, min_salary, max_salary',
        )
        .eq('status', true);

      const q = clean(filters.q);
      const positionContains = clean(filters.positionContains);
      const city = clean(filters.city);
      const categoryKey = clean(filters.categoryKey);
      const companyName = clean(filters.companyName);
      const jobType = clean(filters.jobType);
      const experience = clean(filters.experience);
      const education = clean(filters.education);
      const gender = clean(filters.gender);
      const premiumOnly = clean(filters.premiumOnly) === '1';
      const minAge = clean(filters.minAge);
      const maxAge = clean(filters.maxAge);
      const minSalary = clean(filters.minSalary);
      const maxSalary = clean(filters.maxSalary);

      if (q) query = query.filter('title', 'ilike', `%${q}%`);
      if (positionContains) query = query.filter('title', 'ilike', `%${positionContains}%`);
      if (city) query = query.eq('city', city);
      if (categoryKey) query = query.eq('category_name', categoryKey);
      if (companyName) query = query.eq('company_name', companyName);
      if (jobType) query = query.eq('job_type', jobType);
      if (experience) query = query.eq('experience', experience);
      if (education) query = query.eq('education', education);
      if (gender) query = query.eq('gender', gender);
      if (premiumOnly) query = query.eq('is_premium', true);
      if (minAge) query = query.gte('min_age', minAge);
      if (maxAge) query = query.lte('max_age', maxAge);
      if (minSalary) query = query.gte('min_salary', minSalary);
      if (maxSalary) query = query.lte('max_salary', maxSalary);

      const { data, error } = await query
        .order('is_premium', { ascending: false })
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
  }, [filters, hasMore, jobs.length, limit, loadingMore, supabase]);

  return (
    <div className="p-2">
      <FlutterJobListGroup jobs={jobs} />
      <InfiniteScrollSentinel
        onVisible={() => void loadMore()}
        disabled={!hasMore || loadingMore}
        className="h-10"
      />
    </div>
  );
}
