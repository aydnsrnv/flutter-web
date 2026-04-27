"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { incrementResumeAppliedCount } from "@/app/actions/stats";
import { createClient } from "@/lib/supabase/browser";
import { compressImageToBlob } from "@/lib/image-compress";

import {
  Archive,
  Award,
  Barcode,
  Book,
  Briefcase,
  Calendar2,
  Call,
  CloseCircle,
  Direct,
  DocumentDownload,
  Eye,
  Flag,
  Heart,
  Message,
  Location,
  Money,
  ProfileCircle,
  Sms,
  User,
  Magicpen,
  Translate,
} from "iconsax-react";

import { useI18n } from "@/lib/i18n/client";
import { Textarea } from "@/components/ui/textarea";

export type ResumeDetailPanelData = {
  id: string;
  resume_number?: number | string | null;
  full_name: string;
  desired_position?: string | null;
  desired_salary?: string | null;
  city?: string | null;
  birth_year?: number | null;
  gender_key?: string | null;
  marital_status?: string | null;
  experience_key?: string | null;
  education_key?: string | null;
  skills?: string | null;
  languages?: string | null;
  experiences?: unknown;
  educations?: unknown;
  certifications?: unknown;
  avatar?: string | null;
  view_count?: number | null;
  applied_count?: number | null;
  create_time?: string | null;
  expiration_date?: string | null;
  email?: string | null;
  phone?: string | null;
  about?: string | null;
  user_id?: string | null;
  authUserId?: string | null;
  authUserType?: string | null;
};

function HeaderTopPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div
      className="inline-flex items-center gap-[6px] rounded-full px-[10px] py-[6px]"
      style={{
        backgroundColor: "rgba(255,255,255,0.18)",
        border: "0.6px solid rgba(255,255,255,0.22)",
      }}
    >
      {icon}
      <div className="text-[12px] font-semibold" style={{ color: "#fff" }}>
        {text}
      </div>
    </div>
  );
}

function HeaderChip({ icon, text }: { icon: ReactNode; text?: string | null }) {
  if (!text || !text.trim()) return null;
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-2"
      style={{
        backgroundColor: "rgba(255,255,255,0.18)",
        border: "0.6px solid rgba(255,255,255,0.22)",
      }}
    >
      {icon}
      <div
        className="max-w-[260px] truncate text-[12px] font-semibold"
        style={{ color: "#fff" }}
      >
        {text}
      </div>
    </div>
  );
}

function CenteredAvatar({
  url,
  fullName,
}: {
  url?: string | null;
  fullName: string;
}) {
  const { t } = useI18n();
  const size = 104;
  const unknownInitial = (t("unknown_initial") || "?").trim() || "?";
  return (
    <div
      className="grid place-items-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: "rgba(255,255,255,0.22)",
      }}
    >
      {url ? (
        <img src={url} alt={fullName} className="h-full w-full object-cover" />
      ) : (
        <div className="text-[26px] font-bold" style={{ color: "#fff" }}>
          {(fullName?.trim()?.[0] ?? "").toUpperCase() ||
            unknownInitial[0]?.toUpperCase() ||
            "?"}
        </div>
      )}
    </div>
  );
}

function parseCsv(raw?: string | null) {
  if (!raw) return [];
  return raw
    .split(/[;,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function maskEmail(email?: string | null) {
  if (!email) return "";
  const parts = email.split("@");
  if (parts.length !== 2) return "******";
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 1) return `*@${domain}`;
  return `${name[0]}***@${domain}`;
}

function maskPhone(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/(\d{2})\s?(\d{2})$/, "** **");
}

function getDashPlaceholder(t: (key: string) => string) {
  return t("dash_placeholder") || "-";
}

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

function toRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

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
  const dash = getDashPlaceholder(t);
  if (!text || text === dash || text === "-") return rawText;
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
  if (totalMonths <= 0) return getDashPlaceholder(t);
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
  if (!raw) return getDashPlaceholder(t);

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

function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-t-xl px-3 py-[10px]"
      style={{ backgroundColor: "rgba(36, 91, 235, 0.10)" }}
    >
      {icon}
      <div
        className="text-[15px] font-bold"
        style={{ color: "var(--jobly-main, #245BEB)" }}
      >
        {title}
      </div>
    </div>
  );
}

function CardWrap({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
      {children}
    </div>
  );
}

function DetailItem({
  icon,
  title,
  value,
  obscure = false,
}: {
  icon: ReactNode;
  title: string;
  value?: string | null;
  obscure?: boolean;
}) {
  if (!value || !value.trim()) return null;
  return (
    <div className="flex items-start gap-2 py-2">
      <div className="pt-[2px]" style={{ color: "var(--jobly-main, #245BEB)" }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium" style={{ color: "#9CA3AF" }}>
          {title}
        </div>
        <div
          className={`break-words text-[14px] font-semibold text-foreground ${obscure ? "blur-sm select-none" : ""}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function SoftChips({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const palette = [
    "rgba(255,228,181,0.85)",
    "rgba(255,209,220,0.85)",
    "rgba(204,229,255,0.85)",
    "rgba(198,246,213,0.85)",
    "rgba(233,213,255,0.85)",
    "rgba(255,241,182,0.85)",
    "rgba(255,215,168,0.85)",
    "rgba(189,224,254,0.85)",
  ];
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-[6px]">
      {items.map((it, idx) => (
        <div
          key={`${it}-${idx}`}
          className="rounded-full px-[10px] py-[6px] text-[12px] font-semibold"
          style={{
            backgroundColor: palette[idx % palette.length],
            color: "var(--muted-foreground)",
            opacity: 0.78,
          }}
        >
          {it}
        </div>
      ))}
    </div>
  );
}

function TimelineItem({
  title,
  subtitle,
  description,
  showConnector,
}: {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  showConnector: boolean;
}) {
  const dot = "var(--jobly-main, #245BEB)";
  const line = "rgba(36, 91, 235, 0.40)";

  return (
    <div className="relative flex gap-3">
      <div className="relative w-6 shrink-0">
        <div
          className="absolute left-1/2 top-[6px] h-[10px] w-[10px] -translate-x-1/2 rounded-full"
          style={{ backgroundColor: dot }}
        />
        {showConnector ? (
          <div
            className="absolute left-1/2 top-[20px] bottom-0 w-[2px] -translate-x-1/2 rounded-full"
            style={{ backgroundColor: line }}
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 pb-3">
        <div className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
          {title}
        </div>
        {subtitle ? (
          <div className="mt-0.5 text-[12px]" style={{ color: "#9CA3AF" }}>
            {subtitle}
          </div>
        ) : null}
        {description ? (
          <div
            className="mt-1 text-[14px]"
            style={{
              color: "var(--muted-foreground)",
              opacity: 0.78,
              lineHeight: 1.35,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ResumeDetailPanel({
  resume,
}: {
  resume: ResumeDetailPanelData;
}) {
  const { t } = useI18n();
  const [favorite, setFavorite] = useState(false);
  const [reported, setReported] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  const [currentAvatar, setCurrentAvatar] = useState(resume.avatar ?? null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarErrorMsg, setAvatarErrorMsg] = useState<string | null>(null);

  const authUserId = resume.authUserId;
  const isOwner =
    !!authUserId && !!resume.user_id && authUserId === resume.user_id;
  const isEmployer = (resume.authUserType ?? "").toLowerCase() === "employer";
  const canSeeContact = isOwner || isEmployer;

  useEffect(() => {
    setCurrentAvatar(resume.avatar ?? null);
  }, [resume.avatar]);

  const extractAvatarObjectKey = useCallback((url: string | null) => {
    if (!url) return null;
    const raw = url.trim();

    // Normalize to pathname (strip query/hash) when possible
    let normalized = raw;
    try {
      normalized = new URL(raw).pathname;
    } catch {
      // ignore
    }
    normalized = normalized.trim();
    while (normalized.startsWith("/")) normalized = normalized.substring(1);

    const cdnBase = (process.env.NEXT_PUBLIC_AVATAR_CDN_BASE_URL ?? "")
      .trim()
      .replace(/\/+$/, "");
    if (cdnBase && raw.startsWith(cdnBase)) {
      let key = raw.substring(cdnBase.length);
      while (key.startsWith("/")) key = key.substring(1);
      if (key.startsWith("avatars/")) key = key.substring("avatars/".length);
      return key || null;
    }

    const ppBase = "https://pp.jobly.az";
    if (raw.startsWith(ppBase)) {
      let key = raw.substring(ppBase.length);
      while (key.startsWith("/")) key = key.substring(1);
      if (key.startsWith("avatars/")) key = key.substring("avatars/".length);
      return key || null;
    }

    // Handle bucket-style paths like /avatars/<key>
    if (normalized.startsWith("avatars/")) {
      const key = normalized.substring("avatars/".length);
      return key || null;
    }
    // Handle direct object keys like <uid>/avatar_*.jpg
    if (normalized.includes("/")) {
      return normalized || null;
    }
    return null;
  }, []);

  const handleAvatarFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setAvatarErrorMsg(null);
      setIsUploadingAvatar(true);
      try {
        if (!authUserId) {
          throw new Error(t("profile_login_required"));
        }
        const blob = await compressImageToBlob(file, 5, 90, 1024);
        const supabase = createClient();

        const ts = Date.now();
        const objectKey = `${authUserId}/avatar_${ts}.jpg`;

        const { data: presignData, error: presignError } =
          await supabase.functions.invoke("r2-avatar-presign", {
            body: {
              key: objectKey,
              contentType: "image/jpeg",
              contentLength: blob.size,
            },
          });
        if (presignError) {
          throw new Error(
            presignError.message ||
              `Presign error: ${JSON.stringify(presignError)}`,
          );
        }
        if (!presignData?.uploadUrl) {
          throw new Error(
            `Missing uploadUrl. Function returned: ${JSON.stringify(presignData)}`,
          );
        }

        const putRes = await fetch(presignData.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "image/jpeg",
          },
          body: blob,
        });
        if (!putRes.ok) {
          throw new Error(`Upload failed (${putRes.status})`);
        }

        const cdnBase = (
          process.env.NEXT_PUBLIC_AVATAR_CDN_BASE_URL ?? ""
        ).trim();
        const base = (cdnBase || "https://pp.jobly.az").replace(/\/+$/, "");
        const publicUrl = `${base}/${objectKey}`;

        const { error: upErr } = await supabase
          .from("resumes")
          .update({ avatar: publicUrl })
          .eq("id", resume.id);
        if (upErr) throw upErr;

        if (currentAvatar && currentAvatar !== publicUrl) {
          const oldKey = extractAvatarObjectKey(currentAvatar);
          if (oldKey) {
            await supabase.functions
              .invoke("r2-avatar-delete", {
                body: { key: oldKey },
              })
              .catch((e) => {
                // keep upload success even if cleanup fails
                // eslint-disable-next-line no-console
                console.error("r2-avatar-delete failed", e);
              });
          }
        }

        setCurrentAvatar(publicUrl);
      } catch (err: unknown) {
        const maybeObj =
          err && typeof err === "object"
            ? (err as { message?: unknown })
            : null;
        const msg =
          maybeObj?.message != null ? String(maybeObj.message) : String(err);
        setAvatarErrorMsg(
          (t("resume_wizard_error_prefix") || "{error}").replace(
            "{error}",
            msg,
          ),
        );
      } finally {
        setIsUploadingAvatar(false);
        e.target.value = "";
      }
    },
    [authUserId, currentAvatar, extractAvatarObjectKey, resume.id, t],
  );

  const [barRect, setBarRect] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [bottomOffset, setBottomOffset] = useState(0);
  const age = useMemo(() => {
    if (!resume.birth_year) return null;
    return new Date().getFullYear() - resume.birth_year;
  }, [resume.birth_year]);

  const createdLabel = useMemo(() => {
    if (!resume.create_time) return null;
    return formatDateDayMonth(resume.create_time, t);
  }, [resume.create_time, t]);

  const expirationLabel = useMemo(() => {
    if (!resume.expiration_date) return null;
    return formatDateDayMonth(resume.expiration_date, t);
  }, [resume.expiration_date, t]);

  const headerExperienceText = useMemo(() => {
    const exp = safeArray<WorkExperience>(resume.experiences);
    if (exp.length > 0) {
      const months = totalMonthsFromExperiences(exp);
      const duration = localizedDurationFromMonths(months, t);
      const withLabel = withExperienceLabel(duration, t);
      const trimmed = withLabel.trim();
      const dash = getDashPlaceholder(t);
      if (trimmed && trimmed !== dash && trimmed !== "-") return withLabel;
    }
    return localizedExperienceTextFromKey(resume.experience_key ?? null, t);
  }, [resume.experience_key, resume.experiences, t]);

  const headerEducationText = useMemo(() => {
    return resume.education_key ? t(resume.education_key) : null;
  }, [resume.education_key, t]);

  const [reportError, setReportError] = useState<string | null>(null);

  const handleContactClick = useCallback(() => {
    setContactOpen(true);
    incrementResumeAppliedCount(resume.id).catch(() => {});
  }, [resume.id]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getSafe = () => {
      try {
        const v = getComputedStyle(document.documentElement).getPropertyValue(
          "env(safe-area-inset-bottom)",
        );
        const n = Number.parseFloat(v);
        return Number.isFinite(n) ? n : 0;
      } catch {
        return 0;
      }
    };

    const calc = () => {
      const navs = Array.from(
        document.querySelectorAll("[data-bottom-nav]"),
      ) as HTMLElement[];
      const visibleNav = navs.find(
        (el) => el.getBoundingClientRect().width > 0,
      );

      const centers = Array.from(
        document.querySelectorAll("[data-shell-center]"),
      ) as HTMLElement[];
      const visibleCenter = centers.find(
        (el) => el.getBoundingClientRect().width > 0,
      );

      const anchor = visibleCenter ?? visibleNav;
      if (anchor) {
        const r = anchor.getBoundingClientRect();
        setBarRect({ left: r.left, width: r.width });
      } else {
        setBarRect(null);
      }

      if (visibleNav) {
        const navRect = visibleNav.getBoundingClientRect();
        const offset = Math.max(0, window.innerHeight - navRect.top);
        setBottomOffset(offset + 1);
      } else {
        setBottomOffset(0);
      }
    };

    const rafCalc = () => window.requestAnimationFrame(calc);
    rafCalc();

    window.addEventListener("resize", rafCalc);
    window.addEventListener("scroll", rafCalc, { passive: true });

    const centers = Array.from(
      document.querySelectorAll("[data-shell-center]"),
    ) as HTMLElement[];
    const navs = Array.from(
      document.querySelectorAll("[data-bottom-nav]"),
    ) as HTMLElement[];
    const obs = new ResizeObserver(() => rafCalc());
    centers.forEach((c) => obs.observe(c));
    navs.forEach((n) => obs.observe(n));

    return () => {
      window.removeEventListener("resize", rafCalc);
      window.removeEventListener("scroll", rafCalc);
      obs.disconnect();
    };
  }, []);

  const reportKey = useMemo(() => {
    return resume.resume_number
      ? String(resume.resume_number)
      : String(resume.id);
  }, [resume.id, resume.resume_number]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("jobly_resume_reports");
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const list: unknown[] = Array.isArray(parsed) ? parsed : [];
      setReported(
        list.some((x) => String(toRecord(x).resume_id ?? "") === reportKey),
      );
    } catch {
      setReported(false);
    }
  }, [reportKey]);

  const openReport = useCallback(() => {
    setReportError(null);
    setReportReason("");
    setReportOpen(true);
  }, []);

  const submitReport = useCallback(() => {
    if (reported) {
      setReportOpen(false);
      return;
    }
    const reason = reportReason.trim();
    if (!reason) {
      setReportError(t("report_dialog_error_reason_required"));
      return;
    }
    try {
      const raw = localStorage.getItem("jobly_resume_reports");
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const list: Array<Record<string, unknown>> = Array.isArray(parsed)
        ? parsed.map(toRecord)
        : [];
      list.push({
        resume_id: reportKey,
        reason,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem("jobly_resume_reports", JSON.stringify(list));
      setReported(true);
      setReportOpen(false);
      setReportError(null);
      setReportReason("");
    } catch {
      setReportError(t("report_dialog_failed"));
    }
  }, [reportKey, reportReason, reported, t]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("jobly_resume_favorites");
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      setFavorite(ids.includes(resume.id));
    } catch {
      setFavorite(false);
    }
  }, [resume.id]);

  const toggleFavorite = useCallback(() => {
    try {
      const raw = localStorage.getItem("jobly_resume_favorites");
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      const next = ids.includes(resume.id)
        ? ids.filter((x) => x !== resume.id)
        : [...ids, resume.id];
      localStorage.setItem("jobly_resume_favorites", JSON.stringify(next));
      setFavorite(next.includes(resume.id));
    } catch {
      setFavorite((v) => !v);
    }
  }, [resume.id]);

  const experienceItems = useMemo(() => {
    const arr = safeArray<Record<string, unknown>>(resume.experiences);
    const monthKeys = [
      "month_january",
      "month_february",
      "month_march",
      "month_april",
      "month_may",
      "month_june",
      "month_july",
      "month_august",
      "month_september",
      "month_october",
      "month_november",
      "month_december",
    ] as const;

    const formatMonthYear = (month: unknown, year: unknown) => {
      const y = Number(year);
      if (!Number.isFinite(y) || y <= 0) return "";
      const m = Number(month);
      if (Number.isFinite(m) && m >= 1 && m <= 12) {
        const key = monthKeys[m - 1];
        const label = key ? t(key) : "";
        return label && label !== key ? `${label} ${y}` : String(y);
      }
      return String(y);
    };

    return arr
      .map((e) => {
        const company = String(e.company ?? "").trim();
        const position = String(e.position ?? "").trim();
        const title = position || company;
        if (!title) return null;
        const startYear = e.start_year ?? e.startYear;
        const startMonth = e.start_month ?? e.startMonth;
        const endYear = e.end_year ?? e.endYear;
        const endMonth = e.end_month ?? e.endMonth;

        const start = formatMonthYear(startMonth, startYear);
        const end = endYear
          ? formatMonthYear(endMonth, endYear)
          : t("resume_detail_ongoing");
        const period = start ? `${start} - ${end}` : null;

        const subtitle =
          position && company
            ? period
              ? `${company} • ${period}`
              : company
            : period;

        const description =
          typeof e.description === "string" ? e.description : null;
        return { title, period: subtitle, description };
      })
      .filter(Boolean) as Array<{
      title: string;
      period?: string | null;
      description?: string | null;
    }>;
  }, [resume.experiences, t]);

  const educationItems = useMemo(() => {
    const arr = safeArray<Record<string, unknown>>(resume.educations);
    return arr
      .map((e) => {
        const institution = String(e.institution ?? "").trim();
        const degree = String(e.degree ?? "").trim();
        const field = String(e.field ?? "").trim();
        const title = degree ? `${institution} • ${degree}` : institution;
        if (!title.trim()) return null;
        const startYear = e.start_year ?? e.startYear;
        const endYear = e.end_year ?? e.endYear;
        const period =
          startYear || endYear
            ? `${startYear ?? getDashPlaceholder(t)} - ${endYear ?? t("resume_detail_ongoing")}`
            : null;
        const description =
          field || (typeof e.description === "string" ? e.description : "");
        return { title, period, description: description || null };
      })
      .filter(Boolean) as Array<{
      title: string;
      period?: string | null;
      description?: string | null;
    }>;
  }, [resume.educations, t]);

  const certItems = useMemo(() => {
    const arr = safeArray<Record<string, unknown>>(resume.certifications);
    return arr
      .map((c) => {
        const name = String(c.name ?? "").trim();
        if (!name) return null;
        const issuer = String(c.issuer ?? "").trim();
        const year = c.year != null ? String(c.year) : "";
        const title = issuer ? `${name} • ${issuer}` : name;
        const period = year || null;
        const description =
          typeof c.description === "string" ? c.description : null;
        return { title, period, description };
      })
      .filter(Boolean) as Array<{
      title: string;
      period?: string | null;
      description?: string | null;
    }>;
  }, [resume.certifications]);

  return (
    <div>
      {portalReady && contactOpen
        ? createPortal(
            <div className="fixed inset-0" style={{ zIndex: 10000 }}>
              <button
                type="button"
                className="absolute inset-0"
                onClick={() => setContactOpen(false)}
                style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-[520px]">
                <div
                  className="rounded-2xl"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <div className="px-3 pb-3">
                    <div
                      className="pt-3 text-center text-[16px] font-semibold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {t("resumeDetailContactTitle")}
                    </div>

                    {!canSeeContact && (
                      <div className="mt-2 px-4 text-center text-[12px] text-muted-foreground">
                        {t("resume_detail_contact_restricted")}
                      </div>
                    )}

                    <div className="mt-3 grid gap-[10px]">
                      {resume.phone ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!canSeeContact) return;
                            window.open(
                              `tel:${String(resume.phone).replace(/\s+/g, "")}`,
                              "_self",
                            );
                            setContactOpen(false);
                          }}
                          className={`flex h-[60px] w-full items-center gap-[10px] rounded-xl px-3 transition-opacity ${!canSeeContact ? "opacity-70" : ""}`}
                          style={{ backgroundColor: "rgba(34,197,94,0.12)" }}
                        >
                          <div className="shrink-0">
                            <Call size={25} variant="Linear" color="#16A34A" />
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <div
                              className="truncate text-[16px] font-bold"
                              style={{ color: "var(--foreground)" }}
                            >
                              {t("resumeDetailPhone")}
                            </div>
                            <div
                              className={`truncate text-[14px] ${!canSeeContact ? "blur-sm select-none" : ""}`}
                              style={{
                                color: "var(--muted-foreground)",
                                opacity: 0.55,
                              }}
                            >
                              {canSeeContact
                                ? resume.phone
                                : maskPhone(resume.phone)}
                            </div>
                          </div>
                          {canSeeContact && (
                            <i
                              className="ri-arrow-right-s-line text-[20px]"
                              style={{
                                color: "var(--muted-foreground)",
                                opacity: 0.35,
                              }}
                            />
                          )}
                        </button>
                      ) : null}

                      {resume.email ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!canSeeContact) return;
                            window.open(`mailto:${resume.email}`, "_self");
                            setContactOpen(false);
                          }}
                          className={`flex h-[60px] w-full items-center gap-[10px] rounded-xl px-3 transition-opacity ${!canSeeContact ? "opacity-70" : ""}`}
                          style={{ backgroundColor: "rgba(36,91,235,0.12)" }}
                        >
                          <div className="shrink-0">
                            <Sms size={25} variant="Linear" color="#3B82F6" />
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <div
                              className="truncate text-[16px] font-bold"
                              style={{ color: "var(--foreground)" }}
                            >
                              {t("resumeDetailEmail")}
                            </div>
                            <div
                              className={`truncate text-[14px] ${!canSeeContact ? "blur-sm select-none" : ""}`}
                              style={{
                                color: "var(--muted-foreground)",
                                opacity: 0.55,
                              }}
                            >
                              {canSeeContact
                                ? resume.email
                                : maskEmail(resume.email)}
                            </div>
                          </div>
                          {canSeeContact && (
                            <i
                              className="ri-arrow-right-s-line text-[20px]"
                              style={{
                                color: "var(--muted-foreground)",
                                opacity: 0.35,
                              }}
                            />
                          )}
                        </button>
                      ) : null}

                      {!resume.phone && !resume.email ? (
                        <div
                          className="px-1 py-2 text-center text-[14px]"
                          style={{
                            color: "var(--muted-foreground)",
                            opacity: 0.65,
                          }}
                        >
                          {t("resumeDetailContactNotFound")}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {portalReady && reportOpen
        ? createPortal(
            <div className="fixed inset-0" style={{ zIndex: 10000 }}>
              <button
                type="button"
                className="absolute inset-0"
                onClick={() => setReportOpen(false)}
                style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
              />
              <div className="absolute left-1/2 top-1/2 w-[92%] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-4">
                <div
                  className="text-center text-[16px] font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {t("report_dialog_title_cv")}
                </div>

                <div
                  className="mt-3 text-center text-[12px]"
                  style={{ color: "var(--muted-foreground)", opacity: 0.65 }}
                >
                  {reported
                    ? t("report_already_submitted")
                    : t("report_dialog_content")}
                </div>

                {!reported ? (
                  <div className="mt-4">
                    <Textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder={t("report_dialog_hint")}
                    />
                    {reportError ? (
                      <div
                        className="mt-2 text-[12px]"
                        style={{ color: "#EF4444" }}
                      >
                        {reportError}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setReportOpen(false)}
                    className="h-11 flex-1 rounded-xl border border-border text-[14px] font-semibold"
                  >
                    {t("report_dialog_cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={submitReport}
                    className="h-11 flex-1 rounded-xl text-[14px] font-semibold"
                    style={{
                      backgroundColor: "var(--jobly-main, #245BEB)",
                      color: "#fff",
                    }}
                  >
                    {reported ? t("ok") : t("report_dialog_send")}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <div
        className="w-full overflow-hidden rounded-t-2xl"
        style={{
          background: "linear-gradient(135deg, #3a8bff 0%, #5ec6fa 100%)",
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
        }}
      >
        <div className="relative px-3 pb-4 pt-3">
          <div className="absolute left-3 top-3">
            <HeaderTopPill
              icon={<Eye size={14} variant="Linear" color="#fff" />}
              text={String(resume.view_count ?? 0)}
            />
          </div>
          {resume.resume_number != null ? (
            <div className="absolute right-3 top-3">
              <HeaderTopPill
                icon={<Barcode size={14} variant="Linear" color="#fff" />}
                text={String(resume.resume_number)}
              />
            </div>
          ) : null}

          <div className="flex flex-col items-center justify-center pt-6">
            <div className="relative">
              <CenteredAvatar url={currentAvatar} fullName={resume.full_name} />
              {isOwner ? (
                <label
                  className={`absolute -bottom-1 -right-1 grid place-items-center rounded-full cursor-pointer hover:scale-105 transition-transform ${isUploadingAvatar ? "opacity-70 pointer-events-none" : ""}`}
                  style={{
                    width: 34,
                    height: 34,
                    backgroundColor: "var(--jobly-main, #245BEB)",
                    border: "2px solid #fff",
                  }}
                >
                  <ProfileCircle size={16} variant="Linear" color="#fff" />
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                    disabled={isUploadingAvatar}
                  />
                </label>
              ) : null}
            </div>
            <div
              className="mt-[5px] max-w-full truncate px-4 text-center text-[16px]"
              style={{ color: "rgba(255,255,255,0.90)" }}
            >
              {age != null ? `${resume.full_name} (${age})` : resume.full_name}
            </div>
            <div className="mt-[10px] flex flex-wrap justify-center gap-2 px-2">
              <HeaderChip
                icon={<Briefcase size={14} variant="Linear" color="#fff" />}
                text={headerExperienceText}
              />
              <HeaderChip
                icon={<Book size={14} variant="Linear" color="#fff" />}
                text={headerEducationText}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-0 md:px-4 pb-24 pt-3">
        {avatarErrorMsg ? (
          <div
            className="mb-3 rounded-2xl border border-border px-4 py-3 text-[14px]"
            style={{
              color: "#EF4444",
              backgroundColor: "rgba(239,68,68,0.06)",
            }}
          >
            {avatarErrorMsg}
          </div>
        ) : null}
        <div
          className="text-center text-[18px] font-bold"
          style={{ color: "var(--jobly-main)" }}
        >
          {resume.desired_position ?? "—"}
        </div>

        {createdLabel || expirationLabel ? (
          <div
            className="mt-2 flex items-center justify-between gap-3 text-[12px]"
            style={{ color: "#9CA3AF" }}
          >
            <div className="min-w-0">
              {createdLabel ? (
                <div className="inline-flex items-center gap-1">
                  <Calendar2 size={14} variant="Linear" color="#9CA3AF" />
                  <span>{createdLabel}</span>
                </div>
              ) : null}
            </div>
            <div className="min-w-0 text-right">
              {expirationLabel ? (
                <div className="inline-flex items-center justify-end gap-1">
                  <Calendar2 size={14} variant="Linear" color="#9CA3AF" />
                  <span>{expirationLabel}</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {resume.desired_salary ? (
          <CardWrap>
            <SectionHeader
              icon={
                <Money
                  size={16}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              title={t("resumeDetailSectionSalary")}
            />
            <div className="mt-2 grid gap-6 px-3 pb-3">
              <div
                className="text-[16px] font-bold"
                style={{ color: "var(--foreground)" }}
              >
                {resume.desired_salary}
              </div>
            </div>
          </CardWrap>
        ) : null}

        <CardWrap>
          <SectionHeader
            icon={
              <Direct
                size={16}
                variant="Linear"
                color="var(--jobly-main, #245BEB)"
              />
            }
            title={t("resumeDetailSectionContact")}
          />
          <div className="px-3 py-2">
            <DetailItem
              icon={
                <Sms
                  size={18}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              title={t("resumeDetailEmail")}
              value={
                canSeeContact
                  ? (resume.email ?? null)
                  : resume.email
                    ? maskEmail(resume.email)
                    : null
              }
              obscure={!canSeeContact && !!resume.email}
            />
            <DetailItem
              icon={
                <Call
                  size={18}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              title={t("resumeDetailPhone")}
              value={
                canSeeContact
                  ? (resume.phone ?? null)
                  : resume.phone
                    ? maskPhone(resume.phone)
                    : null
              }
              obscure={!canSeeContact && !!resume.phone}
            />
          </div>
        </CardWrap>

        <CardWrap>
          <SectionHeader
            icon={
              <User
                size={16}
                variant="Linear"
                color="var(--jobly-main, #245BEB)"
              />
            }
            title={t("resumeDetailSectionPersonalInfo")}
          />
          <div className="px-3 py-2">
            {resume.birth_year ? (
              <DetailItem
                icon={
                  <Calendar2
                    size={18}
                    variant="Linear"
                    color="var(--jobly-main, #245BEB)"
                  />
                }
                title={t("resumeDetailBirthYear")}
                value={String(resume.birth_year)}
              />
            ) : null}
            <DetailItem
              icon={
                <User
                  size={18}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              title={t("resumeDetailGender")}
              value={
                resume.gender_key
                  ? (() => {
                      const gk =
                        resume.gender_key === "all_gender"
                          ? "all_genders"
                          : resume.gender_key;
                      const tr = t(gk);
                      return tr !== gk ? tr : resume.gender_key;
                    })()
                  : null
              }
            />
            <DetailItem
              icon={
                <Heart
                  size={18}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              title={t("resumeDetailMaritalStatus")}
              value={
                resume.marital_status
                  ? (() => {
                      const mk = `marital_${String(resume.marital_status).toLowerCase()}`;
                      const tr = t(mk);
                      return tr !== mk ? tr : resume.marital_status;
                    })()
                  : null
              }
            />
          </div>
        </CardWrap>

        {resume.city ? (
          <CardWrap>
            <SectionHeader
              icon={
                <Location
                  size={16}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              title={t("resumeDetailCity")}
            />
            <div
              className="px-3 py-3 text-[15px]"
              style={{ color: "var(--foreground)" }}
            >
              {t(resume.city!) !== resume.city ? t(resume.city!) : resume.city}
            </div>
          </CardWrap>
        ) : null}

        {resume.skills ? (
          <CardWrap>
            <SectionHeader
              icon={
                <Magicpen
                  size={16}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              title={t("resumeDetailSkills")}
            />
            <div className="px-3 py-3">
              <SoftChips items={parseCsv(resume.skills)} />
            </div>
          </CardWrap>
        ) : null}

        {resume.languages ? (
          <CardWrap>
            <SectionHeader
              icon={
                <Translate
                  size={16}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              title={t("resumeDetailLanguages")}
            />
            <div className="px-3 py-3">
              <SoftChips
                items={parseCsv(resume.languages).map((entry) => {
                  const raw = entry.trim();
                  // Format: "resume_wizard_lang_english (B2)" — extract key before " ("
                  const parenIdx = raw.indexOf(" (");
                  const key =
                    parenIdx !== -1 ? raw.substring(0, parenIdx).trim() : raw;
                  const level = parenIdx !== -1 ? raw.substring(parenIdx) : "";
                  const translated = t(key);
                  const label = translated !== key ? translated : key;
                  return level ? `${label}${level}` : label;
                })}
              />
            </div>
          </CardWrap>
        ) : null}

        {resume.about ? (
          <CardWrap>
            <SectionHeader
              icon={
                <ProfileCircle
                  size={16}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              title={t("resumeDetailAbout")}
            />
            <div
              className="px-3 py-3 text-[14px]"
              style={{
                color: "var(--muted-foreground)",
                opacity: 0.78,
                whiteSpace: "pre-wrap",
                lineHeight: 1.35,
              }}
            >
              {resume.about}
            </div>
          </CardWrap>
        ) : null}

        {experienceItems.length > 0 ? (
          <CardWrap>
            <SectionHeader
              icon={
                <Briefcase
                  size={16}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              title={t("resumeDetailWorkHistory")}
            />
            <div className="px-3 py-3">
              {experienceItems.map((it, idx) => (
                <TimelineItem
                  key={idx}
                  title={it.title}
                  subtitle={it.period ?? null}
                  description={it.description ?? null}
                  showConnector={experienceItems.length > 1 && idx !== experienceItems.length - 1}
                />
              ))}
            </div>
          </CardWrap>
        ) : null}

        {educationItems.length > 0 ? (
          <CardWrap>
            <SectionHeader
              icon={
                <Book
                  size={16}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              title={t("resumeDetailEducationHistory")}
            />
            <div className="px-3 py-3">
              {educationItems.map((it, idx) => (
                <TimelineItem
                  key={idx}
                  title={it.title}
                  subtitle={it.period ?? null}
                  description={it.description ?? null}
                  showConnector={educationItems.length > 1 && idx !== educationItems.length - 1}
                />
              ))}
            </div>
          </CardWrap>
        ) : null}

        {certItems.length > 0 ? (
          <CardWrap>
            <SectionHeader
              icon={
                <Award
                  size={16}
                  variant="Linear"
                  color="var(--jobly-main, #245BEB)"
                />
              }
              title={t("resumeDetailCertifications")}
            />
            <div className="px-3 py-3">
              {certItems.map((it, idx) => (
                <TimelineItem
                  key={idx}
                  title={it.title}
                  subtitle={it.period ?? null}
                  description={it.description ?? null}
                  showConnector={certItems.length > 1 && idx !== certItems.length - 1}
                />
              ))}
            </div>
          </CardWrap>
        ) : null}
      </div>

      <div
        className="fixed inset-x-0 mx-auto w-full max-w-md z-[60] bottom-0 lg:max-w-none"
        style={{
          ...(barRect
            ? { left: barRect.left, width: barRect.width, right: "auto" }
            : null),
          ...(typeof window !== "undefined" && window.innerWidth >= 1024
            ? bottomOffset > 0
              ? { bottom: bottomOffset }
              : { bottom: 1 }
            : null),
        }}
      >
        <div className="pb-[calc(env(safe-area-inset-bottom,0px)+64px)] lg:pb-0">
          <div
            className="px-4 bg-card rounded-2xl shadow-[0_-4px_25px_rgba(0,0,0,0.08)] border-t border-border"
            style={{ paddingTop: 12, paddingBottom: 12 }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleFavorite}
                className="grid h-12 w-12 place-items-center rounded-xl"
                style={{ backgroundColor: "var(--secondary)" }}
              >
                <Archive
                  size={24}
                  variant={favorite ? "Bold" : "Linear"}
                  color={favorite ? "#FFA500" : "var(--muted-foreground)"}
                />
              </button>
              <button
                type="button"
                onClick={handleContactClick}
                className="h-12 flex-1 rounded-full text-[16px] font-semibold"
                style={{
                  backgroundColor: "var(--jobly-main, #245BEB)",
                  color: "#fff",
                }}
              >
                {t("resumeDetailContactButton")}
              </button>
              <button
                type="button"
                onClick={openReport}
                className="grid h-12 w-12 place-items-center rounded-xl"
                style={{ backgroundColor: "var(--secondary)" }}
              >
                <Flag
                  size={24}
                  variant="Linear"
                  color={reported ? "#FFA500" : "var(--jobly-main, #245BEB)"}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
