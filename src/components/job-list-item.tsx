'use client';

import { ArrowRight3, Location, Bookmark } from 'iconsax-react';
import { useI18n } from '@/lib/i18n/client';

export type JobListItemData = {
  id: string;
  title: string;
  company_name: string;
  company_logo: string;
  city: string;
  view_count?: number;
};

function Logo({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div
        className="grid place-items-center rounded-full"
        style={{ width: 44, height: 44, backgroundColor: 'rgba(0,0,0,0.04)' }}
      >
        <div className="text-[16px] font-bold" style={{ color: 'rgba(0,0,0,0.65)' }}>
          {(alt?.trim()?.[0] ?? '?').toUpperCase()}
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-full" style={{ width: 44, height: 44 }}>
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

export function JobListItem({
  job,
  premium,
}: {
  job: JobListItemData;
  premium?: boolean;
}) {
  const { t } = useI18n();
  const borderColor = premium ? '#245BEB' : 'transparent';
  const borderWidth = premium ? 2.5 : 0;
  const cityLabel = job.city ? t(job.city) : '';
  const premiumLabel = (t('premium_tag') || 'PREMIUM').toUpperCase();

  return (
    <div
      className="rounded-[8px] bg-white"
      style={{
        border: borderWidth ? `${borderWidth}px solid ${borderColor}` : undefined,
      }}
    >
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          <Logo src={job.company_logo} alt={job.company_name} />

          <div className="min-w-0 flex-1">
            <div
              className="truncate text-[18px] font-medium text-foreground"
              style={{ lineHeight: 1.15 }}
            >
              {job.title}
            </div>
            <div
              className="mt-1 truncate text-[14px]"
              style={{ lineHeight: 1.15, color: '#9CA3AF' }}
            >
              {job.company_name}
            </div>
            {premium ? (
              <div className="mt-1 flex items-center gap-1">
                <Location size={15} variant="Linear" color="#9CA3AF" />
                <div
                  className="truncate text-[13px]"
                  style={{ color: '#9CA3AF' }}
                >
                  {cityLabel}
                </div>
              </div>
            ) : null}
          </div>

          {premium ? (
            <div className="flex flex-col items-end gap-2">
              <div
                className="flex items-center gap-1 rounded-full px-2 py-1"
                style={{
                  background:
                    'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
                }}
              >
                <div
                  className="text-[8px] font-bold"
                  style={{ color: '#000', letterSpacing: 0.6 }}
                >
                  {premiumLabel}
                </div>
                <i className="ri-vip-crown-fill text-[10px] text-white" />
              </div>
              <Bookmark size={18} variant="Linear" color="#245BEB" />
            </div>
          ) : (
            <ArrowRight3 size={20} variant="Linear" color="#9CA3AF" />
          )}
        </div>
      </div>
    </div>
  );
}
