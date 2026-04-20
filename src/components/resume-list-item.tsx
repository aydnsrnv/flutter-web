'use client';

import Link from 'next/link';

import { Book, Briefcase, Calendar2 } from 'iconsax-react';

import { useI18n } from '@/lib/i18n/client';

export type ResumeListItemData = {
  id: string;
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

type WorkExperience = {
  start_year?: number | null;
  start_month?: number | null;
  end_year?: number | null;
  end_month?: number | null;
  startYear?: number | null;
  startMonth?: number | null;
  endYear?: number | null;
  endMonth?: number | null;
};

function safeArray<T = unknown>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === 'string') {
    try {
      const parsed: unknown = JSON.parse(v);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function totalMonthsFromExperiences(experiences: WorkExperience[], nowOverride?: Date) {
  if (experiences.length === 0) return 0;
  const now = nowOverride ?? new Date();

  let sum = 0;
  for (const e of experiences) {
    const sy = (e.start_year ?? e.startYear) ?? 0;
    if (!sy || sy <= 0) continue;
    const smRaw = (e.start_month ?? e.startMonth) ?? 0;
    const sm = smRaw && smRaw > 0 ? smRaw : 1;

    const eyRaw = (e.end_year ?? e.endYear) ?? 0;
    const ey = !eyRaw || eyRaw === 0 ? now.getFullYear() : eyRaw;

    const emRaw = (e.end_month ?? e.endMonth) ?? 0;
    const em = emRaw && emRaw > 0
      ? emRaw
      : (!eyRaw || eyRaw === 0 ? now.getMonth() + 1 : 1);

    const start = (sy * 12) + sm;
    const end = (ey * 12) + em;
    const diff = end - start;
    if (diff <= 0) continue;
    sum += diff;
  }
  return sum;
}

function withExperienceLabel(rawText: string, t: (key: string) => string) {
  const text = rawText.trim();
  if (!text || text === '-') return rawText;
  const label = t('resume_experience_label').trim();
  if (!label) return rawText;

  // Flutter logic: if experience is "none" don't append "təcrübə"
  if (t('exp_none') && text === t('exp_none')) return rawText;
  if (text.endsWith(label)) return rawText;
  return `${text} ${label}`;
}

function localizedDurationFromMonths(totalMonths: number, t: (key: string) => string) {
  if (totalMonths <= 0) return '-';
  const yearSuffix = t('resume_duration_year_suffix');
  const monthSuffix = t('resume_duration_month_suffix');

  if (totalMonths < 12) {
    return `${totalMonths} ${monthSuffix}`;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (months === 0) {
    return `${years} ${yearSuffix}`;
  }
  return `${years} ${yearSuffix} ${months} ${monthSuffix}`;
}

function localizedExperienceTextFromKey(experienceKey: string | null | undefined, t: (key: string) => string) {
  const raw = (experienceKey ?? '').trim();
  if (!raw) return '-';

  if (raw === 'exp_none') {
    return t(raw);
  }

  const years = Number.parseInt(raw, 10);
  if (!Number.isFinite(years)) {
    // Backward compat: exp_* key'leri gelirse yine göster.
    return t(raw);
  }

  if (years < 1) {
    return withExperienceLabel(`1 ${t('resume_experience_less_suffix')}`, t);
  }
  return withExperienceLabel(`${years} ${t('resume_experience_more_suffix')}`, t);
}

function localizedExperienceTextFromResume(resume: ResumeListItemData, t: (key: string) => string) {
  const exp = safeArray<WorkExperience>(resume.experiences);
  if (exp.length > 0) {
    const months = totalMonthsFromExperiences(exp);
    const duration = localizedDurationFromMonths(months, t);
    const withLabel = withExperienceLabel(duration, t);
    if (withLabel.trim() && withLabel.trim() !== '-') return withLabel;
  }
  return localizedExperienceTextFromKey(resume.experience_key ?? null, t);
}

function formatDateDayMonth(iso: string, t: (key: string) => string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const day = d.getDate();
  const monthIdx = d.getMonth();
  const monthKeys = [
    'monthJanuary',
    'monthFebruary',
    'monthMarch',
    'monthApril',
    'monthMay',
    'monthJune',
    'monthJuly',
    'monthAugust',
    'monthSeptember',
    'monthOctober',
    'monthNovember',
    'monthDecember',
  ];
  const monthKey = monthKeys[monthIdx] ?? '';
  const monthLabel = monthKey ? t(monthKey) : '';
  return monthLabel ? `${day} ${monthLabel}` : String(day);
}

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1"
      style={{ backgroundColor: 'rgba(36, 91, 235, 0.08)' }}
    >
      <span className="shrink-0" style={{ color: 'var(--jobly-main, #245BEB)' }}>{icon}</span>
      <span className="truncate text-[13px] font-semibold" style={{ color: 'var(--jobly-main, #245BEB)' }}>{text}</span>
    </div>
  );
}

function AvatarCircle({ src, alt }: { src?: string | null; alt: string }) {
  const size = 44;

  if (!src) {
    return (
      <div
        className="grid place-items-center rounded-full"
        style={{ width: size, height: size, backgroundColor: 'rgba(36, 91, 235, 0.12)' }}
      >
        <div className="text-[16px] font-bold" style={{ color: 'var(--jobly-main, #245BEB)' }}>
          {(alt?.trim()?.[0] ?? '?').toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-full" style={{ width: size, height: size }}>
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

export function ResumeListItem({ resume }: { resume: ResumeListItemData }) {
  const { t } = useI18n();
  const href = resume.resume_number != null ? `/resume/${resume.resume_number}` : `/resumes/${resume.id}`;

  const manatSymbol = t('currency_azn_symbol');

  const premiumLabel = (t('premium_tag') || 'PREMIUM').toUpperCase();

  const age = resume.birth_year ? new Date().getFullYear() - resume.birth_year : null;
  const subtitle = resume.desired_position
    ? (age != null ? `${resume.desired_position} (${age})` : resume.desired_position)
    : (age != null ? `(${age})` : null);

  const experienceTextRaw = localizedExperienceTextFromResume(resume, t);
  const experienceText = experienceTextRaw && experienceTextRaw.trim() && experienceTextRaw.trim() !== '-'
    ? experienceTextRaw
    : null;
  const educationText = resume.education_key ? t(resume.education_key) : null;

  const createdLabel = resume.create_time ? formatDateDayMonth(resume.create_time, t) : null;

  return (
    <Link href={href} className="block px-4 py-3">
      <div className="flex items-start gap-3">
        <AvatarCircle src={resume.avatar} alt={resume.full_name} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div
                className="truncate text-[16px] font-semibold text-foreground"
                style={{ lineHeight: 1.15 }}
              >
                {resume.full_name}
              </div>
              {subtitle ? (
                <div className="mt-1 truncate text-[13px]" style={{ color: '#6B7280' }}>
                  {subtitle}
                </div>
              ) : null}
            </div>

            {resume.is_premium ? (
              <div
                className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1"
                style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)' }}
              >
                <div className="text-[8px] font-bold" style={{ color: '#000', letterSpacing: 0.6 }}>
                  {premiumLabel}
                </div>
                <i className="ri-vip-crown-fill text-[10px] text-white" />
              </div>
            ) : null}
          </div>

          {(experienceText || educationText) ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {experienceText ? (
                <Pill
                  icon={<Briefcase size={14} variant="Linear" color="var(--jobly-main, #245BEB)" />}
                  text={experienceText}
                />
              ) : null}
              {educationText ? (
                <Pill
                  icon={<Book size={14} variant="Linear" color="var(--jobly-main, #245BEB)" />}
                  text={educationText}
                />
              ) : null}
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 truncate">
              <div className="flex items-center gap-4">
                {resume.desired_salary ? (
                  <div className="inline-flex items-center gap-1 text-[18px] font-bold" style={{ color: 'var(--jobly-main, #245BEB)' }}>
                    <span>{resume.desired_salary}</span>
                    <span className="text-[18px] font-bold" style={{ color: 'var(--jobly-main, #245BEB)' }}>{manatSymbol}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {createdLabel ? (
              <div className="shrink-0 inline-flex items-center gap-2 text-[13px]" style={{ color: '#9CA3AF' }}>
                <Calendar2 size={16} variant="Linear" color="#9CA3AF" />
                <span>{createdLabel}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
