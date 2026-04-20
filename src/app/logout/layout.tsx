import { RightPanelLayout } from '@/components/right-panel-layout';

export default function LogoutLayout({ children }: { children: React.ReactNode }) {
  return <RightPanelLayout>{children}</RightPanelLayout>;
}
