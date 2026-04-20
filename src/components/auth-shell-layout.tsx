import { DesktopLeftPanel } from '@/components/desktop-left-panel';
import { AppHeader } from '@/components/app-header';

export function AuthShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-4 lg:max-w-none lg:px-6 lg:pb-6">
        <div className="hidden lg:grid lg:grid-cols-[20%_50%_30%] lg:gap-6">
          <DesktopLeftPanel />
          <main className="min-w-0">
            <div className="min-h-[calc(100vh-3rem)]">
              <div className="mb-5"><AppHeader /></div>
              {children}
            </div>
          </main>
          <aside className="min-w-0" />
        </div>

        <div className="lg:hidden">
          <div className="mb-4"><AppHeader /></div>
          {children}
        </div>
      </div>
    </div>
  );
}
