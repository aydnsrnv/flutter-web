import { ResumeListItem, type ResumeListItemData } from '@/components/resume-list-item';
import { CandidatesSearchBar } from '@/components/candidates-search-bar';
import { ResumePopularItem, type ResumePopularItemData } from '@/components/resume-popular-item';
import { SectionHeader } from '@/components/section-header';
import { createClient } from '@/lib/supabase/server';

import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';

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
  experience_key?: string | null;
  education_key?: string | null;
  experiences?: unknown;
  avatar?: string | null;
  view_count?: number | null;
  create_time?: string | null;
  is_premium?: boolean | null;
  status?: boolean | null;
};

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  const sp = await Promise.resolve(searchParams ?? {});
  const qRaw = sp.q;
  const q = Array.isArray(qRaw) ? qRaw[0] : qRaw;
  const query = (q ?? '').trim();

  const cityRaw = sp.city;
  const city = Array.isArray(cityRaw) ? cityRaw[0] : cityRaw;
  const expRaw = sp.experience;
  const experience = Array.isArray(expRaw) ? expRaw[0] : expRaw;
  const eduRaw = sp.education;
  const education = Array.isArray(eduRaw) ? eduRaw[0] : eduRaw;
  const premRaw = sp.premiumOnly;
  const premiumOnly = (Array.isArray(premRaw) ? premRaw[0] : premRaw) === '1';

  const minAgeRaw = sp.minAge;
  const maxAgeRaw = sp.maxAge;
  const minAge = Number(Array.isArray(minAgeRaw) ? minAgeRaw[0] : minAgeRaw);
  const maxAge = Number(Array.isArray(maxAgeRaw) ? maxAgeRaw[0] : maxAgeRaw);
  const minSalaryRaw = sp.minSalary;
  const maxSalaryRaw = sp.maxSalary;
  const minSalary = Number(Array.isArray(minSalaryRaw) ? minSalaryRaw[0] : minSalaryRaw);
  const maxSalary = Number(Array.isArray(maxSalaryRaw) ? maxSalaryRaw[0] : maxSalaryRaw);

  const supabase = await createClient();

  const [
    { data: popularResumes, error: popularError },
    { data: premiumResumes, error: premiumError },
    { data: latestResumes, error: latestError },
  ] = await Promise.all([
    supabase
      .from('resumes')
      .select('id, resume_number, full_name, desired_position, desired_salary, city, birth_year, experience_key, education_key, experiences, avatar, view_count, create_time, is_premium, status')
      .eq('status', true)
      .order('view_count', { ascending: false })
      .limit(10),
    supabase
      .from('resumes')
      .select('id, resume_number, full_name, desired_position, desired_salary, city, birth_year, experience_key, education_key, experiences, avatar, view_count, create_time, is_premium, status')
      .eq('status', true)
      .eq('is_premium', true)
      .order('create_time', { ascending: false })
      .limit(10),
    supabase
      .from('resumes')
      .select('id, resume_number, full_name, desired_position, desired_salary, city, birth_year, experience_key, education_key, experiences, avatar, view_count, create_time, is_premium, status')
      .eq('status', true)
      .order('create_time', { ascending: false })
      .limit(50),
  ]);

  const popularRows = (popularResumes ?? []) as ResumeRow[];
  const premiumRows = (premiumResumes ?? []) as ResumeRow[];
  let latestRows = (latestResumes ?? []) as ResumeRow[];

  if (query) {
    const ql = query.toLowerCase();
    latestRows = latestRows.filter((r) => {
      const pos = (r.desired_position ?? '').toLowerCase();
      const name = (r.full_name ?? '').toLowerCase();
      const resumeNo = String(r.resume_number ?? '').toLowerCase();
      return pos.includes(ql) || name.includes(ql) || resumeNo.includes(ql);
    });
  }

  if (city) {
    latestRows = latestRows.filter((r) => (r.city ?? '') === city);
  }

  if (experience) {
    latestRows = latestRows.filter((r) => (r.experience_key ?? '') === experience);
  }

  if (education) {
    latestRows = latestRows.filter((r) => (r.education_key ?? '') === education);
  }

  if (premiumOnly) {
    latestRows = latestRows.filter((r) => Boolean(r.is_premium));
  }

  const nowYear = new Date().getFullYear();
  if (!Number.isNaN(minAge) && minAge > 0) {
    latestRows = latestRows.filter((r) => {
      const by = r.birth_year;
      if (!by) return false;
      const age = nowYear - by;
      return age >= minAge;
    });
  }

  if (!Number.isNaN(maxAge) && maxAge > 0) {
    latestRows = latestRows.filter((r) => {
      const by = r.birth_year;
      if (!by) return false;
      const age = nowYear - by;
      return age <= maxAge;
    });
  }

  if (!Number.isNaN(minSalary) && minSalary > 0) {
    latestRows = latestRows.filter((r) => {
      const v = Number(String(r.desired_salary ?? '').replace(/\D+/g, ''));
      if (!v) return false;
      return v >= minSalary;
    });
  }

  if (!Number.isNaN(maxSalary) && maxSalary > 0) {
    latestRows = latestRows.filter((r) => {
      const v = Number(String(r.desired_salary ?? '').replace(/\D+/g, ''));
      if (!v) return false;
      return v <= maxSalary;
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
      <CandidatesSearchBar initialQuery={query} />

      {(popularError || premiumError || latestError) ? (
        <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
          {popularError ? <div>{t('home_error_popular')}: {popularError.message}</div> : null}
          {premiumError ? <div>{t('home_error_premium')}: {premiumError.message}</div> : null}
          {latestError ? <div>{t('home_error_latest')}: {latestError.message}</div> : null}
        </div>
      ) : null}

      {popularRows.length > 0 ? (
        <div>
          <SectionHeader title={t('home_popular_resumes')} titleKey="home_popular_resumes" />
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

      {premiumRows.length > 0 ? (
        <div>
          <SectionHeader title={t('home_premium_resumes')} titleKey="home_premium_resumes" />
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

      <SectionHeader title={t('home_latest_resumes')} titleKey="home_latest_resumes" href="/latest-resumes" />

      {latestError ? (
        <div className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
          {latestError.message}
        </div>
      ) : latestRows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
          {t('no_data')}
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
