'use client';

import { useCallback, useMemo, useState } from 'react';

import { InfiniteScrollSentinel } from '@/components/infinite-scroll-sentinel';
import { ResumeActions } from '@/components/resume-actions';
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

export function MyResumesClient({
  initialResumes,
  initialHasMore,
  limit,
  isActive,
}: {
  initialResumes: (ResumeRow & { status?: boolean | null })[];
  initialHasMore: boolean;
  limit: number;
  isActive: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<(ResumeRow & { status?: boolean | null })[]>(initialResumes);
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

      const offset = rows.length;
      const { data, error } = await supabase
        .from('resumes')
        .select('id, resume_number, full_name, desired_position, desired_salary, city, birth_year, experience_key, education_key, experiences, avatar, view_count, create_time, is_premium, status, user_id')
        .eq('user_id', uid)
        .eq('status', isActive)
        .order('create_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      const list = (Array.isArray(data) ? (data as any[]) : []).filter(Boolean) as (ResumeRow & { status?: boolean | null })[];
      setRows((prev) => prev.concat(list));
      if (list.length < limit) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, isActive, limit, loadingMore, rows.length, supabase]);

  return (
    <div className="overflow-hidden rounded-lg bg-background">
      {rows.map((r, idx) => (
        <div key={String(r.id)}>
          <div className="px-0 pt-3 pb-0">
            <ResumeListItem resume={toItem(r)} />
            <ResumeActions
              resumeId={String(r.id)}
              isActive={isActive}
              isPremium={r.is_premium ?? false}
              onDelete={() => setRows((prev) => prev.filter((x) => String(x.id) !== String(r.id)))}
            />
          </div>
          {idx !== rows.length - 1 && <div className="mx-2.5 mt-3 h-[0.8px] bg-border/60" />}
        </div>
      ))}
      <InfiniteScrollSentinel onVisible={() => void loadMore()} disabled={!hasMore || loadingMore} className="h-10" />
    </div>
  );
}
