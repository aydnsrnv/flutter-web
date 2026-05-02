"use client";

import { PopularCompanyCard, type PopularCompany } from "@/components/popular-company-card";
import { useResponsiveLimit } from "@/lib/use-responsive-limit";

export function PopularCompanyListGroup({
  companies,
  mobileLimit,
  desktopLimit,
}: {
  companies: PopularCompany[];
  mobileLimit?: number;
  desktopLimit?: number;
}) {
  const limit =
    mobileLimit !== undefined && desktopLimit !== undefined
      ? useResponsiveLimit(mobileLimit, desktopLimit)
      : undefined;

  const displayCompanies =
    limit !== undefined ? companies.slice(0, limit) : companies;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {displayCompanies.length > 0
        ? displayCompanies.map((c) => (
            <PopularCompanyCard key={c.id} company={c} />
          ))
        : Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[103px] w-[99px] shrink-0 rounded-[14px] border border-border bg-card"
            />
          ))}
    </div>
  );
}
