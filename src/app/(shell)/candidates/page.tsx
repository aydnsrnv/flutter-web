import {
  ResumeListItem,
  type ResumeListItemData,
} from "@/components/resume-list-item";
import { CandidatesSearchBar } from "@/components/candidates-search-bar";
import {
  ResumePopularItem,
  type ResumePopularItemData,
} from "@/components/resume-popular-item";
import { SectionHeader } from "@/components/section-header";
import { createClient } from "@/lib/supabase/server";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveNumber(value: string | undefined) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function tokenizeFilterValue(value: string | undefined) {
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

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  const sp = await Promise.resolve(searchParams ?? {});

  const q = (firstParam(sp.q) ?? "").trim();
  const positionContains = (firstParam(sp.positionContains) ?? "").trim();
  const city = (firstParam(sp.city) ?? "").trim();
  const experience = (firstParam(sp.experience) ?? "").trim();
  const education = (firstParam(sp.education) ?? "").trim();
  const gender = (firstParam(sp.gender) ?? "").trim();
  const premiumOnly = firstParam(sp.premiumOnly) === "1";

  const minAge = parsePositiveNumber(firstParam(sp.minAge));
  const maxAge = parsePositiveNumber(firstParam(sp.maxAge));
  const minSalary = parsePositiveNumber(firstParam(sp.minSalary));
  const maxSalary = parsePositiveNumber(firstParam(sp.maxSalary));

  const skillsRaw = (firstParam(sp.skills) ?? "").trim();
  const languagesRaw = (firstParam(sp.languages) ?? "").trim();

  const skillTokens = tokenizeFilterValue(skillsRaw);
  const languageTokens = tokenizeFilterValue(languagesRaw);

  const hasActiveResumeFilters = Boolean(
    q ||
    positionContains ||
    city ||
    experience ||
    education ||
    gender ||
    premiumOnly ||
    minAge ||
    maxAge ||
    minSalary ||
    maxSalary ||
    skillTokens.length > 0 ||
    languageTokens.length > 0,
  );

  const supabase = await createClient();

  const selectFields =
    "id, resume_number, full_name, desired_position, desired_salary, city, birth_year, gender_key, experience_key, education_key, experiences, skills, languages, avatar, view_count, create_time, is_premium, status";

  const [
    { data: popularResumes, error: popularError },
    { data: premiumResumes, error: premiumError },
    { data: latestResumes, error: latestError },
  ] = await Promise.all([
    supabase
      .from("resumes")
      .select(selectFields)
      .eq("status", true)
      .order("view_count", { ascending: false })
      .limit(10),
    supabase
      .from("resumes")
      .select(selectFields)
      .eq("status", true)
      .eq("is_premium", true)
      .order("create_time", { ascending: false })
      .limit(10),
    supabase
      .from("resumes")
      .select(selectFields)
      .eq("status", true)
      .order("create_time", { ascending: false })
      .limit(50),
  ]);

  const popularRows = (popularResumes ?? []) as ResumeRow[];
  const premiumRows = (premiumResumes ?? []) as ResumeRow[];
  let latestRows = (latestResumes ?? []) as ResumeRow[];

  if (q) {
    const ql = q.toLowerCase();
    latestRows = latestRows.filter((r) => {
      const pos = (r.desired_position ?? "").toLowerCase();
      const name = (r.full_name ?? "").toLowerCase();
      const resumeNo = String(r.resume_number ?? "").toLowerCase();
      return pos.includes(ql) || name.includes(ql) || resumeNo.includes(ql);
    });
  }

  if (positionContains) {
    const ql = positionContains.toLowerCase();
    latestRows = latestRows.filter((r) =>
      String(r.desired_position ?? "")
        .toLowerCase()
        .includes(ql),
    );
  }

  if (city) {
    latestRows = latestRows.filter((r) => (r.city ?? "") === city);
  }

  if (experience) {
    latestRows = latestRows.filter(
      (r) => (r.experience_key ?? "") === experience,
    );
  }

  if (education) {
    latestRows = latestRows.filter(
      (r) => (r.education_key ?? "") === education,
    );
  }

  if (gender) {
    latestRows = latestRows.filter((r) => (r.gender_key ?? "") === gender);
  }

  if (premiumOnly) {
    latestRows = latestRows.filter((r) => Boolean(r.is_premium));
  }

  const nowYear = new Date().getFullYear();

  if (minAge != null) {
    latestRows = latestRows.filter((r) => {
      const by = r.birth_year;
      if (!by) return true;
      const age = nowYear - by;
      return age >= minAge;
    });
  }

  if (maxAge != null) {
    latestRows = latestRows.filter((r) => {
      const by = r.birth_year;
      if (!by) return true;
      const age = nowYear - by;
      return age <= maxAge;
    });
  }

  if (minSalary != null) {
    latestRows = latestRows.filter((r) => {
      const v = desiredSalaryNumber(r.desired_salary);
      if (v == null) return true;
      return v >= minSalary;
    });
  }

  if (maxSalary != null) {
    latestRows = latestRows.filter((r) => {
      const v = desiredSalaryNumber(r.desired_salary);
      if (v == null) return true;
      return v <= maxSalary;
    });
  }

  if (skillTokens.length > 0) {
    latestRows = latestRows.filter((r) => {
      const haystack = String(r.skills ?? "").toLowerCase();
      return skillTokens.every((token) => haystack.includes(token));
    });
  }

  if (languageTokens.length > 0) {
    latestRows = latestRows.filter((r) => {
      const haystack = String(r.languages ?? "").toLowerCase();
      return languageTokens.every((token) => haystack.includes(token));
    });
  }

  const toPopular = (r: ResumeRow): ResumePopularItemData => ({
    id: String(r.id),
    resume_number: r.resume_number,
    full_name: r.full_name,
    desired_position: r.desired_position,
    experience_key: r.experience_key ?? null,
    experiences: r.experiences ?? null,
    avatar: r.avatar,
  });

  const toItem = (r: ResumeRow): ResumeListItemData => ({
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
  });

  return (
    <div className="flex flex-col gap-4">
      <CandidatesSearchBar initialQuery={q} />

      {popularError || premiumError || latestError ? (
        <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
          {popularError ? (
            <div>
              {t("home_error_popular")}: {popularError.message}
            </div>
          ) : null}
          {premiumError ? (
            <div>
              {t("home_error_premium")}: {premiumError.message}
            </div>
          ) : null}
          {latestError ? (
            <div>
              {t("home_error_latest")}: {latestError.message}
            </div>
          ) : null}
        </div>
      ) : null}

      {!hasActiveResumeFilters && popularRows.length > 0 ? (
        <div>
          <SectionHeader
            title={t("home_popular_resumes")}
            titleKey="home_popular_resumes"
          />
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {popularRows.slice(0, 10).map((r) => (
              <div key={String(r.id)} className="w-[150px] shrink-0">
                <ResumePopularItem resume={toPopular(r)} />
              </div>
            ))}
          </div>
          <div className="h-4" />
        </div>
      ) : null}

      {!hasActiveResumeFilters && premiumRows.length > 0 ? (
        <div>
          <SectionHeader
            title={t("home_premium_resumes")}
            titleKey="home_premium_resumes"
          />
          <div className="mt-3">
            {premiumRows.map((r, idx) => {
              const isLast = idx === premiumRows.length - 1;
              return (
                <div key={String(r.id)}>
                  <ResumeListItem resume={toItem(r)} />
                  {!isLast ? <div className="h-px bg-border/60" /> : null}
                </div>
              );
            })}
          </div>
          <div className="h-4" />
        </div>
      ) : null}

      <SectionHeader
        title={t("home_latest_resumes")}
        titleKey="home_latest_resumes"
        href="/latest-resumes"
      />

      {latestError ? (
        <div className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
          {latestError.message}
        </div>
      ) : latestRows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
          {t("no_data")}
        </div>
      ) : (
        <div className="mt-3">
          {latestRows.slice(0, 10).map((r, idx) => {
            const isLast = idx === Math.min(latestRows.length, 10) - 1;
            return (
              <div key={String(r.id)}>
                <ResumeListItem resume={toItem(r)} />
                {!isLast ? <div className="h-px bg-border/60" /> : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
