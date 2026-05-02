import { Suspense } from "react";
import { AuthShellLayout } from "@/components/auth-shell-layout";
import { StatsPanel } from "@/components/stats-panel";
import { StatsPanelSkeleton } from "@/components/stats-panel-skeleton";

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthShellLayout
      aside={
        <Suspense fallback={<StatsPanelSkeleton />}>
          <StatsPanel />
        </Suspense>
      }
    >
      {children}
    </AuthShellLayout>
  );
}
