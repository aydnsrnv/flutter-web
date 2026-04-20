import { PopularJobListItem, type PopularJobListItemData } from '@/components/popular-job-list-item';

export function PopularJobListGroup({
  jobs,
}: {
  jobs: PopularJobListItemData[];
}) {
  const dividerColor = 'rgba(0,0,0,0.06)';

  return (
    <div className="overflow-hidden rounded-[8px]" style={{ backgroundColor: 'transparent' }}>
      {jobs.map((j, i) => (
        <div key={j.id}>
          <PopularJobListItem job={j} />
          {i < jobs.length - 1 ? (
            <div className="px-[10px]">
              <div className="h-px" style={{ backgroundColor: dividerColor, opacity: 0.8 }} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
