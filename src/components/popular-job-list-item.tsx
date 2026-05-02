import Link from 'next/link';

export type PopularJobListItemData = {
  id: string;
  job_number?: number | string | null;
  title: string;
  company_name: string;
  company_logo: string;
};

function LogoSquare({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="grid h-[44px] w-[44px] place-items-center rounded-lg bg-muted">
        <div className="text-lg font-bold text-foreground/65">
          {(alt?.trim()?.[0] ?? '?').toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[44px] w-[44px] overflow-hidden rounded-lg bg-background">
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
      <div className="py-2">
        <div className="flex items-center gap-3">
          <LogoSquare src={job.company_logo} alt={job.company_name} />

          <div className="min-w-0 flex-1 h-[44px]">
            <div className="truncate text-lg font-medium text-foreground leading-tight">
              {job.title}
            </div>
            <div className="mt-1 truncate text-sm leading-tight text-muted-foreground">
              {job.company_name}
            </div>
          </div>

          <i className="ri-arrow-right-s-line text-xl text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}
