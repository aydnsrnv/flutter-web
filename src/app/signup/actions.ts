'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signup(formData: FormData) {
  const fullName = String(formData.get('full_name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirm_password') ?? '');
  const rawUserType = String(formData.get('user_type') ?? '').trim().toLowerCase();
  const userType = rawUserType === 'employer' || rawUserType === 'candidate' ? rawUserType : 'candidate';

  if (!fullName) {
    redirect(`/signup?error=${encodeURIComponent('signup_full_name_required')}`);
  }
  if (!email) {
    redirect(`/signup?error=${encodeURIComponent('signup_email_required')}`);
  }
  if (!password) {
    redirect(`/signup?error=${encodeURIComponent('signup_password_required')}`);
  }
  if (password.length < 6) {
    redirect(`/signup?error=${encodeURIComponent('signup_password_min_length')}`);
  }
  if (!confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent('signup_confirm_password_required')}`);
  }
  if (password !== confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent('signup_passwords_do_not_match')}`);
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_type: userType,
      },
    },
  });

  if (error) {
    const code = (error as any)?.code as string | undefined;

    if (code === 'user_already_exists') {
      redirect(`/signup?error=${encodeURIComponent('signup_email_in_use')}`);
    }
    if (code === 'weak_password') {
      redirect(`/signup?error=${encodeURIComponent('signup_weak_password')}`);
    }
    if (code === 'email_address_invalid') {
      redirect(`/signup?error=${encodeURIComponent('signup_invalid_email_format')}`);
    }
    if (code === 'signup_disabled' || code === 'operation_not_allowed') {
      redirect(`/signup?error=${encodeURIComponent('signup_operation_not_allowed')}`);
    }

    redirect(`/signup?error=${encodeURIComponent('signup_general_error')}`);
  }

  // Note: User record in 'users' table is created by Supabase trigger
  // when auth user is confirmed. Do not insert here as email is not yet confirmed.

  redirect('/login?success=signup_succes_email_required');
}
