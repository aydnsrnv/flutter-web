'use client';

import { useCallback, useMemo, useState } from 'react';

import { InfiniteScrollSentinel } from '@/components/infinite-scroll-sentinel';
import { ResumeListItem, type ResumeListItemData } from '@/components/resume-list-item';
import { createClient } from '@/lib/supabase/browser';

type ResumeRow = {
  id: string | number;
  resume_number?: number | string | null;
  full_name: string;
  desired_position?: string | null;
  desired_salary?: string | null;
  city?: string | null;
  birth_year?: number | null;
  experience_key?: string | null;
  education_key?: string | null;
  experiences?: unknown;
  avatar?: string | null;
  view_count?: number | null;
  create_time?: string | null;
  is_premium?: boolean | null;
};

function toItem(r: ResumeRow): ResumeListItemData {
  return {
    id: String(r.id),
    resume_number: r.resume_number,
    full_name: r.full_name,
    desired_position: r.desired_position,
    desired_salary: r.desired_salary ?? null,
    city: r.city,
    birth_year: r.birth_year ?? null,
    experience_key: r.experience_key ?? null,
    education_key: r.education_key ?? null,
    experiences: r.experiences ?? null,
    avatar: r.avatar,
    view_count: r.view_count,
    create_time: r.create_time,
    is_premium: r.is_premium,
  };
}

export function LatestResumesClient({
  initialItems,
  initialHasMore,
  limit,
}: {
  initialItems: ResumeListItemData[];
  initialHasMore: boolean;
  limit: number;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<ResumeListItemData[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const offset = items.length;
      const { data, error } = await supabase
        .from('resumes')
        .select('id, resume_number, full_name, desired_position, desired_salary, city, birth_year, experience_key, education_key, experiences, avatar, view_count, create_time, is_premium, status')
        .eq('status', true)
        .order('create_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      const rows = (Array.isArray(data) ? (data as ResumeRow[]) : []).filter(Boolean);
      const next = rows.map(toItem);
      setItems((prev) => prev.concat(next));
      if (rows.length < limit) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, items.length, limit, loadingMore, supabase]);

  return (
    <div className="grid gap-3">
      {items.map((r) => (
        <ResumeListItem key={r.id} resume={r} />
      ))}
      <InfiniteScrollSentinel onVisible={() => void loadMore()} disabled={!hasMore || loadingMore} className="h-10" />
    </div>
  );
}
