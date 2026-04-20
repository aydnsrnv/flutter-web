import { login } from './actions';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/home');
  }

  const error = searchParams?.error;
  const success = searchParams?.success;
  return (
    <LoginForm action={login} error={error} successKey={success} />
  );
}
