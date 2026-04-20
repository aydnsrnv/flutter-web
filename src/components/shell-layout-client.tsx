'use client';

import { usePathname, useSelectedLayoutSegment } from 'next/navigation';

import { BottomNav } from '@/components/bottom-nav';
import { DesktopLeftPanel } from '@/components/desktop-left-panel';
import { AppHeader } from '@/components/app-header';

const NAVBAR_PATHS = ['/home', '/candidates', '/companies', '/categories'];

export function ShellLayoutClient({
  children,
  detail,
  aside,
}: {
  children: React.ReactNode;
  detail: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const pathname = usePathname() ?? '';
  const detailSegment = useSelectedLayoutSegment('detail');
  
  const isNavbarPage = NAVBAR_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
  
  // If detailSegment exists and is not the default fallback, we have an active detail view.
  // Next.js returns `__DEFAULT__` for default.tsx, or null if no segment.
  const hasActiveDetail = !!detailSegment && detailSegment !== '__DEFAULT__';
  
  const mainContent = isNavbarPage ? children : (hasActiveDetail ? detail : children);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md px-4 pb-20 pt-4 lg:max-w-none lg:px-6 lg:pb-6">
        <div className="hidden lg:grid lg:grid-cols-[20%_50%_30%] lg:gap-6">
          <DesktopLeftPanel />
          <main className="min-w-0">
            <div className="min-h-[calc(100vh-3rem)] pb-24">
              <div className="mb-5"><AppHeader /></div>
              {mainContent}
            </div>
            <BottomNav variant="desktop" />
          </main>
          <aside className="min-w-0 lg:pr-12">
            <div className="sticky top-6 flex min-h-[calc(100vh-3rem)] flex-col justify-end pb-6">
              {aside}
            </div>
          </aside>
        </div>

        <div className="lg:hidden">
          <div className="mb-4"><AppHeader aside={aside} /></div>
          {mainContent}
        </div>
      </div>
    </div>
  );
}
