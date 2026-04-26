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
  const dividerColor = 'rgba(0,0,0,0.06)';
  const bgColor = 'rgba(36, 91, 235, 0.05)';
  const name = (company.company_name ?? '').trim();
  const rawSlug = (company.slug ?? '').trim();
  const companyKey = slugify(name) || slugify(rawSlug) || company.id;

  return (
    <Link href={`/company/${encodeURIComponent(companyKey)}`} className="block">
      <div
        className={cn(
          'relative shrink-0 overflow-hidden border bg-card',
          'h-[103px] w-[99px] rounded-[14px]',
          'cursor-pointer select-none',
          className,
        )}
        style={{ borderColor: dividerColor, backgroundColor: bgColor }}
      >
        {company.company_logo ? (
          <img
            src={company.company_logo}
            alt={company.company_name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(36,91,235,0.03), rgba(36,91,235,0.55))',
          }}
        />

        <div
          className="absolute left-[7px] top-[7px] grid place-items-center overflow-hidden rounded-full"
          style={{
            width: 29,
            height: 29,
            backgroundColor: 'rgba(255,255,255,0.92)',
            border: `0.8px solid ${dividerColor}`,
          }}
        >
          {company.company_logo ? (
            <img
              src={company.company_logo}
              alt={company.company_name}
              className="h-full w-full object-cover"
              loading="lazy"
              style={{ transform: 'scale(1.18)' }}
            />
          ) : (
            <div
              className="text-[14px] font-bold"
              style={{ color: 'rgba(0,0,0,0.87)' }}
            >
              {(company.company_name?.trim()?.[0] ?? '?').toUpperCase()}
            </div>
          )}
        </div>

        <div className="absolute bottom-[7px] left-[7px] right-[7px]">
          <div
            className="text-[11px] font-medium"
            style={{ color: 'rgba(255,255,255,0.90)' }}
          >
            {company.job_count} job
          </div>
        </div>
      </div>
    </Link>
  );
}
