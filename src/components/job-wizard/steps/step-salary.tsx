'use client';

import { useJobWizard } from '@/components/job-wizard/job-wizard-context';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n/client';

function stripEmojis(input: string) {
  try {
    return input.replace(/\p{Extended_Pictographic}/gu, '').replace(/[\uFE0F\u200D]/g, '');
  } catch {
    return input.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
  }
}

function sanitizeNumber(input: string) {
  return stripEmojis(input).replace(/-/g, '').replace(/[^0-9]/g, '');
}

export function StepSalary() {
  const { t } = useI18n();
  const { data, updateData } = useJobWizard();

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid grid-cols-2 gap-3">
        <Input
          value={data.minSalary}
          onChange={(e) => updateData({ minSalary: sanitizeNumber(e.target.value) })}
          placeholder={t('min_salary')}
          inputMode="numeric"
        />
        <Input
          value={data.maxSalary}
          onChange={(e) => updateData({ maxSalary: sanitizeNumber(e.target.value) })}
          placeholder={t('max_salary')}
          inputMode="numeric"
        />
      </div>
    </div>
  );
}
