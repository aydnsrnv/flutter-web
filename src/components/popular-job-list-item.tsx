import Link from 'next/link';

export type PopularJobListItemData = {
  id: string;
  job_number?: number | string | null;
  title: string;
  company_name: string;
  company_logo: string;
};

function LogoSquare({ src, alt }: { src: string; alt: string }) {
  const size = 74 * 0.6;
  const radius = 12 * 0.7;

  if (!src) {
    return (
      <div
        className="grid place-items-center"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: 'rgba(0,0,0,0.04)',
        }}
      >
        <div className="text-[18px] font-bold" style={{ color: 'rgba(0,0,0,0.65)' }}>
          {(alt?.trim()?.[0] ?? '?').toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden"
      style={{ width: size, height: size, borderRadius: radius, backgroundColor: '#F6F6F6' }}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

export function PopularJobListItem({
  job,
}: {
  job: PopularJobListItemData;
}) {
  const href = job.job_number != null ? `/job/${job.job_number}` : `/jobs/${job.id}`;
  return (
    <Link href={href} className="block w-full">
      <div className="px-[10px] py-2">
        <div className="flex items-center gap-3">
          <LogoSquare src={job.company_logo} alt={job.company_name} />

          <div className="min-w-0 flex-1" style={{ height: 74 * 0.6 }}>
            <div
              className="truncate text-[18px] font-medium text-foreground"
              style={{ lineHeight: 1.15 }}
            >
              {job.title}
            </div>
            <div className="mt-1 truncate text-[14px]" style={{ lineHeight: 1.15, color: '#9CA3AF' }}>
              {job.company_name}
            </div>
          </div>

          <i className="ri-arrow-right-s-line text-[22px]" style={{ color: '#9CA3AF' }} />
        </div>
      </div>
    </Link>
  );
}
