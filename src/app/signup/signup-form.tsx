'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const mainColor = '#245BEB';

export function SignupForm({
  action,
  errorKey,
}: {
  action: (formData: FormData) => void | Promise<void>;
  errorKey?: string;
}) {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'candidate' | 'employer'>('candidate');

  const errorText = useMemo(() => {
    const k = (errorKey ?? '').trim();
    if (!k) return '';
    return t(k);
  }, [errorKey, t]);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xl font-semibold" style={{ color: mainColor }}>
        {t('signup_title')}
      </div>
      <div className="text-[14px] text-foreground/60">
        {t('signup_subtitle')}
      </div>

      {errorText ? (
        <div
          className="rounded-2xl border px-4 py-3 text-[14px]"
          style={{ color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.22)' }}
        >
          {errorText}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-4">
        <form action={action} className="grid gap-3">
          <input type="hidden" name="user_type" value={userType} />

          <div className="grid gap-2">
            <div className="text-[14px] font-semibold text-foreground/80">
              {t('user')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('candidate')}
                className={`h-12 rounded-2xl border text-[14px] font-semibold transition-colors ${
                  userType === 'candidate'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {t('user_type_candidate')}
              </button>
              <button
                type="button"
                onClick={() => setUserType('employer')}
                className={`h-12 rounded-2xl border text-[14px] font-semibold transition-colors ${
                  userType === 'employer'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {t('user_type_employer')}
              </button>
            </div>
          </div>

          <Input
            name="full_name"
            required
            placeholder={t('full_name')}
          />

          <Input
            name="email"
            type="email"
            required
            placeholder={t('email')}
          />

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder={t('password')}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-3 grid h-6 w-6 place-items-center text-foreground/60"
              aria-label={t('toggle_password_visibility')}
            >
              <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          </div>

          <div className="relative">
            <Input
              name="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              placeholder={t('confirm_password')}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-3 grid h-6 w-6 place-items-center text-foreground/60"
              aria-label={t('toggle_confirm_password_visibility')}
            >
              <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          </div>

          <Button
            type="submit"
            className="mt-1 h-12 w-full rounded-2xl text-[16px] font-bold shadow-lg shadow-primary/20"
          >
            {t('signup_button')}
          </Button>

          <div className="mt-2 text-center text-[14px] text-foreground/60">
            <Link href="/login" className="font-semibold" style={{ color: mainColor }}>
              {t('login')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
