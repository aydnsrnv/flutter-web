'use client';

import { useMemo } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const mainColor = '#245BEB';

export function ResetPasswordForm({
  action,
  errorKey,
  successKey,
}: {
  action: (formData: FormData) => void | Promise<void>;
  errorKey?: string;
  successKey?: string;
}) {
  const { t } = useI18n();

  const errorText = useMemo(() => {
    const k = (errorKey ?? '').trim();
    if (!k) return '';
    return t(k);
  }, [errorKey, t]);

  const successText = useMemo(() => {
    const k = (successKey ?? '').trim();
    if (!k) return '';
    return t(k);
  }, [successKey, t]);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xl font-semibold" style={{ color: mainColor }}>
        {t('verify_code_title')}
      </div>
      <div className="text-[14px] text-foreground/60">
        {t('reset_password_code_sent')}
      </div>

      {errorText ? (
        <div
          className="rounded-2xl border px-4 py-3 text-[14px]"
          style={{ color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.22)' }}
        >
          {errorText}
        </div>
      ) : null}

      {successText ? (
        <div
          className="rounded-2xl border px-4 py-3 text-[14px]"
          style={{ color: '#16A34A', backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)' }}
        >
          {successText}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-4">
        <form action={action} className="grid gap-3">
          <Input
            name="code"
            required
            placeholder={t('reset_token_required')}
          />

          <Button
            type="submit"
            className="mt-1 h-12 w-full rounded-2xl text-[16px] font-bold shadow-lg shadow-primary/20"
          >
            {t('verify_code')}
          </Button>

          <div className="mt-2 text-center text-[14px] text-foreground/60">
            <a href="/login" className="font-semibold" style={{ color: mainColor }}>
              {t('login')}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
