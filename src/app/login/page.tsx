import { login } from './actions';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?:
    | Promise<{ error?: string; success?: string }>
    | { error?: string; success?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/home');
  }

  const sp = await Promise.resolve(searchParams ?? {});
  const error = sp?.error;
  const success = sp?.success;
  return (
    <LoginForm action={login} error={error} successKey={success} />
  );
}
