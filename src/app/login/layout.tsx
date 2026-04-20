import { AuthShellLayout } from '@/components/auth-shell-layout';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <AuthShellLayout>{children}</AuthShellLayout>;
}
