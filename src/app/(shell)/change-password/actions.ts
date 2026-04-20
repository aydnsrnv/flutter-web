'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export async function changePassword(formData: FormData) {
  const currentPassword = String(formData.get('current_password') ?? '');
  const newPassword = String(formData.get('new_password') ?? '');
  const confirmPassword = String(formData.get('confirm_password') ?? '');

  if (!currentPassword) {
    redirect(`/change-password?error=${encodeURIComponent('enter_current_password')}`);
  }
  if (!newPassword) {
    redirect(`/change-password?error=${encodeURIComponent('enter_new_password')}`);
  }
  if (newPassword.length < 6) {
    redirect(`/change-password?error=${encodeURIComponent('password_min_length')}`);
  }
  if (!confirmPassword) {
    redirect(`/change-password?error=${encodeURIComponent('enter_confirm_password')}`);
  }
  if (newPassword !== confirmPassword) {
    redirect(`/change-password?error=${encodeURIComponent('passwords_do_not_match')}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email;
  if (!user?.id || !email) {
    redirect(`/login?error=${encodeURIComponent('profile_login_required')}`);
  }

  const { error: reauthErr } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (reauthErr) {
    redirect(`/change-password?error=${encodeURIComponent('change_password_failed')}`);
  }

  const { error: upErr } = await supabase.auth.updateUser({ password: newPassword });
  if (upErr) {
    redirect(`/change-password?error=${encodeURIComponent('change_password_error')}`);
  }

  redirect(`/home?success=${encodeURIComponent('password_changed_success')}`);
}
