import Link from 'next/link';

import { cn, slugify } from '@/lib/utils';

export type PopularCompany = {
  id: string;
  slug?: string | null;
  company_name: string;
  company_logo: string;
  job_count: number;
};

export function PopularCompanyCard({
  company,
  className,
}: {
  company: PopularCompany;
  className?: string;
}) {
  const name = (company.company_name ?? '').trim();
  const rawSlug = (company.slug ?? '').trim();
  const companyKey = slugify(name) || slugify(rawSlug) || company.id;

  return (
    <Link href={`/company/${encodeURIComponent(companyKey)}`} className="block">
      <div
        className={cn(
          'relative shrink-0 overflow-hidden border border-border/60 bg-primary/[0.05]',
          'h-[103px] w-[99px] rounded-xl',
          'cursor-pointer select-none',
          className,
        )}
      >
        {company.company_logo ? (
          <img
            src={company.company_logo}
            alt={company.company_name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-primary/55" />

        <div className="absolute left-[7px] top-[7px] grid h-[29px] w-[29px] place-items-center overflow-hidden rounded-full bg-white/92 border border-border/60">
          {company.company_logo ? (
            <img
              src={company.company_logo}
              alt={company.company_name}
              className="h-full w-full object-cover scale-[1.18]"
              loading="lazy"
            />
          ) : (
            <div className="text-sm font-bold text-foreground/87">
              {(company.company_name?.trim()?.[0] ?? '?').toUpperCase()}
            </div>
          )}
        </div>

        <div className="absolute bottom-[7px] left-[7px] right-[7px]">
          <div className="text-xs font-medium text-white/90">
            {company.job_count} job
          </div>
        </div>
      </div>
    </Link>
  );
}
