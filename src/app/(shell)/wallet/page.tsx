'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { Input } from '@/components/ui/input';

const mainColor = '#245BEB';

export default function WalletTopUpPage() {
  const { t } = useI18n();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const numericAmount = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);

  const submit = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError(null);

    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(t('wallet_enter_valid_amount_alt'));
      inFlightRef.current = false;
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/epoint/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numericAmount }),
      });

      const json = (await res.json()) as any;
      if (!res.ok) {
        const msg = json?.message ?? json?.error ?? res.statusText;
        throw new Error(msg);
      }

      const url = String(json?.redirectUrl ?? '').trim();
      if (!url) throw new Error(t('initiate_payment_failed').replace('{message}', 'redirectUrl missing'));

      window.location.href = url;
    } catch (e: any) {
      setError(t('initiate_payment_error').replace('{error}', e?.message ?? String(e)));
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [amount, numericAmount, t]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('payment_view_title')}</h1>
      </header>

      {error ? (
        <div className="rounded-2xl border border-border px-4 py-3 text-[14px]" style={{ color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.06)' }}>
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-[14px] text-muted-foreground">
          {t('add_balance_message')}
        </div>

        <div className="mt-4">
          <div className="text-[13px] font-semibold text-muted-foreground">
            {t('wallet_amount')}
          </div>
          <div className="mt-2">
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder={t('payment_amount_hint')}
            />
          </div>

          <div className="mt-2 text-[13px] font-semibold" style={{ color: 'rgb(21, 128, 61)' }}>
            {t('payment_no_commission')}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={loading}
          className="mt-5 h-12 w-full rounded-2xl text-[15px] font-semibold"
          style={{ backgroundColor: mainColor, color: '#fff', opacity: loading ? 0.75 : 1 }}
        >
          {t('payment_top_up_button')}
        </button>
      </div>
    </div>
  );
}
