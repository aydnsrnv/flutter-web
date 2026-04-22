import { FlutterJobListGroup } from "@/components/flutter-job-list-group";
import { EmptyState } from "@/components/empty-state";
import type { FlutterJobItemData } from "@/components/flutter-job-item";
import { SectionHeader } from "@/components/section-header";
import { createClient } from "@/lib/supabase/server";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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

export default async function JobsPage({
  searchParams,
}: {
  searchParams?:
    | {
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
      }
    | Promise<{
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
      }>;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  const supabase = await createClient();

  const sp = await Promise.resolve(searchParams);

  const q = sp?.q?.trim();
  const city = sp?.city?.trim();
  const categoryKey = sp?.categoryKey?.trim();
  const companyName = sp?.companyName?.trim();
  const jobType = sp?.jobType?.trim();
  const experience = sp?.experience?.trim();
  const education = sp?.education?.trim();
  const gender = sp?.gender?.trim();
  const premiumOnly = sp?.premiumOnly === "1";
  const minAge = sp?.minAge?.trim();
  const maxAge = sp?.maxAge?.trim();
  const minSalary = sp?.minSalary?.trim();
  const maxSalary = sp?.maxSalary?.trim();
  const positionContains = sp?.positionContains?.trim();

  let query = supabase
    .from("jobs")
    .select(
      "id, job_number, title, company_name, company_logo, city, create_time, min_salary, max_salary",
    )
    .eq("status", true);

  // Flutter parity: title ilike
  if (q) query = query.filter("title", "ilike", `%${q}%`);
  if (positionContains)
    query = query.filter("title", "ilike", `%${positionContains}%`);

  if (city) query = query.eq("city", city);
  if (categoryKey) query = query.eq("category_name", categoryKey);
  if (companyName) query = query.eq("company_name", companyName);
  if (jobType) query = query.eq("job_type", jobType);
  if (experience) query = query.eq("experience", experience);
  if (education) query = query.eq("education", education);
  if (gender) query = query.eq("gender", gender);
  if (premiumOnly) query = query.eq("is_premium", true);

  if (minAge) query = query.gte("min_age", minAge);
  if (maxAge) query = query.lte("max_age", maxAge);
  if (minSalary) query = query.gte("min_salary", minSalary);
  if (maxSalary) query = query.lte("max_salary", maxSalary);

  const { data, error } = await query
    .order("is_premium", { ascending: false })
    .order("create_time", { ascending: false })
    .limit(50);

  const jobs = (data ?? []) as JobRow[];

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
      <div className="rounded-2xl border border-border bg-card">
        {q ||
        positionContains ||
        city ||
        categoryKey ||
        companyName ||
        jobType ||
        experience ||
        education ||
        gender ||
        premiumOnly ||
        minAge ||
        maxAge ||
        minSalary ||
        maxSalary ? (
          <div className="px-4 pt-3 text-xs text-muted-foreground">
            {q ? (
              <span>
                {t("search_label")}: <span className="font-semibold">{q}</span>
              </span>
            ) : null}
            {positionContains ? (
              <span className="ml-3">
                {t("position_label")}:{" "}
                <span className="font-semibold">{positionContains}</span>
              </span>
            ) : null}
            {companyName ? (
              <span className="ml-3">
                {t("company_label")}:{" "}
                <span className="font-semibold">{companyName}</span>
              </span>
            ) : null}
            <span className="ml-3">
              {t("results_label")}:{" "}
              <span className="font-semibold">{jobs.length}</span>
            </span>
          </div>
        ) : null}
        {error ? (
          <div className="px-4 py-4 text-sm text-muted-foreground">
            {error.message}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState label={t("no_data")} />
        ) : (
          <div className="p-2">
            <FlutterJobListGroup jobs={jobs.map(toFlutterJobItem)} />
          </div>
        )}
      </div>
    </div>
  );
}
