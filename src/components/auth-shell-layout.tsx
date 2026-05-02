import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopTopNav } from "@/components/desktop-top-nav";

export function AuthShellLayout({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-4 lg:max-w-none lg:px-8 lg:pb-6">
        <div className="hidden lg:grid lg:grid-cols-[1fr] lg:gap-6">
          <main className="min-w-0">
            <DesktopTopNav aside={aside} />
            <div className="flex min-h-[calc(100vh-3rem)] items-start justify-center px-4 pb-12 pt-8">
              <div className="w-full max-w-md">{children}</div>
            </div>
          </main>
        </div>

        <div className="lg:hidden">
          <div className="mb-4">
            <AppHeader />
          </div>
          {children}
        </div>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
