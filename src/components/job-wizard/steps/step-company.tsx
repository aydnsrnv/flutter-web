'use client';

import { useJobWizard } from '@/components/job-wizard/job-wizard-context';
import { SingleSelectDropdown } from '@/components/single-select-dropdown';
import { useI18n } from '@/lib/i18n/client';

export function StepCompany() {
  const { t } = useI18n();
  const { data, setDataField, companies } = useJobWizard();

  const companyOptions = companies.map((c) => ({
    value: String(c.id),
    label: c.company_name,
    image: c.company_logo ?? null,
  }));

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid gap-3">
        <SingleSelectDropdown
          value={data.companyId}
          onChange={(v) => setDataField('companyId', v)}
          placeholder={t('select_company')}
          searchPlaceholder={t('search_title')}
          options={companyOptions}
        />
      </div>
    </div>
  );
}
