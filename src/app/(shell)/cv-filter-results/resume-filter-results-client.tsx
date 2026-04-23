"use client";

import { useCallback, useMemo, useState } from "react";

import { InfiniteScrollSentinel } from "@/components/infinite-scroll-sentinel";
import {
  ResumeListItem,
  type ResumeListItemData,
} from "@/components/resume-list-item";
import { createClient } from "@/lib/supabase/browser";

type ResumeRow = {
  id: string | number;
  resume_number?: number | string | null;
  full_name: string;
  desired_position?: string | null;
  desired_salary?: string | null;
  city?: string | null;
  birth_year?: number | null;
  gender_key?: string | null;
  experience_key?: string | null;
  education_key?: string | null;
  experiences?: unknown;
  skills?: string | null;
  languages?: string | null;
  avatar?: string | null;
  view_count?: number | null;
  create_time?: string | null;
  is_premium?: boolean | null;
  status?: boolean | null;
};

type ResumeFilterParams = {
  q?: string;
  positionContains?: string;
  city?: string;
  education?: string;
  experience?: string;
  gender?: string;
  premiumOnly?: boolean;
  minAge?: number | null;
  maxAge?: number | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  skills?: string;
  languages?: string;
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

function tokenizeFilterValue(value?: string) {
  return String(value ?? "")
    .split(/[;,]/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function desiredSalaryNumber(value?: string | null) {
  const digitsOnly = String(value ?? "").replace(/\D+/g, "");
  const n = Number(digitsOnly);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function matchesResume(
  resume: ResumeRow,
  filters: ResumeFilterParams,
  nowYear: number,
  skillTokens: string[],
  languageTokens: string[],
) {
  const q = String(filters.q ?? "")
    .trim()
    .toLowerCase();
  if (q) {
    const pos = String(resume.desired_position ?? "").toLowerCase();
    const name = String(resume.full_name ?? "").toLowerCase();
    const resumeNo = String(resume.resume_number ?? "").toLowerCase();
    if (!pos.includes(q) && !name.includes(q) && !resumeNo.includes(q)) {
      return false;
    }
  }

  const positionContains = String(filters.positionContains ?? "")
    .trim()
    .toLowerCase();
  if (positionContains) {
    const pos = String(resume.desired_position ?? "").toLowerCase();
    if (!pos.includes(positionContains)) return false;
  }

  if (filters.city && String(resume.city ?? "") !== filters.city) return false;
  if (
    filters.education &&
    String(resume.education_key ?? "") !== filters.education
  )
    return false;
  if (
    filters.experience &&
    String(resume.experience_key ?? "") !== filters.experience
  )
    return false;
  if (filters.gender && String(resume.gender_key ?? "") !== filters.gender)
    return false;
  if (filters.premiumOnly && !resume.is_premium) return false;

  if (filters.minAge != null) {
    const by = resume.birth_year;
    if (by) {
      const age = nowYear - by;
      if (age < filters.minAge) return false;
    }
  }

  if (filters.maxAge != null) {
    const by = resume.birth_year;
    if (by) {
      const age = nowYear - by;
      if (age > filters.maxAge) return false;
    }
  }

  if (filters.minSalary != null) {
    const salary = desiredSalaryNumber(resume.desired_salary);
    if (salary != null && salary < filters.minSalary) return false;
  }

  if (filters.maxSalary != null) {
    const salary = desiredSalaryNumber(resume.desired_salary);
    if (salary != null && salary > filters.maxSalary) return false;
  }

  if (skillTokens.length > 0) {
    const haystack = String(resume.skills ?? "").toLowerCase();
    if (!skillTokens.every((token) => haystack.includes(token))) return false;
  }

  if (languageTokens.length > 0) {
    const haystack = String(resume.languages ?? "").toLowerCase();
    if (!languageTokens.every((token) => haystack.includes(token)))
      return false;
  }

  return true;
}

export function ResumeFilterResultsClient({
  initialItems,
  initialHasMore,
  limit,
  initialSourceOffset,
  sourcePageSize = 60,
  filters,
}: {
  initialItems: ResumeListItemData[];
  initialHasMore: boolean;
  limit: number;
  initialSourceOffset?: number;
  sourcePageSize?: number;
  filters: ResumeFilterParams;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<ResumeListItemData[]>(initialItems);
  const [sourceOffset, setSourceOffset] = useState(
    initialSourceOffset ?? (initialItems.length > 0 ? sourcePageSize : 0),
  );
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const nowYear = useMemo(() => new Date().getFullYear(), []);
  const skillTokens = useMemo(
    () => tokenizeFilterValue(filters.skills),
    [filters.skills],
  );
  const languageTokens = useMemo(
    () => tokenizeFilterValue(filters.languages),
    [filters.languages],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);

    try {
      const collected: ResumeListItemData[] = [];
      let currentOffset = sourceOffset;
      let canContinue = true;

      while (collected.length < limit && canContinue) {
        const { data, error } = await supabase
          .from("resumes")
          .select(
            "id, resume_number, full_name, desired_position, desired_salary, city, birth_year, gender_key, experience_key, education_key, experiences, skills, languages, avatar, view_count, create_time, is_premium, status",
          )
          .eq("status", true)
          .order("create_time", { ascending: false })
          .range(currentOffset, currentOffset + sourcePageSize - 1);

        if (error) throw error;

        const rows = (Array.isArray(data) ? (data as ResumeRow[]) : []).filter(
          Boolean,
        );
        currentOffset += rows.length;

        const filtered = rows
          .filter((row) =>
            matchesResume(row, filters, nowYear, skillTokens, languageTokens),
          )
          .map(toItem);

        const remaining = limit - collected.length;
        collected.push(...filtered.slice(0, remaining));

        if (rows.length < sourcePageSize) {
          canContinue = false;
        }
      }

      if (collected.length > 0) {
        setItems((prev) => prev.concat(collected));
      }

      setSourceOffset(currentOffset);
      setHasMore(canContinue);
    } finally {
      setLoadingMore(false);
    }
  }, [
    filters,
    hasMore,
    languageTokens,
    limit,
    loadingMore,
    nowYear,
    skillTokens,
    sourceOffset,
    sourcePageSize,
    supabase,
  ]);

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <ResumeListItem key={item.id} resume={item} />
      ))}
      <InfiniteScrollSentinel
        onVisible={() => void loadMore()}
        disabled={!hasMore || loadingMore}
        className="h-10"
      />
    </div>
  );
}
