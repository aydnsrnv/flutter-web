"use client";

import { ResumeListItem, type ResumeListItemData } from "@/components/resume-list-item";
import { useResponsiveLimit } from "@/lib/use-responsive-limit";

export function ResumeListGroup({
  resumes,
  mobileLimit,
  desktopLimit,
}: {
  resumes: ResumeListItemData[];
  mobileLimit?: number;
  desktopLimit?: number;
}) {
  const limit =
    mobileLimit !== undefined && desktopLimit !== undefined
      ? useResponsiveLimit(mobileLimit, desktopLimit)
      : undefined;

  const displayResumes = limit !== undefined ? resumes.slice(0, limit) : resumes;

  return (
    <div className="mt-3">
      {displayResumes.map((r, idx) => {
        const isLast = idx === displayResumes.length - 1;
        return (
          <div key={String(r.id)}>
            <ResumeListItem resume={r} />
            {!isLast ? <div className="h-px bg-border/60" /> : null}
          </div>
        );
      })}
    </div>
  );
}
