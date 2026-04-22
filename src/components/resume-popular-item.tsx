"use client";

import Link from "next/link";

import { useI18n } from "@/lib/i18n/client";

export type ResumePopularItemData = {
  id: string;
  resume_number?: number | string | null;
  full_name: string;
  desired_position?: string | null;
  experience_key?: string | null;
  experiences?: unknown;
  avatar?: string | null;
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
  resume: ResumePopularItemData,
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

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/g).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]?.[0]?.toUpperCase() ?? "?";
  const a = parts[0]?.[0]?.toUpperCase() ?? "";
  const b = parts[parts.length - 1]?.[0]?.toUpperCase() ?? "";
  return (a + b).trim() || "?";
}

export function ResumePopularItem({
  resume,
}: {
  resume: ResumePopularItemData;
}) {
  const { t } = useI18n();
  const href =
    resume.resume_number != null
      ? `/resume/${resume.resume_number}`
      : `/resumes/${resume.id}`;
  const desiredPosition =
    resume.desired_position ?? t("resume_detail_position_not_specified");
  const expTextRaw = localizedExperienceTextFromResume(resume, t);
  const experienceText =
    expTextRaw && expTextRaw.trim() && expTextRaw.trim() !== "-"
      ? expTextRaw
      : "";

  const hasAvatar =
    !!resume.avatar &&
    (resume.avatar.startsWith("http://") ||
      resume.avatar.startsWith("https://"));

  return (
    <Link
      href={href}
      className="relative block overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      style={{
        backgroundColor: "rgba(36,91,235,0.06)",
      }}
    >
      {hasAvatar ? (
        <img
          src={resume.avatar ?? ""}
          alt={resume.full_name}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="absolute inset-0 grid place-items-center"
          style={{ backgroundColor: "rgba(36,91,235,0.06)" }}
        >
          <div className="text-[54px] font-extrabold text-foreground/50">
            {initialsFromName(resume.full_name)}
          </div>
        </div>
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(36,91,235,0.06) 0%, rgba(36,91,235,0.70) 100%)",
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-10">
        <div
          className="truncate text-[15px] font-bold text-white"
          style={{ lineHeight: 1.15 }}
        >
          {desiredPosition}
        </div>
        {experienceText ? (
          <div
            className="mt-[3px] truncate text-[12px] font-medium"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            {experienceText}
          </div>
        ) : null}
      </div>

      <div className="aspect-[6/7] w-full" />
    </Link>
  );
}
