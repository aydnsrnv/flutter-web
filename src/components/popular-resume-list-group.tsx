"use client";

import { ResumePopularItem, type ResumePopularItemData } from "@/components/resume-popular-item";
import { useResponsiveLimit } from "@/lib/use-responsive-limit";

export function PopularResumeListGroup({
  resumes,
  mobileLimit,
  desktopLimit,
}: {
  resumes: ResumePopularItemData[];
  mobileLimit?: number;
  desktopLimit?: number;
}) {
  const limit =
    mobileLimit !== undefined && desktopLimit !== undefined
      ? useResponsiveLimit(mobileLimit, desktopLimit)
      : undefined;

  const displayResumes = limit !== undefined ? resumes.slice(0, limit) : resumes;

  return (
    <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
      {displayResumes.map((r) => (
        <div key={String(r.id)} className="w-[150px] shrink-0">
          <ResumePopularItem resume={r} />
        </div>
      ))}
    </div>
  );
}
