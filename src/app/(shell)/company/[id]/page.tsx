"use client";

import { EmptyState } from "@/components/empty-state";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Building, Eye, UserTick, Briefcase, TrendUp, CloseCircle, InfoCircle } from "iconsax-react";
import { slugify } from '@/lib/utils';

import { FlutterJobListGroup } from "@/components/flutter-job-list-group";
import type { FlutterJobItemData } from "@/components/flutter-job-item";
import { CompanyStatsDashboard } from "@/components/company-stats-dashboard";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/browser";
import { PageShimmer } from "@/components/page-shimmer";
import { JobFilterForm } from "@/components/job-filter-form";

type CompanyRow = {
  id: string | number;
  slug?: string | null;
  company_name: string;
  company_logo?: string | null;
  job_count?: number | null;
  about?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  website?: string | null;
};

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
  view_count?: number | null;
  applied_count?: number | null;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function trimValue(value: string | string[] | undefined) {
  return (firstValue(value) ?? "").trim();
}

function formatCount(n: number) {
  if (n < 10000) return String(n);
  const isExact = n % 1000 === 0;
  const inK = n / 1000;
  const formatted = isExact ? inK.toFixed(0) : inK.toFixed(1);
  return `${formatted.replace(".", ",")}{k}`;
}

function normalizeUrl(raw?: string | null) {
  const v = (raw ?? "").trim();
  if (!v) return null;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

export default function CompanyViewPage() {
  const { t } = useI18n();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [statsOpen, setStatsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const companyKey = (params?.id ?? "").toString();
  const isUuid = useMemo(
    () =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        companyKey,
      ),
    [companyKey],
  );

  const pageSize = 20;
  const [company, setCompany] = useState<CompanyRow | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const [companyUuid, setCompanyUuid] = useState<string | null>(null);

  const [jobs, setJobs] = useState<FlutterJobItemData[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [initialJobsLoading, setInitialJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [totalViews, setTotalViews] = useState(0);
  const [totalApplied, setTotalApplied] = useState(0);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const initForIdRef = useRef<string | null>(null);

  const companyIdForJobs = companyUuid;

  const filters = useMemo(() => {
    const sp = searchParams;
    return {
      q: trimValue(sp.get("q") ?? undefined),
      city: trimValue(sp.get("city") ?? undefined),
      categoryKey: trimValue(sp.get("categoryKey") ?? undefined),
      companyName: "", // forced by company_id
      jobType: trimValue(sp.get("jobType") ?? undefined),
      experience: trimValue(sp.get("experience") ?? undefined),
      education: trimValue(sp.get("education") ?? undefined),
      gender: trimValue(sp.get("gender") ?? undefined),
      premiumOnly: trimValue(sp.get("premiumOnly") ?? undefined) === "1",
      minAge: trimValue(sp.get("minAge") ?? undefined),
      maxAge: trimValue(sp.get("maxAge") ?? undefined),
      minSalary: trimValue(sp.get("minSalary") ?? undefined),
      maxSalary: trimValue(sp.get("maxSalary") ?? undefined),
      positionContains: trimValue(sp.get("positionContains") ?? undefined),
    };
  }, [searchParams]);

  const filtersKey = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);

  const loadCompany = useCallback(async () => {
    setCompanyLoading(true);
    setCompanyError(null);
    try {
      const query = supabase.from("companies").select(
        "id, slug, company_name, company_logo, job_count, about, instagram, linkedin, website",
      );

      const { data, error } = isUuid
        ? await query.eq("id", companyKey as any).maybeSingle()
        : await query.eq("slug", companyKey as any).maybeSingle();

      if (error) throw error;

      let row = (data as CompanyRow | null) ?? null;

      // If not found by slug, try a tolerant lookup by normalizing stored slugs
      if (!row && !isUuid) {
        const { data: candidates } = await supabase
          .from("companies")
          .select(
            "id, slug, company_name, company_logo, job_count, about, instagram, linkedin, website",
          )
          .not("slug", "is", null)
          .limit(1000);

        const list = (candidates ?? []) as CompanyRow[];
        const found = list.find((r) => {
          const s = (r as any)?.slug != null ? String((r as any).slug) : "";
          const n1 = slugify(s);
          const n2 = slugify(r.company_name);
          return n1 === companyKey || n2 === companyKey;
        });

        if (found) row = found;
      }

      setCompany(row);
      setCompanyUuid(row?.id != null ? String(row.id) : null);

      const slug = (row as any)?.slug != null ? String((row as any).slug) : "";
      const safe = slugify(row?.company_name) || slugify(slug) || slug;

      if (safe) {
        if (isUuid && slug && slug !== companyKey) {
          router.replace(`/company/${encodeURIComponent(safe)}`);
        }

        if (!isUuid && safe !== companyKey) {
          router.replace(`/company/${encodeURIComponent(safe)}`);
        }
      }
    } catch (e: any) {
      setCompanyError(
        t("company_details_error").replace("{error}", e?.message ?? String(e)),
      );
      setCompany(null);
      setCompanyUuid(null);
    } finally {
      setCompanyLoading(false);
    }
  }, [companyKey, isUuid, router, supabase, t]);

  const loadStats = useCallback(async () => {
    try {
      if (!companyIdForJobs) return;
      const { data, error } = await supabase
        .from("jobs")
        .select("view_count, applied_count")
        .eq("status", true)
        .eq("company_id", companyIdForJobs as any);

      if (error) throw error;

      const rows = (data ?? []) as {
        view_count?: number | null;
        applied_count?: number | null;
      }[];
      const views = rows.reduce(
        (sum, j) => sum + (Number(j.view_count) || 0),
        0,
      );
      const applied = rows.reduce(
        (sum, j) => sum + (Number(j.applied_count) || 0),
        0,
      );

      setTotalViews(views);
      setTotalApplied(applied);
    } catch (e: any) {
      // Stats are not critical, just log error
      console.error("Failed to load stats:", e);
    }
  }, [companyIdForJobs, supabase]);

  const loadMoreJobs = useCallback(
    async (nextOffset: number) => {
      if (jobsLoading) return;
      if (!hasMore && nextOffset !== 0) return;
      if (!companyIdForJobs) return;

      setJobsLoading(true);
      setJobsError(null);
      try {
        let q = supabase
          .from("jobs")
          .select(
            "id, job_number, title, company_id, company_name, company_logo, city, create_time, min_salary, max_salary, view_count, applied_count",
          )
          .eq("status", true)
          .eq("company_id", companyIdForJobs as any);

        if (filters.q) q = q.filter("title", "ilike", `%${filters.q}%`);
        if (filters.positionContains)
          q = q.filter("title", "ilike", `%${filters.positionContains}%`);
        if (filters.city) q = q.eq("city", filters.city);
        if (filters.categoryKey) q = q.eq("category_name", filters.categoryKey);
        if (filters.jobType) q = q.eq("job_type", filters.jobType);
        if (filters.experience) q = q.eq("experience", filters.experience);
        if (filters.education) q = q.eq("education", filters.education);
        if (filters.gender) q = q.eq("gender", filters.gender);
        if (filters.premiumOnly) q = q.eq("is_premium", true);
        if (filters.minAge) q = q.gte("min_age", filters.minAge);
        if (filters.maxAge) q = q.lte("max_age", filters.maxAge);
        if (filters.minSalary) q = q.gte("min_salary", filters.minSalary);
        if (filters.maxSalary) q = q.lte("max_salary", filters.maxSalary);

        const { data, error } = await q
          .order("is_premium", { ascending: false })
          .order("create_time", { ascending: false })
          // Fetch pageSize + 1 to determine if there is a next page.
          .range(nextOffset, nextOffset + pageSize);

        if (error) throw error;

        const rows = (data ?? []) as JobRow[];
        const pageRows = rows.slice(0, pageSize);
        const mapped = pageRows.map(
          (j): FlutterJobItemData => ({
            id: String(j.id),
            job_number: j.job_number,
            title: j.title,
            company_name: j.company_name,
            company_logo: j.company_logo,
            city: j.city,
            create_time: j.create_time,
            min_salary: j.min_salary,
            max_salary: j.max_salary,
            view_count: j.view_count,
            applied_count: j.applied_count,
          }),
        );

        setJobs((prev) => (nextOffset === 0 ? mapped : prev.concat(mapped)));
        setOffset(nextOffset + pageRows.length);
        setHasMore(rows.length > pageSize);
      } catch (e: any) {
        setJobsError(
          t("company_jobs_load_error").replace(
            "{error}",
            e?.message ?? String(e),
          ),
        );
        setHasMore(false);
      } finally {
        setJobsLoading(false);
        setInitialJobsLoading(false);
      }
    },
    [companyIdForJobs, filters, hasMore, jobsLoading, pageSize, supabase, t],
  );

  useEffect(() => {
    // In dev (React StrictMode), effects can be invoked twice.
    // Guard against resetting state for the same company id to prevent panel "flash".
    if (initForIdRef.current === String(companyKey)) return;
    initForIdRef.current = String(companyKey);
    setInitialJobsLoading(true);

    void loadCompany();
    setJobs([]);
    setOffset(0);
    setHasMore(true);
    setJobsError(null);
  }, [companyKey, loadCompany]);

  useEffect(() => {
    if (!companyIdForJobs) return;
    setJobs([]);
    setOffset(0);
    setHasMore(true);
    setJobsError(null);
    setInitialJobsLoading(true);
    void loadMoreJobs(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyIdForJobs, filtersKey]);

  useEffect(() => {
    if (!companyIdForJobs) return;
    void loadStats();
    // jobs load handled by filters effect
  }, [companyIdForJobs, loadMoreJobs, loadStats]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (jobsLoading) return;
        if (!hasMore) return;
        // Initial load is handled by the companyIdForJobs effect.
        if (offset === 0) return;
        void loadMoreJobs(offset);
      },
      { root: null, rootMargin: "200px", threshold: 0 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [offset, hasMore, jobsLoading, loadMoreJobs]);

  const instagramUrl = useMemo(
    () => normalizeUrl(company?.instagram ?? null),
    [company?.instagram],
  );
  const linkedinUrl = useMemo(
    () => normalizeUrl(company?.linkedin ?? null),
    [company?.linkedin],
  );
  const websiteUrl = useMemo(
    () => normalizeUrl(company?.website ?? null),
    [company?.website],
  );

  if (companyLoading) {
    return <PageShimmer />;
  }

  if (companyError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        {companyError}
      </div>
    );
  }

  if (!company) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
        {t("company_not_found")}
      </div>
    );
  }

  const name = (company.company_name ?? "").trim() || t("dash_placeholder");
  const logo = (company.company_logo ?? "").trim() || "";
  const about = (company.about ?? "").trim() || t("company_info_not_found");

  const jobsCount =
    company.job_count != null && company.job_count > 0
      ? company.job_count
      : jobs.length;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="mt-4 mb-7 w-full rounded-3xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="mx-auto h-[124px] w-[124px] shrink-0 overflow-hidden rounded-3xl bg-muted sm:mx-0 sm:h-[136px] sm:w-[136px]">
              {logo ? (
                <img
                  src={logo}
                  alt={name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <Building
                    size={58}
                    variant="Linear"
                    className="text-muted-foreground"
                  />
                </div>
              )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-center text-[30px] font-extrabold tracking-tight text-foreground sm:text-left sm:text-[34px]">
              {name}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-jobly-soft px-4 py-2 text-sm font-extrabold text-primary sm:px-5 sm:text-base">
                <Briefcase size={21} variant="Linear" color="currentColor" />
                Vakansiya: {formatCount(jobsCount)}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground/80 sm:px-5 sm:text-base">
                <Eye size={20} variant="Linear" color="currentColor" />
                {formatCount(totalViews)}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground/80 sm:px-5 sm:text-base">
                <UserTick size={20} variant="Linear" color="currentColor" />
                {formatCount(totalApplied)}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <a
                href={instagramUrl ?? "#"}
                onClick={(e) => {
                  if (!instagramUrl) e.preventDefault();
                }}
                target={instagramUrl ? "_blank" : undefined}
                rel={instagramUrl ? "noreferrer" : undefined}
                className={`grid h-12 w-12 place-items-center rounded-2xl transition-colors sm:h-14 sm:w-14 ${instagramUrl ? "bg-[#E1306C]/15 text-[#E1306C] hover:bg-[#E1306C]/20" : "cursor-not-allowed bg-muted text-muted-foreground/50"}`}
                aria-label="Instagram"
              >
                <i className="ri-instagram-fill text-[24px] sm:text-[28px]" />
              </a>
              <a
                href={linkedinUrl ?? "#"}
                onClick={(e) => {
                  if (!linkedinUrl) e.preventDefault();
                }}
                target={linkedinUrl ? "_blank" : undefined}
                rel={linkedinUrl ? "noreferrer" : undefined}
                className={`grid h-12 w-12 place-items-center rounded-2xl transition-colors sm:h-14 sm:w-14 ${linkedinUrl ? "bg-[#0A66C2]/15 text-[#0A66C2] hover:bg-[#0A66C2]/20" : "cursor-not-allowed bg-muted text-muted-foreground/50"}`}
                aria-label="LinkedIn"
              >
                <i className="ri-linkedin-fill text-[24px] sm:text-[28px]" />
              </a>
              <a
                href={websiteUrl ?? "#"}
                onClick={(e) => {
                  if (!websiteUrl) e.preventDefault();
                }}
                target={websiteUrl ? "_blank" : undefined}
                rel={websiteUrl ? "noreferrer" : undefined}
                className={`grid h-12 w-12 place-items-center rounded-2xl transition-colors sm:h-14 sm:w-14 ${websiteUrl ? "bg-primary/15 text-primary hover:bg-primary/20" : "cursor-not-allowed bg-muted text-muted-foreground/50"}`}
                aria-label="Website"
              >
                <i className="ri-global-line text-[24px] sm:text-[28px]" />
              </a>
            </div>
          </div>

          <div className="ml-auto flex flex-row justify-end gap-3 sm:flex-col sm:items-end sm:justify-center">
            <button
              type="button"
              onClick={() => setStatsOpen(true)}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400 transition-colors sm:h-14 sm:w-14"
              aria-label={t("statistics")}
            >
              <TrendUp size={24} variant="Linear" color="currentColor" />
            </button>
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/15 text-violet-600 hover:bg-violet-500/20 dark:text-violet-400 transition-colors sm:h-14 sm:w-14"
              aria-label={t("about_us")}
            >
              <InfoCircle size={24} variant="Linear" color="currentColor" />
            </button>
          </div>

        </div>
      </div>

      {statsOpen ? (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/55 p-3 lg:items-center"
          onClick={() => setStatsOpen(false)}
        >
          <div
            className="w-full max-w-[960px] overflow-hidden rounded-3xl border border-border bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="text-base font-semibold text-foreground">
                {t("statistics")}
              </div>
              <button
                type="button"
                onClick={() => setStatsOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-muted-foreground"
                aria-label={t("close")}
              >
                <CloseCircle size={20} variant="Linear" color="currentColor" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto p-4">
              <CompanyStatsDashboard
                jobs={jobs}
                totalViews={totalViews}
                totalApplied={totalApplied}
                jobsCount={jobsCount}
              />
            </div>
          </div>
        </div>
      ) : null}

      {aboutOpen ? (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/55 p-3 lg:items-center"
          onClick={() => setAboutOpen(false)}
        >
          <div
            className="w-full max-w-[760px] overflow-hidden rounded-3xl border border-border bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="text-base font-semibold text-foreground">
                {t("about_us") || "Haqqında"}
              </div>
              <button
                type="button"
                onClick={() => setAboutOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-muted-foreground"
                aria-label={t("close")}
              >
                <CloseCircle size={20} variant="Linear" color="currentColor" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto p-4 text-sm leading-relaxed text-foreground">
              {about}
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:flex lg:gap-6">
        <div className="hidden lg:block lg:w-[280px] lg:shrink-0">
          <div className="rounded-2xl border border-border bg-card p-4">
            {/* Company-scoped filters: same UI, different target route */}
            <div key={filtersKey}>
              <JobFilterForm basePath={`/company/${encodeURIComponent(companyKey)}`} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {t("active_jobs")}: {name}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-lg bg-background">
          {initialJobsLoading ? null : jobsError ? (
            <div className="px-4 py-4 text-sm text-muted-foreground">
              {jobsError}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState label={t("no_active_job_for_company")} />
          ) : (
            <>
              <FlutterJobListGroup jobs={jobs} />
              <div ref={sentinelRef} className="h-px w-full" />
              {jobsLoading && hasMore && jobs.length > 0 ? (
                <div className="px-4 py-4 text-center text-sm text-muted-foreground">
                  {t("updating")}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
