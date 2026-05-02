"use client";

import { PopularJobListItem, type PopularJobListItemData } from "@/components/popular-job-list-item";
import { useResponsiveLimit } from "@/lib/use-responsive-limit";

export function PopularJobListGroup({
  jobs,
  mobileLimit,
  desktopLimit,
}: {
  jobs: PopularJobListItemData[];
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
    <div
      className="overflow-hidden rounded-[8px]"
      style={{ backgroundColor: "transparent" }}
    >
      {displayJobs.map((j, i) => (
        <div key={j.id}>
          <PopularJobListItem job={j} />
          {i < displayJobs.length - 1 ? (
            <div>
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
