"use client";

import { useEffect, useState } from "react";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";

import { BottomNav } from "@/components/bottom-nav";
import { DesktopLeftPanel } from "@/components/desktop-left-panel";
import { AppHeader } from "@/components/app-header";
import { DesktopTopNav } from "@/components/desktop-top-nav";
import { MobileMenuDrawer } from "@/components/mobile-menu-drawer";

const NAVBAR_PATHS = ["/home", "/candidates", "/companies", "/categories"];

export function ShellLayoutClient({
  children,
  detail,
  aside,
}: {
  children: React.ReactNode;
  detail: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const detailSegment = useSelectedLayoutSegment("detail");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isNavbarPage = NAVBAR_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const isDetailPage = /^\/(job|cv|company)\/[^/]+$/.test(pathname);
  const isGradientHeaderPage = /^\/(job|cv)\/[^/]+$/.test(pathname);

  // If detailSegment exists and is not the default fallback, we have an active detail view.
  // Next.js returns `__DEFAULT__` for default.tsx, or null if no segment.
  const hasActiveDetail = !!detailSegment && detailSegment !== "__DEFAULT__";

  const mainContent = !mounted
    ? children
    : isNavbarPage
      ? children
      : hasActiveDetail
        ? detail
        : children;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className={`mx-auto w-full pb-20 pt-4 lg:max-w-none lg:px-0 lg:pb-6 ${isDetailPage ? 'max-w-none' : 'max-w-md'} ${isGradientHeaderPage ? 'px-0' : 'px-4'}`}>
        <div className="hidden lg:grid lg:grid-cols-[1fr] lg:gap-6">
          <main className="min-w-0">
            <DesktopTopNav aside={aside} />
            <div className={`min-h-[calc(100vh-3rem)] px-4 pt-8 pb-12 lg:px-24`}>
              {mainContent}
            </div>
          </main>
        </div>

        <div className="lg:hidden">
          <div className={`mb-4 ${isGradientHeaderPage ? 'px-4' : ''}`}>
            <AppHeader aside={aside} />
          </div>
          {mainContent}
        </div>
      </div>

      <div className="lg:hidden">
        <MobileMenuDrawer
          leftPanel={<DesktopLeftPanel />}
          rightPanel={aside}
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          showTrigger={false}
        />
        <BottomNav onMenuOpen={() => setMobileMenuOpen(true)} />
      </div>
    </div>
  );
}
