'use client';

import { useMemo } from 'react';
import { useCvWizard } from '@/components/cv-wizard/cv-wizard-context';
import { SingleSelectDropdown } from '@/components/single-select-dropdown';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n/client';

export function StepDemographics() {
  const { t } = useI18n();
  const { data, updateData } = useCvWizard();

  const cityKeys = useMemo(
    () => [
      'city_baku', 'city_absheron', 'city_ganja', 'city_sumgait', 'city_mingechevir',
      'city_khankendi', 'city_lenkeran', 'city_sheki', 'city_shirvan', 'city_nakhchivan',
      'city_quba', 'city_qusar', 'city_qabala', 'city_zaqatala', 'city_shamakhi',
      'city_tovuz', 'city_agdam', 'city_fuzuli', 'city_shamkir', 'city_barda',
      'city_masalli', 'city_salyan', 'city_astara', 'city_yevlakh', 'city_qazakh',
      'city_gadabay', 'city_sabirabad', 'city_zardab', 'city_imishli', 'city_balakan',
      'city_saatli', 'city_ujar', 'city_beylagan', 'city_agjabadi', 'city_agdash',
      'city_hajigabul', 'city_gobustan', 'city_qakh', 'city_samukh', 'city_tartar',
      'city_khizi', 'city_goychay', 'city_kurdamir', 'city_siazan', 'city_aghstafa',
      'city_neftchala', 'city_shabran', 'city_lerik', 'city_yardimli', 'city_jalilabad',
      'city_aghdara', 'city_agsu', 'city_ali_bayramli', 'city_culfa', 'city_dashkasan',
      'city_goygol', 'city_goytepe', 'city_ismayilli', 'city_kalbajar', 'city_lachin',
      'city_naftalan', 'city_oguz', 'city_ordubad', 'city_garadag', 'city_qubadli',
      'city_shahbuz', 'city_sharur', 'city_shusha', 'city_khirdalan', 'city_khojali',
      'city_khojavend', 'city_khudat', 'city_zangilan',
    ],
    [],
  );

  const maritalStatuses = useMemo(() => ['single', 'married'], []);
  const genderKeys = useMemo(() => ['male', 'female'], []);

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid gap-3">
        <Input
          value={data.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
          placeholder={t('resume_wizard_hint_full_name')}
        />
        <Input
          value={data.birthYear}
          onChange={(e) => {
            let v = (e.target.value ?? '').replace(/\D/g, '');
            if (v.length > 4) v = v.slice(0, 4);
            updateData({ birthYear: v });
          }}
          placeholder={t('resume_wizard_hint_birth_year')}
          inputMode="numeric"
        />

        <div>
          <div className="mb-1 text-sm font-semibold">{t('gender')}</div>
          <div className="grid grid-cols-2 gap-3">
            {genderKeys.map((g) => {
              const selected = data.genderKey === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => updateData({ genderKey: selected ? '' : g })}
                  className="h-12 rounded-[16px] border text-sm font-semibold transition-colors"
                  style={{
                    borderColor: selected ? 'var(--jobly-main)' : 'var(--border)',
                    backgroundColor: selected ? 'var(--jobly-main-10)' : 'transparent',
                    color: selected ? 'var(--jobly-main)' : 'var(--foreground)',
                  }}
                >
                  {t(g)}
                </button>
              );
            })}
          </div>
        </div>

        <SingleSelectDropdown
          value={data.maritalStatus}
          onChange={(v) => updateData({ maritalStatus: v })}
          placeholder={t('resume_wizard_select_marital_status')}
          options={maritalStatuses.map((k) => ({ value: k, label: t(`marital_${k}`) }))}
        />
        <SingleSelectDropdown
          value={data.cityKey}
          onChange={(v) => updateData({ cityKey: v })}
          placeholder={t('resume_wizard_select_city')}
          searchPlaceholder={t('resume_wizard_hint_search_city')}
          options={cityKeys.map((k) => ({ value: k, label: t(k) }))}
        />
      </div>
    </div>
  );
}
