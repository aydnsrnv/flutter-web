import { FlutterJobListGroup } from "@/components/flutter-job-list-group";
import type { FlutterJobItemData } from "@/components/flutter-job-item";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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

type SearchParams = {
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

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function trimValue(value: string | string[] | undefined) {
  return (firstValue(value) ?? "").trim();
}

function toFlutterJobItem(j: JobRow): FlutterJobItemData {
  return {
    id: String(j.id),
    job_number: j.job_number,
    title: j.title,
    company_name: j.company_name,
    company_logo: j.company_logo ?? "",
    city: j.city,
    create_time: j.create_time,
    min_salary: j.min_salary,
    max_salary: j.max_salary,
  };
}

export default async function FilterResultsPage({
  searchParams,
}: {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  const supabase = await createClient();
  const sp = await Promise.resolve(searchParams ?? {});

  const q = trimValue(sp.q);
  const city = trimValue(sp.city);
  const categoryKey = trimValue(sp.categoryKey);
  const companyName = trimValue(sp.companyName);
  const jobType = trimValue(sp.jobType);
  const experience = trimValue(sp.experience);
  const education = trimValue(sp.education);
  const gender = trimValue(sp.gender);
  const premiumOnly = trimValue(sp.premiumOnly) === "1";
  const minAge = trimValue(sp.minAge);
  const maxAge = trimValue(sp.maxAge);
  const minSalary = trimValue(sp.minSalary);
  const maxSalary = trimValue(sp.maxSalary);
  const positionContains = trimValue(sp.positionContains);

  let query = supabase
    .from("jobs")
    .select(
      "id, job_number, title, company_name, company_logo, city, create_time, min_salary, max_salary",
    )
    .eq("status", true);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl">
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
