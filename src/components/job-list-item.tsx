'use client';

import { ArrowRight3, Location, Bookmark } from 'iconsax-react';
import { useI18n } from '@/lib/i18n/client';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { cn } from '@/lib/utils';

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
      <div className="grid h-11 w-11 place-items-center rounded-full bg-muted">
        <div className="text-base font-bold text-foreground/65">
          {(alt?.trim()?.[0] ?? '?').toUpperCase()}
        </div>
      </div>
    );
  }
  return (
    <div className="h-11 w-11 overflow-hidden rounded-full">
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
  const cityLabel = job.city ? t(job.city) : '';

  return (
    <div
      className={cn(
        "rounded-lg",
        premium ? "border-[2.5px] border-primary" : "border border-transparent"
      )}
    >
      <div className="py-3">
        <div className="flex items-start gap-3">
          <Logo src={job.company_logo} alt={job.company_name} />

          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-medium text-foreground leading-tight">
              {job.title}
            </div>
            <div className="mt-1 truncate text-sm leading-tight text-muted-foreground">
              {job.company_name}
            </div>
            {premium ? (
              <div className="mt-1 flex items-center gap-1">
                <Location size={15} variant="Linear" color="currentColor" className="text-muted-foreground" />
                <div className="truncate text-sm text-muted-foreground">
                  {cityLabel}
                </div>
              </div>
            ) : null}
          </div>

          {premium ? (
            <div className="flex flex-col items-end gap-2">
              <PremiumBadge />
              <Bookmark size={18} variant="Linear" color="currentColor" className="text-primary" />
            </div>
          ) : (
            <ArrowRight3 size={20} variant="Linear" color="currentColor" className="text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}
