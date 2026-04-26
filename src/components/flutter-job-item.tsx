'use client';

import Link from 'next/link';
import { Calendar2, Location } from 'iconsax-react';
import { ManatIcon } from '@/components/ui/manat-icon';
import { useI18n } from '@/lib/i18n/client';

export type FlutterJobItemData = {
  id: string;
  job_number?: number | string | null;
  title: string;
  company_name: string;
  company_logo: string;
  city: string;
  create_time?: string;
  min_salary?: string | null;
  max_salary?: string | null;
};

function hasFullSalary(minSalary?: string | null, maxSalary?: string | null) {
  const nz = (s?: string | null) => {
    if (!s) return false;
    const t = String(s).trim();
    if (!t) return false;
    const v = Number(t);
    if (!Number.isNaN(v)) return v > 0;
    return t !== '0';
  };
  return nz(minSalary) && nz(maxSalary);
}

function LogoCircle({ src, alt }: { src: string; alt: string }) {
  const size = 44;

  if (!src) {
    return (
      <div
        className="grid place-items-center rounded-full"
        style={{ width: size, height: size, backgroundColor: 'rgba(0,0,0,0.04)' }}
      >
        <div className="text-[16px] font-bold text-foreground/80">
          {(alt?.trim()?.[0] ?? '?').toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-full" style={{ width: size, height: size }}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

function formatDateDayMonth(iso: string, t: (key: string) => string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
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

export function FlutterJobItem({
  job,
  premium,
}: {
  job: FlutterJobItemData;
  premium?: boolean;
}) {
  const { t } = useI18n();
  const showSalary = hasFullSalary(job.min_salary, job.max_salary);

  const manatSymbol = t('currency_azn_symbol');

  const href = job.job_number != null ? `/job/${job.job_number}` : `/jobs/${job.id}`;
  const cityLabel = job.city ? t(job.city) : '';

  return (
    <Link href={href} className="block py-3">
      <div className="flex items-start gap-3">
        <LogoCircle src={job.company_logo} alt={job.company_name} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div
              className="min-w-0 flex-1 truncate text-[18px] font-medium text-foreground"
              style={{ lineHeight: 1.15 }}
            >
              {job.title}
            </div>

            {premium ? (
              <div
                className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1"
                style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)' }}
              >
                <div
                  className="text-[8px] font-bold"
                  style={{ color: '#000', letterSpacing: 0.6 }}
                >
                  {t('premium_tag')}
                </div>
                <i className="ri-vip-crown-fill text-[10px] text-white" />
              </div>
            ) : (
              showSalary ? (
                <div className="shrink-0">
                  <div className="text-[14px] font-bold" style={{ color: 'var(--jobly-main, #245BEB)' }}>
                    <ManatIcon size={16} color="var(--jobly-main, #245BEB)" />
                  </div>
                </div>
              ) : null
            )}
          </div>

          <div className="mt-1 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-1">
              <Location size={15} variant="Linear" color="#9CA3AF" />
              <div className="truncate text-[13px]" style={{ color: '#9CA3AF' }}>
                {cityLabel}
              </div>
            </div>

            {premium ? (
              showSalary ? (
                <div className="shrink-0">
                  <div className="text-[14px] font-bold" style={{ color: 'var(--jobly-main, #245BEB)' }}>
                    <ManatIcon size={16} color="var(--jobly-main, #245BEB)" />
                  </div>
                </div>
              ) : null
            ) : (
              <div className="shrink-0 flex items-center gap-1">
                <Calendar2 size={14} variant="Linear" color="#9CA3AF" />
                <div className="text-[11.7px]" style={{ color: '#9CA3AF' }}>
                  {job.create_time ? formatDateDayMonth(job.create_time, t) : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
