'use client';

import { useMemo } from 'react';
import { useJobWizard } from '@/components/job-wizard/job-wizard-context';
import { SingleSelectDropdown } from '@/components/single-select-dropdown';
import { useI18n } from '@/lib/i18n/client';

export function StepCity() {
  const { t } = useI18n();
  const { data, setDataField } = useJobWizard();

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

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="mt-2 grid gap-3">
        <SingleSelectDropdown
          value={data.cityKey}
          onChange={(v) => setDataField('cityKey', v)}
          placeholder={t('select_city')}
          searchPlaceholder={t('resume_wizard_hint_search_city')}
          options={cityKeys.map((k) => ({ value: k, label: t(k) }))}
        />
      </div>
    </div>
  );
}
