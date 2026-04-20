import { AuthShellLayout } from '@/components/auth-shell-layout';

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <AuthShellLayout>{children}</AuthShellLayout>;
}
