"use client";

import Link from "next/link";

import { Book, Briefcase, Calendar2 } from "iconsax-react";
import { ManatIcon } from '@/components/ui/manat-icon';
import { PremiumBadge } from '@/components/ui/premium-badge';

import { useI18n } from "@/lib/i18n/client";

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
  if (typeof v === "string") {
    try {
      const parsed: unknown = JSON.parse(v);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function totalMonthsFromExperiences(
  experiences: WorkExperience[],
  nowOverride?: Date,
) {
  if (experiences.length === 0) return 0;
  const now = nowOverride ?? new Date();

  let sum = 0;
  for (const e of experiences) {
    const sy = e.start_year ?? e.startYear ?? 0;
    if (!sy || sy <= 0) continue;
    const smRaw = e.start_month ?? e.startMonth ?? 0;
    const sm = smRaw && smRaw > 0 ? smRaw : 1;

    const eyRaw = e.end_year ?? e.endYear ?? 0;
    const ey = !eyRaw || eyRaw === 0 ? now.getFullYear() : eyRaw;

    const emRaw = e.end_month ?? e.endMonth ?? 0;
    const em =
      emRaw && emRaw > 0
        ? emRaw
        : !eyRaw || eyRaw === 0
          ? now.getMonth() + 1
          : 1;

    const start = sy * 12 + sm;
    const end = ey * 12 + em;
    const diff = end - start;
    if (diff <= 0) continue;
    sum += diff;
  }
  return sum;
}

function withExperienceLabel(rawText: string, t: (key: string) => string) {
  const text = rawText.trim();
  if (!text || text === "-") return rawText;
  const label = t("resume_experience_label").trim();
  if (!label) return rawText;

  if (t("exp_none") && text === t("exp_none")) return rawText;
  if (text.endsWith(label)) return rawText;
  return `${text} ${label}`;
}

function localizedDurationFromMonths(
  totalMonths: number,
  t: (key: string) => string,
) {
  if (totalMonths <= 0) return "-";
  const yearSuffix = t("resume_duration_year_suffix");
  const monthSuffix = t("resume_duration_month_suffix");

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

function localizedExperienceTextFromKey(
  experienceKey: string | null | undefined,
  t: (key: string) => string,
) {
  const raw = (experienceKey ?? "").trim();
  if (!raw) return "-";

  if (raw === "exp_none") {
    return t(raw);
  }

  const years = Number.parseInt(raw, 10);
  if (!Number.isFinite(years)) {
    return t(raw);
  }

  if (years < 1) {
    return withExperienceLabel(`1 ${t("resume_experience_less_suffix")}`, t);
  }
  return withExperienceLabel(
    `${years} ${t("resume_experience_more_suffix")}`,
    t,
  );
}

function localizedExperienceTextFromResume(
  resume: ResumeListItemData,
  t: (key: string) => string,
) {
  const exp = safeArray<WorkExperience>(resume.experiences);
  if (exp.length > 0) {
    const months = totalMonthsFromExperiences(exp);
    const duration = localizedDurationFromMonths(months, t);
    const withLabel = withExperienceLabel(duration, t);
    if (withLabel.trim() && withLabel.trim() !== "-") return withLabel;
  }
  return localizedExperienceTextFromKey(resume.experience_key ?? null, t);
}

function formatDateDayMonth(iso: string, t: (key: string) => string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const now = new Date();
  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isSameDay) return t("today");

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  if (isYesterday) return t("yesterday");

  const day = d.getDate();
  const monthIdx = d.getMonth();
  const monthKeys = [
    "monthJanuary",
    "monthFebruary",
    "monthMarch",
    "monthApril",
    "monthMay",
    "monthJune",
    "monthJuly",
    "monthAugust",
    "monthSeptember",
    "monthOctober",
    "monthNovember",
    "monthDecember",
  ];
  const monthKey = monthKeys[monthIdx] ?? "";
  const monthLabel = monthKey ? t(monthKey) : "";
  return monthLabel ? `${day} ${monthLabel}` : String(day);
}

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-primary/[0.08]">
      <span className="shrink-0 text-primary">
        {icon}
      </span>
      <span className="truncate text-sm font-semibold text-primary">
        {text}
      </span>
    </div>
  );
}

function AvatarCircle({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="grid h-11 w-11 place-items-center rounded-full bg-jobly-soft">
        <div className="text-base font-bold text-primary">
          {(alt?.trim()?.[0] ?? "?").toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div className="h-11 w-11 overflow-hidden rounded-full">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

export function ResumeListItem({ resume }: { resume: ResumeListItemData }) {
  const { t } = useI18n();
  const href =
    resume.resume_number != null
      ? `/cv/${resume.resume_number}`
      : `/cvs/${resume.id}`;

  const desiredPosition = resume.desired_position?.trim()
    ? resume.desired_position
    : t("resume_position_not_specified");

  const age = resume.birth_year
    ? new Date().getFullYear() - resume.birth_year
    : null;
  const subtitle =
    age != null ? `${resume.full_name} (${age})` : resume.full_name;

  const experienceTextRaw = localizedExperienceTextFromResume(resume, t);
  const experienceText =
    experienceTextRaw && experienceTextRaw.trim() ? experienceTextRaw : "-";
  const educationText = resume.education_key?.trim()
    ? t(resume.education_key)
    : "-";

  const createdLabel = resume.create_time
    ? formatDateDayMonth(resume.create_time, t)
    : null;

  return (
    <Link href={href} className="block py-3">
      <div className="flex items-start gap-3">
        <AvatarCircle src={resume.avatar} alt={resume.full_name} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-medium text-foreground leading-tight">
                {desiredPosition}
              </div>
              <div className="mt-0.5 truncate text-sm text-muted-foreground">
                {subtitle}
              </div>
            </div>

            {resume.is_premium ? <PremiumBadge /> : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Pill
              icon={
                <Briefcase
                  size={14}
                  variant="Linear"
                  color="currentColor"
                  className="text-primary"
                />
              }
              text={experienceText}
            />
            <Pill
              icon={
                <Book
                  size={14}
                  variant="Linear"
                  color="currentColor"
                  className="text-primary"
                />
              }
              text={educationText}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 truncate">
              <div className="flex items-center gap-4">
                {resume.desired_salary ? (
                  <div className="inline-flex items-center gap-1 text-lg font-bold text-primary">
                    <span>{resume.desired_salary}</span>
                    <span className="shrink-0">
                      <ManatIcon size={18} />
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {createdLabel ? (
              <div className="shrink-0 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar2 size={16} variant="Linear" color="currentColor" className="text-muted-foreground" />
                <span>{createdLabel}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
