import { RightPanelLayout } from '@/components/right-panel-layout';

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return <RightPanelLayout>{children}</RightPanelLayout>;
}
