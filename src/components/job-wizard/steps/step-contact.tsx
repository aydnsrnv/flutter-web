'use client';

import { Call, Sms } from 'iconsax-react';
import { useJobWizard } from '@/components/job-wizard/job-wizard-context';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n/client';

const mainColor = 'var(--jobly-main)';

function stripEmojis(input: string) {
  try {
    return input.replace(/\p{Extended_Pictographic}/gu, '').replace(/[\uFE0F\u200D]/g, '');
  } catch {
    return input.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
  }
}

export function StepContact() {
  const { t } = useI18n();
  const { data, updateData } = useJobWizard();

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid gap-3">
        <div className="relative">
          <Sms size={18} variant="Linear" className="absolute left-4 top-1/2 -translate-y-1/2 z-10" color={mainColor} />
          <Input
            value={data.mail}
            onChange={(e) => updateData({ mail: stripEmojis(e.target.value) })}
            placeholder={t('email')}
            className="pl-11 pr-4"
          />
        </div>
        <div className="relative">
          <Call size={18} variant="Linear" className="absolute left-4 top-1/2 -translate-y-1/2 z-10" color={mainColor} />
          <Input
            value={data.number}
            onChange={(e) => {
              let raw = e.target.value.replace(/\D/g, '');
              if (!raw.startsWith('0')) raw = '0' + raw;
              if (raw.length > 10) raw = raw.slice(0, 10);
              updateData({ number: raw });
            }}
            placeholder={t('phone')}
            className="pl-11 pr-4"
            maxLength={10}
            inputMode="numeric"
          />
        </div>
        <Input
          value={data.applyLink}
          onChange={(e) => updateData({ applyLink: stripEmojis(e.target.value) })}
          placeholder={t('apply_link')}
        />
      </div>
    </div>
  );
}
