'use client';

import { useMemo } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const mainColor = '#245BEB';

export function ForgotPasswordForm({
  action,
  errorKey,
}: {
  action: (formData: FormData) => void | Promise<void>;
  errorKey?: string;
}) {
  const { t } = useI18n();

  const errorText = useMemo(() => {
    const k = (errorKey ?? '').trim();
    if (!k) return '';
    return t(k);
  }, [errorKey, t]);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xl font-semibold" style={{ color: mainColor }}>
        {t('reset_title')}
      </div>
      <div className="text-[14px] text-muted-foreground">
        {t('reset_info')}
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
          <Input
            name="email"
            type="email"
            required
            placeholder={t('email')}
          />

          <Button
            type="submit"
            className="mt-1 h-12 w-full rounded-2xl text-[16px] font-bold shadow-lg shadow-primary/20"
          >
            {t('reset_send')}
          </Button>

          <div className="mt-2 text-center text-[14px] text-muted-foreground">
            <a href="/login" className="font-semibold" style={{ color: mainColor }}>
              {t('login')}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
