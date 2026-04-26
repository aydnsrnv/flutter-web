"use client";

import { EmptyState } from "@/components/empty-state";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ArrowDown2, Building, Eye, UserTick, Briefcase } from "iconsax-react";
import { slugify } from '@/lib/utils';

import { FlutterJobListGroup } from "@/components/flutter-job-list-group";
import type { FlutterJobItemData } from "@/components/flutter-job-item";
import { SectionHeader } from "@/components/section-header";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/browser";
import { PageShimmer } from "@/components/page-shimmer";

type CompanyRow = {
  id: string | number;
  slug?: string | null;
  company_name: string;
  company_logo?: string | null;
  job_count?: number | null;
  about?: string | null;
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

function safeParseNumber(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatCount(n: number) {
  if (n < 10000) return String(n);
  const isExact = n % 1000 === 0;
  const inK = n / 1000;
  const formatted = isExact ? inK.toFixed(0) : inK.toFixed(1);
  return `${formatted.replace(".", ",")}{k}`;
}

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
      <div className="text-center text-[18px] font-bold text-foreground">
        {value}
      </div>
      <div
        className="mt-2 grid h-11 w-11 place-items-center rounded-xl"
        style={{ backgroundColor: "rgba(36, 91, 235, 0.10)" }}
      >
        {icon}
      </div>
      <div className="mt-2 text-center text-[13px] font-medium text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

export default function CompanyViewPage() {
  const { t } = useI18n();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const params = useParams<{ id: string }>();

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

  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [aboutOverflows, setAboutOverflows] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const initForIdRef = useRef<string | null>(null);

  const companyIdForJobs = companyUuid;

  const loadCompany = useCallback(async () => {
    setCompanyLoading(true);
    setCompanyError(null);
    try {
      const query = supabase
        .from("companies")
        .select("id, slug, company_name, company_logo, job_count, about");

      const { data, error } = isUuid
        ? await query.eq("id", companyKey as any).maybeSingle()
        : await query.eq("slug", companyKey as any).maybeSingle();

      if (error) throw error;

      let row = (data as CompanyRow | null) ?? null;

      // If not found by slug, try a tolerant lookup by normalizing stored slugs
      if (!row && !isUuid) {
        const { data: candidates } = await supabase
          .from("companies")
          .select("id, slug, company_name, company_logo, job_count, about")
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
        const { data, error } = await supabase
          .from("jobs")
          .select(
            "id, job_number, title, company_id, company_name, company_logo, city, create_time, min_salary, max_salary, view_count, applied_count",
          )
          .eq("status", true)
          .eq("company_id", companyIdForJobs as any)
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
    [companyIdForJobs, hasMore, jobsLoading, pageSize, supabase, t],
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
    setAboutExpanded(false);
  }, [companyKey, loadCompany]);

  useEffect(() => {
    if (!companyIdForJobs) return;
    void loadStats();
    void loadMoreJobs(0);
  }, [companyIdForJobs, loadMoreJobs, loadStats]);

  useEffect(() => {
    if (aboutRef.current && company) {
      const el = aboutRef.current;
      setAboutOverflows(el.scrollHeight > el.clientHeight);
    }
  }, [company, aboutExpanded]);

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
    <div className="flex flex-col gap-4">
      <div className="mx-0 md:mx-4 mt-4 mb-7 rounded-3xl border border-border bg-card px-3.5 py-3.5">
        <div className="flex flex-col items-center">
          <div className="mx-auto h-[88px] w-[88px] overflow-hidden rounded-full bg-muted">
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
                  size={44}
                  variant="Linear"
                  className="text-muted-foreground"
                />
              </div>
            )}
          </div>

          <div className="mt-4 text-center text-[22px] font-bold text-foreground">
            {name}
          </div>

          <div className="mt-4 flex w-full items-center justify-between">
            <StatBox
              icon={
                <Eye
                  size={24}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              value={formatCount(totalViews).replace(
                "{k}",
                t("number_k_suffix"),
              )}
              label={t("company_stats_views")}
            />
            <StatBox
              icon={
                <UserTick
                  size={24}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              value={formatCount(totalApplied).replace(
                "{k}",
                t("number_k_suffix"),
              )}
              label={t("company_stats_applied")}
            />
            <StatBox
              icon={
                <Briefcase
                  size={24}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              value={formatCount(Number(jobsCount ?? 0)).replace(
                "{k}",
                t("number_k_suffix"),
              )}
              label={t("company_stats_jobs")}
            />
          </div>

          <div className="mt-4 w-full rounded-xl bg-card px-3.5 py-3.5">
            <div
              ref={aboutRef}
              className={`text-center text-[15px] leading-snug text-foreground ${!aboutExpanded ? "line-clamp-2" : ""}`}
            >
              {about}
            </div>
            {aboutOverflows && (
              <div className="mt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setAboutExpanded((v) => !v)}
                  className="p-2.5"
                  aria-label={t("aria_toggle")}
                >
                  <ArrowDown2
                    size={22}
                    variant="Linear"
                    color="var(--jobly-main, #245BEB)"
                    style={{
                      transform: aboutExpanded
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 160ms ease",
                    }}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-0 md:mx-4 mb-2 mt-4">
        <h2 className="text-[18px] font-bold text-foreground">
          {t("active_jobs")}
        </h2>
      </div>

      <div className="mx-0 md:mx-4 overflow-hidden rounded-lg bg-background">
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
  );
}
