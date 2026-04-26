"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { incrementJobAppliedCount } from "@/app/actions/stats";
import { FlutterJobListGroup } from "@/components/flutter-job-list-group";
import type { FlutterJobItemData } from "@/components/flutter-job-item";
import { useI18n } from "@/lib/i18n/client";
import {
  ArrowRight2,
  Archive,
  Call,
  Copy,
  Briefcase,
  Element3,
  Eye,
  Flag,
  Link as LinkIcon,
  Message,
  Sms,
  Money,
  UserTick,
} from "iconsax-react";
import { Textarea } from "@/components/ui/textarea";
import { ManatIcon } from '@/components/ui/manat-icon';

export type JobDetailPanelData = {
  id: string;
  job_number?: string | number | null;
  title: string;
  job_type?: string | null;
  category_name?: string | null;
  company_id?: string | number | null;
  company_name: string;
  company_logo?: string | null;
  city?: string | null;
  create_time?: string | null;
  expiration_date?: string | null;
  min_age?: string | number | null;
  max_age?: string | number | null;
  education?: string | null;
  experience?: string | null;
  gender?: string | null;
  view_count?: number | null;
  applied_count?: number | null;
  min_salary?: string | null;
  max_salary?: string | null;
  number?: string | null;
  mail?: string | null;
  apply_link?: string | null;
  request?: string | null;
  about?: string | null;
  similar_jobs?: FlutterJobItemData[];
};

function formatDateDMY(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function isNonEmpty(v?: string | number | null) {
  if (v == null) return false;
  const t = String(v).trim();
  return t.length > 0 && t !== "0";
}

function SalaryText({
  min,
  max,
  currencySymbol,
}: {
  min?: string | null;
  max?: string | null;
  currencySymbol: string;
}) {
  const has = isNonEmpty(min) && isNonEmpty(max);
  if (!has) return null;
  return (
    <div className="inline-flex items-center gap-1">
      <span>
        {String(min).trim()} - {String(max).trim()}
      </span>
      <span className="shrink-0" style={{ color: 'var(--jobly-main)' }}>
        <ManatIcon size={16} />
      </span>
    </div>
  );
}

function ContactTile({
  icon,
  title,
  subtitle,
  tint,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  tint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[60px] w-full items-center gap-[10px] overflow-hidden rounded-xl px-3"
      style={{
        backgroundColor: tint,
      }}
    >
      <div className="shrink-0" style={{ color: 'var(--foreground)' }}>
        {icon}
      </div>

      <div className="min-w-0 flex-1 overflow-hidden text-left">
        <div
          className="overflow-hidden text-ellipsis whitespace-nowrap text-[16px] font-bold"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </div>
        <div
          className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px]"
          style={{ color: "var(--muted-foreground)" }}
          title={subtitle}
        >
          {subtitle}
        </div>
      </div>

      <div
        className="shrink-0"
        style={{ color: "var(--muted-foreground)", opacity: 0.45 }}
      >
        <ArrowRight2 size={18} variant="Linear" />
      </div>
    </button>
  );
}

function DetailRow({ title, value }: { title: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-1">
      <div
        className="min-w-[44%] text-[14px] font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        {title}:
      </div>
      <div
        className="flex-1 text-[13px]"
        style={{ color: "var(--muted-foreground)" }}
      >
        {value}
      </div>
    </div>
  );
}

function CopyableContactRow({
  icon,
  value,
}: {
  icon: ReactNode;
  value?: string | null;
}) {
  const onCopy = useCallback(async () => {
    const v = value?.trim();
    if (!v) return;
    try {
      await navigator.clipboard.writeText(v);
    } catch {
      // ignore
    }
  }, [value]);

  if (!value || !value.trim()) return null;

  return (
    <button
      type="button"
      onClick={onCopy}
      className="flex w-full items-center gap-2 text-left"
    >
        <div className="shrink-0" style={{ color: 'var(--foreground)' }}>
          {icon}
        </div>
      <span
        className="min-w-0 flex-1 truncate font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        {value}
      </span>
      <span
        className="shrink-0"
        style={{ color: "var(--muted-foreground)", opacity: 0.35 }}
      >
        <Copy size={18} variant="Linear" />
      </span>
    </button>
  );
}

function DetailSection({
  title,
  content,
}: {
  title: string;
  content?: string | null;
}) {
  if (!content || !content.trim()) return null;
  const lines = content.split("\n");
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div
        className="text-[16px] font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        {title}:
      </div>
      <div
        className="mt-3 grid gap-2 text-[14px]"
        style={{ color: "var(--muted-foreground)" }}
      >
        {lines.map((raw, idx) => {
          const trimmed = raw.trim();
          if (!trimmed) return <div key={idx} className="h-3" />;

          const startsWithSlash = trimmed.startsWith("/");
          const text = startsWithSlash ? trimmed.slice(1).trim() : trimmed;

          return (
            <div key={idx} className="flex items-start gap-2">
              {!startsWithSlash && (
                <div
                  className="mt-[6px] h-[6px] w-[6px] rounded-full"
                  style={{ backgroundColor: "var(--jobly-main)" }}
                />
              )}
              <div
                className="flex-1"
                style={{
                  whiteSpace: "pre-wrap",
                  fontWeight: startsWithSlash ? "bold" : "normal",
                }}
              >
                {text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompanyLogoCircle({ src, alt }: { src?: string | null; alt: string }) {
  const size = 88;

  return (
    <div
      className="grid place-items-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: "rgba(36, 91, 235, 0.10)",
      }}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div
          className="text-[28px] font-bold"
          style={{ color: "var(--muted-foreground)" }}
        >
          {(alt?.trim()?.[0] ?? "?").toUpperCase()}
        </div>
      )}
    </div>
  );
}

export function JobDetailPanel({ job }: { job: JobDetailPanelData }) {
  const { t } = useI18n();

  const manatSymbol = t("currency_azn_symbol");

  const [barRect, setBarRect] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [bottomOffset, setBottomOffset] = useState(0);
    const [computedBarStyle, setComputedBarStyle] = useState<Record<string, any> | null>(null);

  const labelOrRaw = useCallback(
    (raw?: string | null) => {
      if (!raw) return null;
      const v = raw.trim();
      if (!v) return null;

      const looksLikeKey =
        v.startsWith("city_") ||
        v.startsWith("category") ||
        v.startsWith("job_type_") ||
        v.startsWith("education_") ||
        v.startsWith("exp_") ||
        v.startsWith("marital_") ||
        v === "male" ||
        v === "female" ||
        v === "all_genders" ||
        v === "all_gender";

      if (!looksLikeKey) return v;

      const finalKey = v === "all_gender" ? "all_genders" : v;
      const translated = t(finalKey);
      return translated && translated !== finalKey ? translated : v;
    },
    [t],
  );

  const [contactOpen, setContactOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportError, setReportError] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  const handleContactClick = useCallback(() => {
    setContactOpen(true);
    incrementJobAppliedCount(job.id).catch(() => {});
  }, [job.id]);

  const copyTitle = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(job.title);
    } catch {
      // ignore
    }
  }, [job.title]);

  const createdLabel = formatDateDMY(job.create_time);
  const expirationLabel = formatDateDMY(job.expiration_date);
  const ageRange =
    job.min_age != null || job.max_age != null
      ? `${job.min_age ?? ""}-${job.max_age ?? ""}`
          .replace(/^\-/, "")
          .replace(/\-$/, "")
      : null;

  const hasContact = useMemo(() => {
    return Boolean(
      (job.mail && job.mail.trim()) ||
      (job.number && job.number.trim()) ||
      (job.apply_link && job.apply_link.trim()),
    );
  }, [job.apply_link, job.mail, job.number]);

  const favoriteKey = useMemo(() => {
    return job.job_number != null ? String(job.job_number) : job.id;
  }, [job.id, job.job_number]);

  const reportKey = useMemo(() => {
    return job.id;
  }, [job.id]);

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
        setBottomOffset(offset);
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
      obs.disconnect();
      window.removeEventListener("resize", rafCalc);
      window.removeEventListener("scroll", rafCalc);
    };
  }, []);

  useEffect(() => {
    // compute bar style only on client after measurements to avoid SSR hydration mismatch
    if (typeof window === 'undefined') return;
    const style: Record<string, any> = {};
    if (barRect) {
      style.left = barRect.left;
      style.width = barRect.width;
      style.right = 'auto';
    }
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      if (bottomOffset > 0) style.bottom = Math.max(bottomOffset + 1, 1);
      else style.bottom = 1;
    }
    setComputedBarStyle(Object.keys(style).length ? style : null);
  }, [barRect, bottomOffset]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("jobly_fav_jobs");
      const arr = raw ? (JSON.parse(raw) as unknown) : [];
      const list = Array.isArray(arr) ? arr.map(String) : [];
      setFavorite(list.includes(favoriteKey));
    } catch {
      setFavorite(false);
    }
  }, [favoriteKey]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("jobly_reported_jobs");
      const arr = raw ? (JSON.parse(raw) as unknown) : [];
      const list = Array.isArray(arr) ? arr.map(String) : [];
      setReported(list.includes(reportKey));
    } catch {
      setReported(false);
    }
  }, [reportKey]);

  const toggleFavorite = useCallback(() => {
    try {
      const raw = localStorage.getItem("jobly_fav_jobs");
      const arr = raw ? (JSON.parse(raw) as unknown) : [];
      const list = Array.isArray(arr) ? arr.map(String) : [];
      const next = list.includes(favoriteKey)
        ? list.filter((x) => x !== favoriteKey)
        : [...list, favoriteKey];
      localStorage.setItem("jobly_fav_jobs", JSON.stringify(next));
      setFavorite(next.includes(favoriteKey));
    } catch {
      // ignore
    }
  }, [favoriteKey]);

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
      const raw = localStorage.getItem("jobly_reported_jobs");
      const arr = raw ? (JSON.parse(raw) as unknown) : [];
      const list = Array.isArray(arr) ? arr.map(String) : [];
      const next = list.includes(reportKey) ? list : [...list, reportKey];
      localStorage.setItem("jobly_reported_jobs", JSON.stringify(next));

      const rawReports = localStorage.getItem("jobly_job_reports");
      const reportsArr = rawReports ? (JSON.parse(rawReports) as unknown) : [];
      const reportsList = Array.isArray(reportsArr) ? reportsArr : [];
      reportsList.push({
        job_id: reportKey,
        reason,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem("jobly_job_reports", JSON.stringify(reportsList));

      setReported(true);
      setReportOpen(false);
      setReportError(null);
      setReportReason("");
    } catch {
      setReportError(t("report_dialog_failed"));
    }
  }, [reportKey, reportReason, reportOpen, reported, t]);

  const openTel = useCallback((phone: string) => {
    const cleaned = phone.replace(/\s+/g, "");
    window.location.href = `tel:${cleaned}`;
  }, []);

  const openMail = useCallback((mail: string) => {
    window.location.href = `mailto:${mail}`;
  }, []);

  const openApplyLink = useCallback((url: string) => {
    let link = url.trim();
    if (!link) return;
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      link = `https://${link}`;
    }
    window.open(link, "_blank", "noopener,noreferrer");
  }, []);

  const salaryNode = (
    <SalaryText
      min={job.min_salary}
      max={job.max_salary}
      currencySymbol={manatSymbol}
    />
  );

  const cityLabel = labelOrRaw(job.city ?? null);
  const jobTypeLabel = labelOrRaw(job.job_type ?? null);
  const categoryLabel = labelOrRaw(job.category_name ?? null);
  const experienceLabel = labelOrRaw(job.experience ?? null);
  const educationLabel = labelOrRaw(job.education ?? null);
  const genderLabel = labelOrRaw(job.gender ?? null);

  return (
    <div>
      <div className="relative rounded-t-2xl">
        <div
          className="h-[140px] w-full overflow-hidden rounded-t-2xl"
          style={{
            background: "linear-gradient(135deg, #3a8bff 0%, #5ec6fa 100%)",
          }}
        >
          <div className="flex justify-end gap-3 p-4">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2"
              style={{
                backgroundColor: reported
                  ? "rgba(255,165,0,0.30)"
                  : "rgba(255,255,255,0.20)",
              }}
              onClick={openReport}
            >
              <Flag size={22} variant="Linear" color="#fff" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-[10px]">
            <div
              className="inline-flex items-center gap-1 rounded-2xl px-[10px] py-[6px]"
              style={{ backgroundColor: "rgba(255,255,255,0.20)" }}
            >
              <Eye size={16} variant="Linear" color="#fff" />
              <div className="text-[12px] font-bold" style={{ color: "#fff" }}>
                {String(job.view_count ?? 0)}
              </div>
            </div>
            <div
              className="inline-flex items-center gap-1 rounded-2xl px-[10px] py-[6px]"
              style={{ backgroundColor: "rgba(255,255,255,0.20)" }}
            >
              <UserTick size={16} variant="Linear" color="#fff" />
              <div className="text-[12px] font-bold" style={{ color: "#fff" }}>
                {String(job.applied_count ?? 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-[45px] right-5">
          <div
            className="rounded-full p-1"
            style={{
              background: "linear-gradient(135deg, #3a8bff 0%, #5ec6fa 100%)",
            }}
          >
            {job.company_id ? (
              <Link
                href={`/company/${String(job.company_id)}`}
                aria-label={job.company_name}
              >
                <CompanyLogoCircle
                  src={job.company_logo}
                  alt={job.company_name}
                />
              </Link>
            ) : (
              <CompanyLogoCircle
                src={job.company_logo}
                alt={job.company_name}
              />
            )}
          </div>
        </div>
      </div>

      <div className="px-0 md:px-4 pb-24 pt-[60px]">
        <button
          type="button"
          onClick={copyTitle}
          className="block w-full text-left"
        >
          <div
            className="text-[22px] font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {job.title}
          </div>
        </button>
        <div
          className="mt-1 text-[14px]"
          style={{ color: "var(--muted-foreground)" }}
        >
          {job.company_name}
        </div>

        <div
          className="mt-3 rounded-xl"
          style={{ backgroundColor: "rgba(36, 91, 235, 0.10)" }}
        >
          <div className="px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Money size={20} variant="Linear" color="var(--jobly-main)" />
                <div
                  className="text-[14px] font-semibold"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {t("salary")}
                </div>
              </div>
              <div
                className="text-[16px] font-bold"
                style={{ color: "var(--foreground)" }}
              >
                {salaryNode ?? t("salaryNotSpecified")}
              </div>
            </div>

            {jobTypeLabel ? (
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Briefcase size={20} variant="Linear" color="var(--jobly-main)" />
                  <div
                    className="text-[14px] font-semibold"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {t("jobType")}
                  </div>
                </div>
                <div
                  className="text-[16px] font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {jobTypeLabel}
                </div>
              </div>
            ) : null}

            {categoryLabel ? (
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Element3 size={20} variant="Linear" color="var(--jobly-main)" />
                  <div
                    className="text-[14px] font-semibold"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {t("category")}
                  </div>
                </div>
                <div
                  className="text-[16px] font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {categoryLabel}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="grid">
            <DetailRow
              title={t("jobNumber")}
              value={job.job_number != null ? String(job.job_number) : null}
            />
            <DetailRow title={t("city")} value={cityLabel} />
            <DetailRow title={t("age")} value={ageRange} />
            <DetailRow title={t("education")} value={educationLabel} />
            <DetailRow title={t("experience")} value={experienceLabel} />
            <DetailRow title={t("gender")} value={genderLabel} />
            <DetailRow title={t("jobStartDate")} value={createdLabel} />
            <DetailRow title={t("jobEndDate")} value={expirationLabel} />
          </div>

          <div className="mt-3 grid gap-2">
            <CopyableContactRow
              icon={<Sms size={18} variant="Linear" color="currentColor" />}
              value={job.mail ?? null}
            />
            <CopyableContactRow
              icon={<Call size={18} variant="Linear" color="currentColor" />}
              value={job.number ?? null}
            />
          </div>
        </div>

        <div className="mt-4">
          <DetailSection
            title={t("jobRequirements")}
            content={job.request ?? null}
          />
        </div>

        <div className="mt-4">
          <DetailSection title={t("jobAbout")} content={job.about ?? null} />
        </div>

        {job.similar_jobs && job.similar_jobs.length > 0 ? (
          <div className="mt-6">
            <div className="pb-2 text-center text-[16px] font-semibold text-foreground">
              {t("similarJobs")}
            </div>
            <div>
              <FlutterJobListGroup jobs={job.similar_jobs} />
            </div>
          </div>
        ) : null}
      </div>

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
                      {t("contactInfo")}
                    </div>

                    <div className="mt-3 grid gap-[10px]">
                      {job.number && job.number.trim() && job.number !== "0" ? (
                        <ContactTile
                          icon={<Call size={25} variant="Linear" color="#16A34A" />}
                          title={t("phone")}
                          subtitle={job.number}
                          tint="rgba(34,197,94,0.12)"
                          onClick={() => openTel(job.number!)}
                        />
                      ) : null}

                      {job.mail && job.mail.trim() ? (
                        <ContactTile
                          icon={<Sms size={25} variant="Linear" color="#3B82F6" />}
                          title={t("email")}
                          subtitle={job.mail}
                          tint="rgba(59,130,246,0.12)"
                          onClick={() => openMail(job.mail!)}
                        />
                      ) : null}

                      {job.apply_link && job.apply_link.trim() ? (
                        <ContactTile
                          icon={<LinkIcon size={25} variant="Linear" color="#7C3AED" />}
                          title={t("applyLink")}
                          subtitle={job.apply_link.trim()}
                          tint="rgba(168,85,247,0.12)"
                          onClick={() => openApplyLink(job.apply_link!.trim())}
                        />
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
                  {t("report_dialog_title")}
                </div>

                <div
                  className="mt-3 text-center text-[12px]"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {reported
                    ? t("report_already_submitted")
                    : t("report_dialog_content")}
                </div>

                {!reported ? (
                  <div className="mt-4">
                    <Textarea
                      value={reportReason}
                      onChange={(e) => {
                        setReportReason(e.target.value);
                        setReportError(null);
                      }}
                      placeholder={t("report_dialog_hint")}
                    />
                    {reportError ? (
                      <div
                        className="mt-2 text-[12px] font-semibold"
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
                    disabled={reported}
                    className="h-11 flex-1 rounded-xl text-[14px] font-semibold"
                    style={{
                      backgroundColor: "var(--jobly-main)",
                      color: "#fff",
                      opacity: reported ? 0.5 : 1,
                    }}
                  >
                    {t("report_dialog_send")}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <div
        className="fixed inset-x-0 mx-auto w-full max-w-md z-[60] bottom-0 lg:max-w-none"
        style={{
          ...(computedBarStyle ?? null),
        }}
      >
        <div className="pb-[calc(env(safe-area-inset-bottom,0px)+64px)] lg:pb-0">
                <div
                  className="px-4 bg-card rounded-2xl shadow-[0_-4px_25px_rgba(0,0,0,0.08)] border-t border-border"
            style={{ paddingTop: 12, paddingBottom: 12 }}
          >
            <div className="flex items-center" style={{ gap: 12 }}>
              <button
                type="button"
                onClick={toggleFavorite}
                className="grid h-12 w-12 place-items-center rounded-xl"
                style={{
                  backgroundColor: "#F3F4F6",
                }}
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
                disabled={!hasContact}
                className="h-12 flex-1 rounded-full text-[16px] font-semibold"
                style={{
                  backgroundColor: "var(--jobly-main, #245BEB)",
                  color: "#fff",
                  opacity: hasContact ? 1 : 0.5,
                }}
              >
                {t("apply")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
