"use client";

import { EmptyState } from "@/components/empty-state";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useCallback, useEffect, useMemo, useState } from "react";

import { SearchNormal1 } from "iconsax-react";

import { FlutterJobListGroup } from "@/components/flutter-job-list-group";
import type { FlutterJobItemData } from "@/components/flutter-job-item";
import {
  ResumeListItem,
  type ResumeListItemData,
} from "@/components/resume-list-item";
import { SectionHeader } from "@/components/section-header";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/browser";
import { PageShimmer } from "@/components/page-shimmer";
import { Input } from "@/components/ui/input";

type JobRow = {
  id: string | number;
  job_number?: number | string | null;
  title: string;
  company_name: string;
  company_logo: string;
  city: string;
  create_time: string;
  min_salary?: string | null;
  max_salary?: string | null;
};

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

function safeParseStringList(raw: string | null) {
  if (!raw) return [] as string[];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function uniqueStrings(v: string[]) {
  return Array.from(new Set(v.map((x) => String(x).trim()).filter(Boolean)));
}

function looksLikeUuid(v: string) {
  const s = String(v).trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    s,
  );
}

export default function FavoritesPage() {
  const { t } = useI18n();
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  const tab = (searchParams.get("tab") ?? "jobs").toString();
  const isJobsTab = tab !== "resumes";

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<FlutterJobItemData[]>([]);
  const [resumes, setResumes] = useState<ResumeListItemData[]>([]);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isJobsTab) {
        const ids = uniqueStrings(
          safeParseStringList(localStorage.getItem("jobly_fav_jobs")),
        );
        if (ids.length === 0) {
          setJobs([]);
          return;
        }

        const uuidIds = ids.filter(looksLikeUuid);

        const numericJobNumbers = ids
          .map((x) => Number(x))
          .filter((n) => Number.isFinite(n));

        const [byId, byJobNumber] = await Promise.all([
          uuidIds.length
            ? supabase
                .from("jobs")
                .select(
                  "id, job_number, title, company_name, company_logo, city, create_time, min_salary, max_salary",
                )
                .in("id", uuidIds)
                .order("create_time", { ascending: false })
            : Promise.resolve({ data: [], error: null } as any),
          numericJobNumbers.length
            ? supabase
                .from("jobs")
                .select(
                  "id, job_number, title, company_name, company_logo, city, create_time, min_salary, max_salary",
                )
                .in("job_number", numericJobNumbers)
                .order("create_time", { ascending: false })
            : Promise.resolve({ data: [], error: null } as any),
        ]);

        const anyError = byId.error ?? byJobNumber.error;
        if (anyError) throw new Error(anyError.message);

        const rows = (
          [...(byId.data ?? []), ...(byJobNumber.data ?? [])] as JobRow[]
        ).map((r) => ({
          id: String(r.id),
          job_number: r.job_number,
          title: r.title,
          company_name: r.company_name,
          company_logo: r.company_logo,
          city: r.city,
          create_time: r.create_time,
          min_salary: r.min_salary,
          max_salary: r.max_salary,
        }));

        const uniq = new Map<string, FlutterJobItemData>();
        for (const it of rows) uniq.set(String(it.id), it);
        setJobs(Array.from(uniq.values()));
      } else {
        const ids = uniqueStrings(
          safeParseStringList(localStorage.getItem("jobly_resume_favorites")),
        );
        if (ids.length === 0) {
          setResumes([]);
          return;
        }

        const uuidIds = ids.filter(looksLikeUuid);
        if (uuidIds.length === 0) {
          setResumes([]);
          return;
        }

        const { data, error } = await supabase
          .from("resumes")
          .select(
            "id, resume_number, full_name, desired_position, desired_salary, city, birth_year, experience_key, education_key, experiences, avatar, view_count, create_time, is_premium",
          )
          .in("id", uuidIds)
          .order("create_time", { ascending: false });

        if (error) throw new Error(error.message);

        const rows = (data ?? []) as ResumeRow[];
        setResumes(
          rows.map(
            (r): ResumeListItemData => ({
              id: String(r.id),
              resume_number: r.resume_number,
              full_name: r.full_name,
              desired_position: r.desired_position,
              desired_salary: r.desired_salary ?? null,
              city: r.city ?? null,
              birth_year: r.birth_year ?? null,
              experience_key: r.experience_key ?? null,
              education_key: r.education_key ?? null,
              experiences: r.experiences ?? null,
              avatar: r.avatar ?? null,
              view_count: r.view_count ?? null,
              create_time: r.create_time ?? null,
              is_premium: r.is_premium ?? null,
            }),
          ),
        );
      }
    } catch (e: any) {
      setError(
        t("favorites_load_error").replace("{error}", e?.message ?? String(e)),
      );
    } finally {
      setLoading(false);
    }
  }, [isJobsTab, supabase, t]);

  useEffect(() => {
    void fetchFavorites();
  }, [fetchFavorites]);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) => {
      const title = (j.title ?? "").toLowerCase();
      const company = (j.company_name ?? "").toLowerCase();
      const city = (j.city ?? "").toLowerCase();
      const number = (j.job_number ?? "").toString().toLowerCase();
      return (
        title.includes(q) ||
        company.includes(q) ||
        city.includes(q) ||
        number.includes(q)
      );
    });
  }, [jobs, query]);

  const filteredResumes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resumes;
    return resumes.filter((r) => {
      const name = (r.full_name ?? "").toLowerCase();
      const pos = (r.desired_position ?? "").toLowerCase();
      const city = (r.city ?? "").toString().toLowerCase();
      const number = (r.resume_number ?? "").toString().toLowerCase();
      return (
        name.includes(q) ||
        pos.includes(q) ||
        city.includes(q) ||
        number.includes(q)
      );
    });
  }, [query, resumes]);

  return (
    <div className="flex flex-col gap-4">
      <div className="mt-[4px] mb-1">
        <div className="flex gap-0 rounded-full border border-border bg-card p-1">
          <Link
            href="/favorites?tab=jobs"
            className={`flex-1 rounded-full py-2.5 text-center text-[14px] transition-colors ${isJobsTab ? "bg-primary/12 font-bold text-primary" : "font-semibold text-foreground"}`}
          >
            {t("favorites_tab_jobs")}
          </Link>
          <Link
            href="/favorites?tab=resumes"
            className={`flex-1 rounded-full py-2.5 text-center text-[14px] transition-colors ${!isJobsTab ? "bg-primary/12 font-bold text-primary" : "font-semibold text-foreground"}`}
          >
            {t("favorites_tab_resumes")}
          </Link>
        </div>
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <SearchNormal1 size={18} variant="Linear" color="currentColor" />
        </span>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("favorites_search_hint")}
          aria-label={t("favorites_search_label")}
          className="pl-11 pr-4"
        />
      </div>

      {loading ? (
        <PageShimmer />
      ) : error ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          {error}
        </div>
      ) : isJobsTab ? (
        filteredJobs.length === 0 ? (
          <EmptyState
            label={
              jobs.length === 0
                ? t("favorites_empty_jobs")
                : t("favorites_search_not_found")
            }
          />
        ) : (
          <div className="rounded-2xl border border-border bg-card">
            <FlutterJobListGroup jobs={filteredJobs} />
          </div>
        )
      ) : filteredResumes.length === 0 ? (
        <EmptyState
          label={
            resumes.length === 0
              ? t("favorites_empty_resumes")
              : t("favorites_search_not_found")
          }
        />
      ) : (
        <div className="grid gap-3">
          {filteredResumes.map((r) => (
            <ResumeListItem key={String(r.id)} resume={r} />
          ))}
        </div>
      )}
    </div>
  );
}
