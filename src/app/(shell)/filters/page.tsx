'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { useI18n } from '@/lib/i18n/client';
import { SingleSelectDropdown } from '@/components/single-select-dropdown';
import { Input } from '@/components/ui/input';

type Opt = { value: string; label: string };

export default function FiltersPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [positionContains, setPositionContains] = useState('');
  const [city, setCity] = useState('');
  const [categoryKey, setCategoryKey] = useState('');
  const [jobType, setJobType] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [gender, setGender] = useState('');
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  const cityOptions: Opt[] = useMemo(
    () => {
      // Flutter: AddJobViewModel.cityKeys
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

  const categoryOptions: Opt[] = useMemo(
    () => {
      const keys = [
        'category0',
        'category1',
        'category2',
        'category3',
        'category4',
        'category5',
        'category6',
        'category7',
        'category8',
        'category9',
        'category10',
        'category11',
        'category12',
        'category13',
        'category14',
        'category15',
        'category16',
        'category17',
        'category18',
      ];
      return keys.map((k) => ({ value: k, label: t(k) }));
    },
    [t],
  );

  const jobTypeOptions: Opt[] = useMemo(
    () => {
      const keys = ['job_type_full_time', 'job_type_part_time', 'job_type_intern'];
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
      const keys = [
        'education_higher',
        'education_incomplete_higher',
        'education_secondary_special',
      ];
      return keys.map((k) => ({ value: k, label: t(k) }));
    },
    [t],
  );

  const genderOptions: Opt[] = useMemo(
    () => [
      { value: 'male', label: t('male') },
      { value: 'female', label: t('female') },
    ],
    [t],
  );

  function pushToJobs() {
    const params = new URLSearchParams();
    if (positionContains.trim()) params.set('positionContains', positionContains.trim());
    if (city) params.set('city', city);
    if (categoryKey) params.set('categoryKey', categoryKey);
    if (jobType) params.set('jobType', jobType);
    if (experience) params.set('experience', experience);
    if (education) params.set('education', education);
    if (gender) params.set('gender', gender);
    if (premiumOnly) params.set('premiumOnly', '1');
    if (minAge.trim()) params.set('minAge', minAge.trim());
    if (maxAge.trim()) params.set('maxAge', maxAge.trim());
    if (minSalary.trim()) params.set('minSalary', minSalary.trim());
    if (maxSalary.trim()) params.set('maxSalary', maxSalary.trim());

    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : '/jobs');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-2">
        <div className="flex flex-col gap-3">
          <div>
            <div className="mb-1 text-[14px] font-semibold">{t('filters_position')}</div>
            <Input
              placeholder={t('filters_position_hint')}
              value={positionContains}
              onChange={(e) => setPositionContains(e.target.value)}
            />
          </div>

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
            <div className="mb-1 text-[14px] font-semibold">{t('category')}</div>
            <SingleSelectDropdown
              value={categoryKey}
              onChange={setCategoryKey}
              placeholder={t('select_category')}
              options={categoryOptions}
            />
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">{t('job_type')}</div>
            <SingleSelectDropdown
              value={jobType}
              onChange={setJobType}
              placeholder={t('select_job_type')}
              options={jobTypeOptions}
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
            <div className="mb-1 text-[14px] font-semibold">{t('gender')}</div>
            <SingleSelectDropdown
              value={gender}
              onChange={setGender}
              placeholder={t('select_gender')}
              options={genderOptions}
            />
          </div>

          <div>
            <div className="mb-1 text-[14px] font-semibold">{t('filters_age_range')}</div>
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
            <div className="mb-1 text-[14px] font-semibold">{t('filters_salary_range_azn')}</div>
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
            <div className="text-[14px] font-semibold">{t('filters_premium_only')}</div>
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
            onClick={pushToJobs}
            className="h-11 flex-1 rounded-[14px]"
            style={{ backgroundColor: '#245BEB', color: '#fff', fontWeight: 600 }}
          >
            {t('apply')}
          </button>
          <button
            type="button"
            onClick={() => {
              setPositionContains('');
              setCity('');
              setCategoryKey('');
              setJobType('');
              setExperience('');
              setEducation('');
              setGender('');
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
