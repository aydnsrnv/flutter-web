'use client';

import { useJobWizard } from '@/components/job-wizard/job-wizard-context';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/lib/i18n/client';

function stripEmojis(input: string) {
  try {
    return input.replace(/\p{Extended_Pictographic}/gu, '').replace(/[\uFE0F\u200D]/g, '');
  } catch {
    return input.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
  }
}

export function StepJobInfo() {
  const { t } = useI18n();
  const { data, updateData, isEditMode } = useJobWizard();

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid gap-3">
        <Input
          value={data.title}
          onChange={(e) => updateData({ title: stripEmojis(e.target.value) })}
          placeholder={t('enter_title')}
          disabled={isEditMode}
        />
        <Textarea
          value={data.request}
          onChange={(e) => updateData({ request: stripEmojis(e.target.value) })}
          placeholder={t('enter_request')}
          className="min-h-[120px] rounded-2xl"
        />
        <Textarea
          value={data.about}
          onChange={(e) => updateData({ about: stripEmojis(e.target.value) })}
          placeholder={t('enter_about')}
          className="min-h-[120px] rounded-2xl"
        />
      </div>
    </div>
  );
}
