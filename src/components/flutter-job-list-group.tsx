"use client";

import { FlutterJobItem, type FlutterJobItemData } from "@/components/flutter-job-item";
import { useResponsiveLimit } from "@/lib/use-responsive-limit";

export function FlutterJobListGroup({
  jobs,
  premium,
  mobileLimit,
  desktopLimit,
}: {
  jobs: FlutterJobItemData[];
  premium?: boolean;
  mobileLimit?: number;
  desktopLimit?: number;
}) {
  const limit =
    mobileLimit !== undefined && desktopLimit !== undefined
      ? useResponsiveLimit(mobileLimit, desktopLimit)
      : undefined;

  const displayJobs = limit !== undefined ? jobs.slice(0, limit) : jobs;

  const dividerColor = "rgba(0,0,0,0.06)";

  return (
    <div>
      {displayJobs.map((j, i) => {
        const isFirst = i === 0;
        const isLast = i === displayJobs.length - 1;

        return (
          <div key={j.id}>
            <div
              className="bg-background"
              style={{
                borderTopLeftRadius: isFirst ? 8 : 0,
                borderTopRightRadius: isFirst ? 8 : 0,
                borderBottomLeftRadius: isLast ? 8 : 0,
                borderBottomRightRadius: isLast ? 8 : 0,
                overflow: "hidden",
              }}
            >
              <FlutterJobItem job={j} premium={premium} />
            </div>
            {!isLast ? (
              <div>
                <div
                  className="h-px"
                  style={{ backgroundColor: dividerColor, opacity: 0.8 }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
