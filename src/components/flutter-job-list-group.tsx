import { FlutterJobItem, type FlutterJobItemData } from '@/components/flutter-job-item';

export function FlutterJobListGroup({
  jobs,
  premium,
}: {
  jobs: FlutterJobItemData[];
  premium?: boolean;
}) {
  const dividerColor = 'rgba(0,0,0,0.06)';

  return (
    <div>
      {jobs.map((j, i) => {
        const isFirst = i === 0;
        const isLast = i === jobs.length - 1;

        return (
          <div key={j.id}>
            <div
              className="bg-background"
              style={{
                borderTopLeftRadius: isFirst ? 8 : 0,
                borderTopRightRadius: isFirst ? 8 : 0,
                borderBottomLeftRadius: isLast ? 8 : 0,
                borderBottomRightRadius: isLast ? 8 : 0,
                overflow: 'hidden',
              }}
            >
              <FlutterJobItem job={j} premium={premium} />
            </div>
            {!isLast ? (
              <div>
                <div className="h-px" style={{ backgroundColor: dividerColor, opacity: 0.8 }} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
