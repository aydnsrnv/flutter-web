import { EmptyState } from "@/components/empty-state";
import { SectionHeader } from "@/components/section-header";
import { createClient } from "@/lib/supabase/server";
import { type PopularCompany } from "@/components/popular-company-card";
import { PopularCompanyListGroup } from "@/components/popular-company-list-group";
import { PopularJobListGroup } from "@/components/popular-job-list-group";
import type { PopularJobListItemData } from "@/components/popular-job-list-item";
import { FlutterJobListGroup } from "@/components/flutter-job-list-group";
import type { FlutterJobItemData } from "@/components/flutter-job-item";
import { JobFilterForm } from "@/components/job-filter-form";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

type CompanyRow = {
  id: string | number;
  slug?: string | null;
  company_name: string;
  company_logo: string;
  job_count: number;
};

type JobRow = {
  id: string | number;
  job_number?: number | string | null;
  title: string;
  company_name: string;
  company_logo: string;
  city: string;
  view_count: number;
  create_time: string;
  premium_start?: string | null;
  min_salary?: string | null;
  max_salary?: string | null;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomeTabPage({
  searchParams,
}: {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? dict[toSnakeCase(key)] ?? key;

  const sp = await Promise.resolve(searchParams ?? {});
  const rawQuery = (firstParam(sp.q) ?? "").trim();
  const searchQuery = rawQuery.length >= 3 ? rawQuery : "";
  const isSearching = searchQuery.length >= 3;

  const supabase = await createClient();

  const [
    { data: companies, error: companiesError },
    { data: premiumJobs, error: premiumError },
    { data: popularJobs, error: popularError },
    { data: latestJobs, error: latestError },
    searchResult,
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("id, slug, company_name, company_logo, job_count")
      .order("job_count", { ascending: false })
      .limit(14),
    supabase
      .from("jobs")
      .select(
        "id, job_number, title, company_name, company_logo, city, view_count, create_time, premium_start, min_salary, max_salary",
      )
      .eq("status", true)
      .eq("is_premium", true)
      .order("premium_start", { ascending: false })
      .limit(10),
    supabase
      .from("jobs")
      .select(
        "id, job_number, title, company_name, company_logo, city, view_count, create_time",
      )
      .eq("status", true)
      .order("view_count", { ascending: false })
      .limit(10),
    supabase
      .from("jobs")
      .select(
        "id, job_number, title, company_name, company_logo, city, view_count, create_time, min_salary, max_salary",
      )
      .eq("status", true)
      .order("create_time", { ascending: false })
      .limit(10),
    isSearching
      ? supabase
          .from("jobs")
          .select(
            "id, job_number, title, company_name, company_logo, city, view_count, create_time, min_salary, max_salary",
          )
          .eq("status", true)
          .or(
            (() => {
              const escaped = searchQuery.replace(/,/g, " ");
              const parsed = Number(escaped);
              const isNumber = Number.isFinite(parsed);
              const parts = [
                `title.ilike.%${escaped}%`,
                `company_name.ilike.%${escaped}%`,
                ...(isNumber ? [`job_number.eq.${parsed}`] : []),
              ];
              return parts.join(",");
            })(),
          )
          .order("is_premium", { ascending: false })
          .order("create_time", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: null, error: null }),
  ]);

  const topCompanies = (companies ?? []) as CompanyRow[];
  const premium = (premiumJobs ?? []) as JobRow[];
  const popular = (popularJobs ?? []) as JobRow[];
  const latest = (latestJobs ?? []) as JobRow[];

  const searchRows = (searchResult?.data ?? []) as JobRow[];
  const searchError = searchResult?.error ?? null;

  const companyCards: PopularCompany[] = topCompanies.map((c) => ({
    id: String(c.id),
    slug: (c as any)?.slug ?? null,
    company_name: c.company_name,
    company_logo: c.company_logo,
    job_count: c.job_count,
  }));

  const hasAnyJobData =
    premium.length > 0 || popular.length > 0 || latest.length > 0;

  const toPopularJobItem = (j: JobRow): PopularJobListItemData => ({
    id: String(j.id),
    job_number: j.job_number,
    title: j.title,
    company_name: j.company_name,
    company_logo: j.company_logo,
  });

  const toFlutterJobItem = (j: JobRow): FlutterJobItemData => ({
    id: String(j.id),
    job_number: j.job_number,
    title: j.title,
    company_name: j.company_name,
    company_logo: j.company_logo,
    city: j.city,
    create_time: j.create_time,
    min_salary: j.min_salary,
    max_salary: j.max_salary,
  });

  return (
    <div className="flex flex-col gap-4">
      {isSearching ? (
        <>
          <div className="lg:flex lg:gap-6">
            <div className="hidden lg:block lg:w-[280px] lg:shrink-0">
              <div className="rounded-2xl border border-border bg-card p-4">
                <JobFilterForm />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              {searchError ? (
                <div className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
                  {searchError.message}
                </div>
              ) : searchRows.length === 0 ? (
                <EmptyState label={t("no_data")} />
              ) : (
                <div className="rounded-2xl">
                  <FlutterJobListGroup jobs={searchRows.map(toFlutterJobItem)} />
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {companiesError || premiumError || popularError || latestError ? (
            <div className="mx-4 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
              {companiesError ? (
                <div>
                  {t("home_error_companies")}: {companiesError.message}
                </div>
              ) : null}
              {premiumError ? (
                <div>
                  {t("home_error_premium")}: {premiumError.message}
                </div>
              ) : null}
              {popularError ? (
                <div>
                  {t("home_error_popular")}: {popularError.message}
                </div>
              ) : null}
              {latestError ? (
                <div>
                  {t("home_error_latest")}: {latestError.message}
                </div>
              ) : null}
            </div>
          ) : !hasAnyJobData ? (
            <EmptyState label={t("no_data")} />
          ) : (
            <>
              <SectionHeader
                title={t("popular_companies")}
                titleKey="popular_companies"
              />
              <PopularCompanyListGroup
                companies={companyCards}
                mobileLimit={7}
                desktopLimit={14}
              />

              <div className="lg:flex lg:gap-6">
                <div className="hidden lg:block lg:w-[280px] lg:shrink-0">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <JobFilterForm />
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  {premium.length > 0 ? (
                    <>
                      <SectionHeader
                        title={t("premium_jobs")}
                        titleKey="premium_jobs"
                      />
                      <FlutterJobListGroup
                        jobs={premium.map(toFlutterJobItem)}
                        premium
                      />
                    </>
                  ) : null}

                  <SectionHeader
                    title={t("popular_jobs")}
                    titleKey="popular_jobs"
                  />
                  {popular.length > 0 ? (
                    <PopularJobListGroup
                      jobs={popular.map(toPopularJobItem)}
                      mobileLimit={5}
                      desktopLimit={10}
                    />
                  ) : (
                    <div className="rounded-2xl">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="px-4 py-4">
                          <div className="h-4 w-2/3 rounded bg-muted" />
                          <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
                          {i < 4 ? (
                            <div className="mt-4 h-px bg-border/60" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}

                  <SectionHeader
                    title={t("latest_vacancies_title")}
                    titleKey="latest_vacancies_title"
                    href="/latest"
                  />
                  {latest.length > 0 ? (
                    <FlutterJobListGroup
                      jobs={latest.map(toFlutterJobItem)}
                      mobileLimit={5}
                      desktopLimit={10}
                    />
                  ) : (
                    <div className="rounded-2xl">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="px-4 py-4">
                          <div className="h-4 w-2/3 rounded bg-muted" />
                          <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
                          {i < 4 ? (
                            <div className="mt-4 h-px bg-border/60" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
