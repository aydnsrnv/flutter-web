import type { ResumeListItemData } from '@/components/resume-list-item';
import { createClient } from '@/lib/supabase/server';

import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';

import { ResumeFilterResultsClient } from '@/app/(shell)/resume-filter-results/resume-filter-results-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
  return String(value ?? '')
    .split(/[;,]/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function desiredSalaryNumber(value?: string | null) {
  const digitsOnly = String(value ?? '').replace(/\D+/g, '');
  const n = Number(digitsOnly);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function matchesResumeFilters(
  row: ResumeRow,
  filters: {
    q: string;
    positionContains: string;
    city: string;
    education: string;
    experience: string;
    gender: string;
    premiumOnly: boolean;
    minAge: number | null;
    maxAge: number | null;
    minSalary: number | null;
    maxSalary: number | null;
    skillTokens: string[];
    languageTokens: string[];
  },
) {
  const {
    q,
    positionContains,
    city,
    education,
    experience,
    gender,
    premiumOnly,
    minAge,
    maxAge,
    minSalary,
    maxSalary,
    skillTokens,
    languageTokens,
  } = filters;

  if (q) {
    const ql = q.toLowerCase();
    const pos = String(row.desired_position ?? '').toLowerCase();
    const name = String(row.full_name ?? '').toLowerCase();
    const resumeNo = String(row.resume_number ?? '').toLowerCase();
    if (!pos.includes(ql) && !name.includes(ql) && !resumeNo.includes(ql)) {
      return false;
    }
  }

  if (positionContains) {
    const ql = positionContains.toLowerCase();
    if (!String(row.desired_position ?? '').toLowerCase().includes(ql)) {
      return false;
    }
  }

  if (city && (row.city ?? '') !== city) return false;
  if (education && (row.education_key ?? '') !== education) return false;
  if (experience && (row.experience_key ?? '') !== experience) return false;
  if (gender && (row.gender_key ?? '') !== gender) return false;
  if (premiumOnly && !Boolean(row.is_premium)) return false;

  const nowYear = new Date().getFullYear();

  if (minAge != null) {
    const by = row.birth_year;
    if (by) {
      const age = nowYear - by;
      if (age < minAge) return false;
    }
  }

  if (maxAge != null) {
    const by = row.birth_year;
    if (by) {
      const age = nowYear - by;
      if (age > maxAge) return false;
    }
  }

  if (minSalary != null) {
    const salary = desiredSalaryNumber(row.desired_salary);
    if (salary != null && salary < minSalary) return false;
  }

  if (maxSalary != null) {
    const salary = desiredSalaryNumber(row.desired_salary);
    if (salary != null && salary > maxSalary) return false;
  }

  if (skillTokens.length > 0) {
    const haystack = String(row.skills ?? '').toLowerCase();
    if (!skillTokens.every((token) => haystack.includes(token))) {
      return false;
    }
  }

  if (languageTokens.length > 0) {
    const haystack = String(row.languages ?? '').toLowerCase();
    if (!languageTokens.every((token) => haystack.includes(token))) {
      return false;
    }
  }

  return true;
}

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

export default async function ResumeFilterResultsPage({
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

  const q = (firstParam(sp.q) ?? '').trim();
  const positionContains = (firstParam(sp.positionContains) ?? '').trim();
  const city = (firstParam(sp.city) ?? '').trim();
  const education = (firstParam(sp.education) ?? '').trim();
  const experience = (firstParam(sp.experience) ?? '').trim();
  const gender = (firstParam(sp.gender) ?? '').trim();
  const premiumOnly = firstParam(sp.premiumOnly) === '1';

  const minAge = parsePositiveNumber(firstParam(sp.minAge));
  const maxAge = parsePositiveNumber(firstParam(sp.maxAge));
  const minSalary = parsePositiveNumber(firstParam(sp.minSalary));
  const maxSalary = parsePositiveNumber(firstParam(sp.maxSalary));

  const skillsRaw = (firstParam(sp.skills) ?? '').trim();
  const languagesRaw = (firstParam(sp.languages) ?? '').trim();

  const skillTokens = tokenizeFilterValue(skillsRaw);
  const languageTokens = tokenizeFilterValue(languagesRaw);

  const filters = {
    q,
    positionContains,
    city,
    education,
    experience,
    gender,
    premiumOnly,
    minAge,
    maxAge,
    minSalary,
    maxSalary,
    skillTokens,
    languageTokens,
  };

  const supabase = await createClient();
  const limit = 20;
  const sourceLimit = 80;

  const { data, error } = await supabase
    .from('resumes')
    .select(
      'id, resume_number, full_name, desired_position, desired_salary, city, birth_year, gender_key, experience_key, education_key, experiences, skills, languages, avatar, view_count, create_time, is_premium, status',
    )
    .eq('status', true)
    .order('create_time', { ascending: false })
    .limit(sourceLimit);

  const rows = ((data ?? []) as ResumeRow[]).filter((row) =>
    matchesResumeFilters(row, filters),
  );

  const initialItems = rows.slice(0, limit).map(toItem);

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <div className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
          {error.message}
        </div>
      ) : initialItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
          {t('resumesSearchNotFound')}
        </div>
      ) : (
        <ResumeFilterResultsClient
          initialItems={initialItems}
          initialHasMore={rows.length > limit || (data?.length ?? 0) >= sourceLimit}
          limit={limit}
          initialSourceOffset={data?.length ?? 0}
          filters={filters}
        />
      )}
    </div>
  );
}
