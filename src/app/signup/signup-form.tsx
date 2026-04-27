'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { User, Lock, Briefcase, Sms } from 'iconsax-react';

import { useI18n } from '@/lib/i18n/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import signupImg from '../signup.jpeg';
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
      <img src={signupImg.src} alt="signup" className="mx-auto w-[269px] h-[269px] object-contain rounded-xl" />
      <div className="text-xl font-semibold text-black dark:text-white text-center">
        {t('signup_title')}
      </div>
      <div className="text-[14px] text-black/80 dark:text-white/80 text-center">
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
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('candidate')}
                className={`h-12 rounded-2xl border text-[14px] font-semibold transition-colors flex items-center justify-center ${
                  userType === 'candidate'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                <User size={18} variant="Linear" color="currentColor" className="mr-2" />
                <span>{t('user_type_candidate')}</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('employer')}
                className={`h-12 rounded-2xl border text-[14px] font-semibold transition-colors flex items-center justify-center ${
                  userType === 'employer'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground'
                }`}
              >
                <Briefcase size={18} variant="Linear" color="currentColor" className="mr-2" />
                <span>{t('user_type_employer')}</span>
              </button>
            </div>
          </div>

          <div className="relative text-black dark:text-white">
            <User
              size={18}
              variant="Linear"
              color={mainColor}
              className="absolute left-4 top-3 z-10"
            />
            <Input
              name="full_name"
              required
              placeholder={t('full_name')}
              className="pl-11 text-black dark:text-white"
            />
          </div>

          <div className="relative text-black dark:text-white">
            <Sms
              size={18}
              variant="Linear"
              color={mainColor}
              className="absolute left-4 top-3 z-10"
            />
            <Input
              name="email"
              type="email"
              required
              placeholder={t('email')}
              className="pl-11 text-black dark:text-white"
            />
          </div>

          <div className="relative text-black dark:text-white">
            <Lock
              size={18}
              variant="Linear"
              color={mainColor}
              className="absolute left-4 top-3 z-10"
            />
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder={t('password')}
              className="pr-12 pl-11 text-black dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-3 grid h-6 w-6 place-items-center text-gray-600 dark:text-gray-300"
              aria-label={t('toggle_password_visibility')}
            >
              <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
            </button>
          </div>

          <div className="relative text-black dark:text-white">
            <Lock
              size={18}
              variant="Linear"
              color={mainColor}
              className="absolute left-4 top-3 z-10"
            />
            <Input
              name="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              placeholder={t('confirm_password')}
              className="pr-12 pl-11 text-black dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-3 grid h-6 w-6 place-items-center text-gray-600 dark:text-gray-300"
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

          <div className="mt-2 text-center text-[14px] text-black/70 dark:text-white/70">
            <Link href="/login" className="font-semibold text-black dark:text-white">
              {t('login')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
