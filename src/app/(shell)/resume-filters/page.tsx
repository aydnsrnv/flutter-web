'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { SingleSelectDropdown } from '@/components/single-select-dropdown';
import { Input } from '@/components/ui/input';

type Opt = { value: string; label: string };

export default function ResumeFiltersPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [city, setCity] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  const cityOptions: Opt[] = useMemo(
    () => {
      const keys = [
        'city_baku',
        'city_absheron',
        'city_ganja',
        'city_sumgait',
        'city_mingechevir',
        'city_khankendi',
        'city_lenkeran',
        'city_sheki',
        'city_shirvan',
        'city_nakhchivan',
        'city_quba',
        'city_qusar',
        'city_qabala',
        'city_zaqatala',
        'city_shamakhi',
        'city_tovuz',
        'city_agdam',
        'city_fuzuli',
        'city_shamkir',
        'city_barda',
        'city_masalli',
        'city_salyan',
        'city_astara',
        'city_yevlakh',
        'city_qazakh',
        'city_gadabay',
        'city_sabirabad',
        'city_zardab',
        'city_imishli',
        'city_balakan',
        'city_saatli',
        'city_ujar',
        'city_beylagan',
        'city_agjabadi',
        'city_agdash',
        'city_hajigabul',
        'city_gobustan',
        'city_qakh',
        'city_samukh',
        'city_tartar',
        'city_khizi',
        'city_goychay',
        'city_kurdamir',
        'city_siazan',
        'city_aghstafa',
        'city_neftchala',
        'city_shabran',
        'city_lerik',
        'city_yardimli',
        'city_jalilabad',
        'city_aghdara',
        'city_agsu',
        'city_ali_bayramli',
        'city_culfa',
        'city_dashkasan',
        'city_goygol',
        'city_goytepe',
        'city_ismayilli',
        'city_kalbajar',
        'city_lachin',
        'city_naftalan',
        'city_oguz',
        'city_ordubad',
        'city_garadag',
        'city_qubadli',
        'city_shahbuz',
        'city_sharur',
        'city_shusha',
        'city_khirdalan',
        'city_khojali',
        'city_khojavend',
        'city_khudat',
        'city_zangilan',
      ];
      return keys.map((k) => ({ value: k, label: t(k) }));
    },
    [t],
  );

  const experienceOptions: Opt[] = useMemo(
    () => {
      const keys = [
        'exp_none',
        'exp_less_than_one',
        'exp_one_to_three',
        'exp_three_to_five',
        'exp_more_than_five',
      ];
      return keys.map((k) => ({ value: k, label: t(k) }));
    },
    [t],
  );

  const educationOptions: Opt[] = useMemo(
    () => {
      const keys = ['education_higher', 'education_incomplete_higher', 'education_secondary_special'];
      return keys.map((k) => ({ value: k, label: t(k) }));
    },
    [t],
  );

  function applyFilters() {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (experience) params.set('experience', experience);
    if (education) params.set('education', education);
    if (premiumOnly) params.set('premiumOnly', '1');
    if (minAge.trim()) params.set('minAge', minAge.trim());
    if (maxAge.trim()) params.set('maxAge', maxAge.trim());
    if (minSalary.trim()) params.set('minSalary', minSalary.trim());
    if (maxSalary.trim()) params.set('maxSalary', maxSalary.trim());

    const qs = params.toString();
    router.push(qs ? `/candidates?${qs}` : '/candidates');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-2">
        <div className="flex flex-col gap-3">
          <div>
            <div className="mb-1 text-[14px] font-semibold">{t('city')}</div>
            <SingleSelectDropdown
              value={city}
              onChange={setCity}
              placeholder={t('select_city')}
              searchPlaceholder={t('search_title')}
              options={cityOptions}
            />
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">{t('experience')}</div>
            <SingleSelectDropdown
              value={experience}
              onChange={setExperience}
              placeholder={t('select_experience')}
              options={experienceOptions}
            />
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">{t('education')}</div>
            <SingleSelectDropdown
              value={education}
              onChange={setEducation}
              placeholder={t('select_education')}
              options={educationOptions}
            />
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">{t('age')}</div>
            <div className="flex gap-3">
              <Input
                placeholder={t('filters_min_short')}
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
              />
              <Input
                placeholder={t('filters_max_short')}
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">{t('salary')}</div>
            <div className="flex gap-3">
              <Input
                placeholder={t('filters_min_short')}
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
              />
              <Input
                placeholder={t('filters_max_short')}
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[14px] font-semibold">{t('premium')}</div>
            <input
              type="checkbox"
              checked={premiumOnly}
              onChange={(e) => setPremiumOnly(e.target.checked)}
              className="h-5 w-5"
            />
          </div>
        </div>
      </div>

      <div className="pb-2">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={applyFilters}
            className="h-11 flex-1 rounded-[14px]"
            style={{ backgroundColor: '#245BEB', color: '#fff', fontWeight: 600 }}
          >
            {t('apply')}
          </button>
          <button
            type="button"
            onClick={() => {
              setCity('');
              setExperience('');
              setEducation('');
              setPremiumOnly(false);
              setMinAge('');
              setMaxAge('');
              setMinSalary('');
              setMaxSalary('');
            }}
            className="h-11 rounded-[14px] px-4"
            style={{ color: '#245BEB', fontWeight: 600, backgroundColor: 'transparent' }}
          >
            {t('clear')}
          </button>
        </div>
      </div>
    </div>
  );
}
