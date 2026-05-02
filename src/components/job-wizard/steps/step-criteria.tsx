'use client';

import { useMemo } from 'react';
import { useJobWizard } from '@/components/job-wizard/job-wizard-context';
import { SingleSelectDropdown } from '@/components/single-select-dropdown';
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

export function StepCriteria() {
  const { t } = useI18n();
  const { data, updateData } = useJobWizard();

  const genderKeys = useMemo(() => ['male', 'female', 'all_genders'], []);
  const educationKeys = useMemo(() => ['education_higher', 'education_incomplete_higher', 'education_secondary_special'], []);
  const experienceKeys = useMemo(() => ['exp_none', 'exp_less_than_one', 'exp_one_to_three', 'exp_three_to_five', 'exp_more_than_five'], []);
  const jobTypeKeys = useMemo(() => ['job_type_full_time', 'job_type_part_time', 'job_type_intern'], []);

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            value={data.minAge}
            onChange={(e) => updateData({ minAge: sanitizeNumber(e.target.value) })}
            placeholder={t('min_age')}
            inputMode="numeric"
          />
          <Input
            value={data.maxAge}
            onChange={(e) => updateData({ maxAge: sanitizeNumber(e.target.value) })}
            placeholder={t('max_age')}
            inputMode="numeric"
          />
        </div>

        <SingleSelectDropdown
          value={data.genderKey}
          onChange={(v) => updateData({ genderKey: v })}
          placeholder={t('gender')}
          options={genderKeys.map((k) => ({ value: k, label: t(k) }))}
        />

        <SingleSelectDropdown
          value={data.educationKey}
          onChange={(v) => updateData({ educationKey: v })}
          placeholder={t('select_education')}
          options={educationKeys.map((k) => ({ value: k, label: t(k) }))}
        />

        <SingleSelectDropdown
          value={data.experienceKey}
          onChange={(v) => updateData({ experienceKey: v })}
          placeholder={t('select_experience')}
          options={experienceKeys.map((k) => ({ value: k, label: t(k) }))}
        />

        <SingleSelectDropdown
          value={data.jobTypeKey}
          onChange={(v) => updateData({ jobTypeKey: v })}
          placeholder={t('select_job_type')}
          options={jobTypeKeys.map((k) => ({ value: k, label: t(k) }))}
        />
      </div>
    </div>
  );
}
