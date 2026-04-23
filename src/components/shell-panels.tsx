"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";

import { BottomNav } from "@/components/bottom-nav";
import { RouteKeyed } from "@/components/route-keyed";

export function ShellPanels({
  children,
  detail,
  showAside = true,
  showBottomNav = true,
}: {
  children: React.ReactNode;
  detail?: React.ReactNode;
  showAside?: boolean;
  showBottomNav?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const detailSegment = useSelectedLayoutSegment("detail");
  const hasDetail = !!detailSegment && detailSegment !== "__DEFAULT__";

  const interceptedPrefixes = [
    "/filters",
    "/filter-results",
    "/cv-filters",
    "/cv-filter-results",
    "/profile",
    "/category",
    "/change-password",
    "/company",
    "/create",
    "/favorites",
    "/job",
    "/jobs",
    "/latest",
    "/latest-cvs",
    "/my",
    "/notifications",
    "/payments-history",
    "/cv",
    "/cvs",
    "/wallet",
    "/wallet-transactions",
  ];

  const pathWantsDetail = interceptedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const shouldRenderDetailInCenter = pathWantsDetail && hasDetail;

  const mainContent = (() => {
    if (!mounted) return children ?? detail;
    const preferred = shouldRenderDetailInCenter ? detail : children;
    const fallback = shouldRenderDetailInCenter ? children : detail;
    return preferred ?? fallback;
  })();

  return (
    <>
      <main className="min-w-0" data-shell-center>
        <div className="flex min-h-[calc(100vh-3rem)] flex-col">
          <RouteKeyed className="min-h-0 flex-1 pb-24">
            <Suspense fallback={<div className="min-h-0 flex-1" />}>
              {mainContent}
            </Suspense>
          </RouteKeyed>
          {showBottomNav ? <BottomNav variant="desktop" /> : null}
        </div>
      </main>
      {showAside ? (
        <aside className="min-w-0 lg:pr-12">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto overscroll-contain">
            {null}
          </div>
        </aside>
      ) : null}
    </>
  );
}

function StatsPanelSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-pulse">
      <div className="px-4 pt-4 pb-2">
        <div className="h-5 w-24 rounded bg-muted" />
      </div>
      <div className="mx-4 mb-3 h-9 rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-muted"
            style={{ minHeight: 110 }}
          />
        ))}
      </div>
    </div>
  );
}
