import { cn } from '@/lib/utils';
import { JobListItem, type JobListItemData } from '@/components/job-list-item';

export function JobListGroup({
  jobs,
  premium,
  className,
}: {
  jobs: JobListItemData[];
  premium?: boolean;
  className?: string;
}) {
  const dividerColor = 'rgba(0,0,0,0.06)';

  return (
    <div
      className={cn('overflow-hidden rounded-[8px] border bg-white', className)}
      style={{ borderColor: dividerColor }}
    >
      {jobs.map((j, i) => (
        <div key={j.id}>
          <JobListItem job={j} premium={premium} />
          {i < jobs.length - 1 ? (
            <div className="px-[10px]">
              <div
                className="h-px"
                style={{ backgroundColor: dividerColor, opacity: 0.8 }}
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
