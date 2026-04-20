'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { 
  Add, 
  ArrowDown2, 
  ArrowLeft2, 
  Trash, 
  Call, 
  CloseCircle, 
  Sms, 
  User 
} from 'iconsax-react';

import { createClient } from '@/lib/supabase/browser';
import { useI18n } from '@/lib/i18n/client';
import { CustomAlertDialog } from '@/components/custom-alert-dialog';
import { SingleSelectDropdown } from '@/components/single-select-dropdown';
import { PageShimmer } from '@/components/page-shimmer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const mainColor = '#245BEB';

function stripEmojis(input: string) {
  try {
    return input
      .replace(/\p{Extended_Pictographic}/gu, '')
      .replace(/[\uFE0F\u200D]/g, '');
  } catch {
    return input.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
  }
}

function sanitizeNonNegativeNumberString(input: string) {
  const noEmoji = stripEmojis(input);
  const cleaned = noEmoji.replace(/-/g, '').replace(/[^0-9]/g, '');
  return cleaned;
}

async function generateUniqueResumeNumber(
  supabase: ReturnType<typeof createClient>,
  t: (key: string) => string,
) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const n = 100000 + Math.floor(Math.random() * 900000);
    const { data, error } = await supabase
      .from('resumes')
      .select('resume_number')
      .eq('resume_number', n)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      return n;
    }
  }

  throw new Error(t('resume_wizard_error_generate_number_failed'));
}

type ExperienceEntry = {
  company: string;
  position?: string;
  start_year: number;
  start_month?: number;
  end_year?: number;
  end_month?: number;
  description?: string;
  order_index?: number;
};

type EducationEntry = {
  institution: string;
  degree?: string;
  field?: string;
  start_year?: number;
  end_year?: number;
  description?: string;
  order_index?: number;
};

type CertificationEntry = {
  name: string;
  issuer?: string;
  year?: number;
  description?: string;
  order_index?: number;
};

type UserRow = {
  user_id: string;
  email?: string | null;
  full_name?: string | null;
};

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="px-1 text-[16px] font-bold text-foreground">
      {title}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  const resolvedValue = stripEmojis(value);
  return (
    <Input
      value={resolvedValue}
      onChange={(e) => {
        const raw = e.target.value;
        const next = type === 'number' ? sanitizeNonNegativeNumberString(raw) : stripEmojis(raw);
        onChange(next);
      }}
      onKeyDown={(e) => {
        if (type !== 'number') return;
        if (e.key === '-') e.preventDefault();
      }}
      placeholder={placeholder}
      type={type ?? 'text'}
      min={type === 'number' ? 0 : undefined}
    />
  );
}



export default function ResumeWizardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const editId = (searchParams.get('id') ?? '').trim();
  const isEditMode = Boolean(editId);
  const [loadedEdit, setLoadedEdit] = useState(false);

  const educationKeys = useMemo(
    () => [
      'education_higher',
      'education_incomplete_higher',
      'education_secondary_special',
    ],
    [],
  );

  const experienceKeys = useMemo(
    () => [
      'exp_none',
      'exp_less_than_one',
      'exp_one_to_three',
      'exp_three_to_five',
      'exp_more_than_five',
    ],
    [],
  );

  const maritalStatuses = useMemo(() => ['single', 'married'], []);

  const cityKeys = useMemo(
    () => [
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
    ],
    [],
  );

  const genderKeys = useMemo(() => ['male', 'female', 'all_genders'], []);

  const languageOptions = useMemo(
    () => [
      'resume_wizard_lang_azerbaijani',
      'resume_wizard_lang_english',
      'resume_wizard_lang_russian',
      'resume_wizard_lang_turkish',
      'resume_wizard_lang_german',
      'resume_wizard_lang_french',
      'resume_wizard_lang_spanish',
      'resume_wizard_lang_portuguese',
      'resume_wizard_lang_italian',
      'resume_wizard_lang_arabic',
      'resume_wizard_lang_persian',
      'resume_wizard_lang_chinese',
      'resume_wizard_lang_korean',
      'resume_wizard_lang_hindi',
    ],
    [],
  );

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [profileRow, setProfileRow] = useState<UserRow | null>(null);

  const [fullName, setFullName] = useState('');
  const [desiredPosition, setDesiredPosition] = useState('');
  const [desiredSalary, setDesiredSalary] = useState('');

  const [birthYear, setBirthYear] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [cityKey, setCityKey] = useState('');
  const [genderKey, setGenderKey] = useState('');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('0');

  const [educationLevelKey, setEducationLevelKey] = useState('');
  const [experienceLevelKey, setExperienceLevelKey] = useState('');

  const [educations, setEducations] = useState<Array<Partial<EducationEntry>>>([{ institution: '', degree: '' }]);
  const [experiences, setExperiences] = useState<Array<Partial<ExperienceEntry>>>([
    { company: '', position: '', start_year: undefined, start_month: undefined, end_year: undefined, end_month: undefined, description: '' },
  ]);
  const [certifications, setCertifications] = useState<Array<Partial<CertificationEntry>>>([{ name: '', issuer: '', year: undefined, description: '' }]);

  const [skills, setSkills] = useState('');
  const [languages, setLanguages] = useState('');
  const [pendingLanguageKey, setPendingLanguageKey] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [about, setAbout] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creationDays, setCreationDays] = useState(30);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [confirmReady, setConfirmReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingProfile(true);
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!mounted) return;
      if (!u) {
        setAuthUserId(null);
        setLoadingProfile(false);
        return;
      }
      setAuthUserId(u.id);
      setEmail(u.email ?? '');

      const { data: row, error: rowErr } = await supabase
        .from('users')
        .select('user_id, email, full_name')
        .eq('user_id', u.id)
        .maybeSingle();

      if (!mounted) return;
      if (!rowErr && row) {
        const r = row as UserRow;
        setProfileRow(r);
        setFullName((r.full_name ?? '').trim());
        if ((r.email ?? '').trim()) setEmail((r.email ?? '').trim());
      }
      setLoadingProfile(false);
    })();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    let mounted = true;
    if (!isEditMode) {
      setLoadedEdit(true);
      return;
    }
    if (!authUserId || loadedEdit) return;

    (async () => {
      try {
        const { data, error: qErr } = await supabase
          .from('resumes')
          .select('id, user_id, full_name, desired_position, desired_salary, birth_year, marital_status, city, gender_key, email, phone, education_key, experience_key, skills, languages, about, experiences, educations, certifications')
          .eq('id', editId)
          .eq('user_id', authUserId)
          .maybeSingle();

        if (qErr) throw new Error(qErr.message);
        if (!data) throw new Error(t('profile_not_loaded'));
        const r: any = data;

        setFullName(String(r.full_name ?? ''));
        setDesiredPosition(String(r.desired_position ?? ''));
        setDesiredSalary(String(r.desired_salary ?? ''));
        setBirthYear(r.birth_year == null ? '' : String(r.birth_year));
        setMaritalStatus(String(r.marital_status ?? ''));
        setCityKey(String(r.city ?? ''));
        setGenderKey(String(r.gender_key ?? ''));
        setEmail(String(r.email ?? ''));
        setPhone(String(r.phone ?? '0'));
        setEducationLevelKey(String(r.education_key ?? ''));
        setExperienceLevelKey(String(r.experience_key ?? ''));
        setSkills(String(r.skills ?? ''));
        setLanguages(String(r.languages ?? ''));
        setAbout(String(r.about ?? ''));

        const exps = Array.isArray(r.experiences) ? r.experiences : [];
        const edus = Array.isArray(r.educations) ? r.educations : [];
        const certs = Array.isArray(r.certifications) ? r.certifications : [];
        setExperiences(exps.length ? exps : [{ company: '', position: '', start_year: undefined, start_month: undefined, end_year: undefined, end_month: undefined, description: '' }]);
        setEducations(edus.length ? edus : [{ institution: '', degree: '' }]);
        setCertifications(certs.length ? certs : [{ name: '', issuer: '', year: undefined, description: '' }]);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoadedEdit(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authUserId, editId, isEditMode, loadedEdit, supabase, t]);

  useEffect(() => {
    setSelectedLanguages(
      languages
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }, [languages]);

  const addLanguageWithLevel = useCallback(
    (languageKeyValue: string, level: string) => {
      const entry = `${languageKeyValue} (${level})`;
      setLanguages((prev) => {
        const list = prev
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (!list.includes(entry)) list.push(entry);
        return list.join(', ');
      });
    },
    [],
  );

  const validate = useCallback((): string | null => {
    if (!fullName.trim()) return t('resume_wizard_error_full_name_required');
    if (!desiredPosition.trim()) return t('resume_wizard_error_desired_position_required');
    const by = birthYear.trim();
    if (by && !/^\d{4}$/.test(by)) return t('resume_wizard_error_birth_year_invalid');
    const p = phone.trim();
    if (p && p !== '0') {
      if (!/^0\d{9}$/.test(p)) return t('resume_wizard_error_phone_invalid');
    }
    return null;
  }, [birthYear, desiredPosition, fullName, phone, t]);

  const submitImpl = useCallback(async () => {
    setError(null);
    const vErr = validate();
    if (vErr) {
      setError(vErr);
      return;
    }

    if (!authUserId) {
      setError(t('profile_login_required'));
      return;
    }

    setSaving(true);
    try {
      const generatedResumeNumber = await generateUniqueResumeNumber(supabase, t);
      const safeBirthYear = birthYear.trim() ? Number(birthYear.trim()) : null;
      const safeDesiredSalary = desiredSalary.trim() ? desiredSalary.trim() : null;
      const safePhone = phone.trim() && phone.trim() !== '0' ? phone.trim() : null;

      const expPayload: ExperienceEntry[] = experiences
        .map((e, idx) => {
          const company = String(e.company ?? '').trim();
          const startYear = Number(e.start_year);
          if (!company || !Number.isFinite(startYear) || startYear <= 0) return null;
          const startMonthRaw = (e as any).start_month as unknown;
          const endYearRaw = (e as any).end_year as unknown;
          const endMonthRaw = (e as any).end_month as unknown;
          const startMonth = startMonthRaw == null || String(startMonthRaw).trim() === '' ? null : Number(startMonthRaw);
          const endYear = endYearRaw == null || String(endYearRaw).trim() === '' ? null : Number(endYearRaw);
          const endMonth = endMonthRaw == null || String(endMonthRaw).trim() === '' ? null : Number(endMonthRaw);
          return {
            company,
            position: String(e.position ?? '').trim() || undefined,
            start_year: startYear,
            start_month: startMonth && Number.isFinite(startMonth) ? startMonth : undefined,
            end_year: endYear && Number.isFinite(endYear) ? endYear : undefined,
            end_month: endMonth && Number.isFinite(endMonth) ? endMonth : undefined,
            description: String(e.description ?? '').trim() || undefined,
            order_index: idx,
          };
        })
        .filter(Boolean) as ExperienceEntry[];

      const eduPayload: EducationEntry[] = educations
        .map((e, idx) => {
          const institution = String(e.institution ?? '').trim();
          if (!institution) return null;
          const startYearRaw = (e as any).start_year as unknown;
          const endYearRaw = (e as any).end_year as unknown;
          const startYear = startYearRaw == null || String(startYearRaw).trim() === '' ? null : Number(startYearRaw);
          const endYear = endYearRaw == null || String(endYearRaw).trim() === '' ? null : Number(endYearRaw);
          return {
            institution,
            degree: String(e.degree ?? '').trim() || undefined,
            field: String((e as any).field ?? '').trim() || undefined,
            start_year: startYear && Number.isFinite(startYear) ? startYear : undefined,
            end_year: endYear && Number.isFinite(endYear) ? endYear : undefined,
            description: String((e as any).description ?? '').trim() || undefined,
            order_index: idx,
          };
        })
        .filter(Boolean) as EducationEntry[];

      const certPayload: CertificationEntry[] = certifications
        .map((c, idx) => {
          const name = String(c.name ?? '').trim();
          if (!name) return null;
          const yearRaw = (c as any).year as unknown;
          const year = yearRaw == null || String(yearRaw).trim() === '' ? null : Number(yearRaw);
          return {
            name,
            issuer: String(c.issuer ?? '').trim() || undefined,
            year: year && Number.isFinite(year) ? year : undefined,
            description: String(c.description ?? '').trim() || undefined,
            order_index: idx,
          };
        })
        .filter(Boolean) as CertificationEntry[];

      const payload: Record<string, any> = {
        user_id: authUserId,
        resume_number: generatedResumeNumber,
        full_name: fullName.trim(),
        desired_position: desiredPosition.trim(),
        desired_salary: safeDesiredSalary,
        birth_year: safeBirthYear,
        marital_status: maritalStatus || null,
        city: cityKey || null,
        gender_key: genderKey || null,
        email: email.trim(),
        phone: safePhone,
        education_key: educationLevelKey || null,
        experience_key: experienceLevelKey || null,
        skills: skills.trim() ? skills.trim() : null,
        languages: languages.trim() ? languages.trim() : null,
        about: about.trim() ? about.trim() : null,
        experiences: expPayload.length ? expPayload : null,
        educations: eduPayload.length ? eduPayload : null,
        certifications: certPayload.length ? certPayload : null,
        status: true,
      };

      if (isEditMode) {
        const { data, error: upErr } = await supabase
          .from('resumes')
          .update(payload)
          .eq('id', editId)
          .eq('user_id', authUserId)
          .select('resume_number')
          .maybeSingle();

        if (upErr) throw new Error(upErr.message);
        const resumeNumber = (data as any)?.resume_number;
        if (!resumeNumber) throw new Error(t('resume_wizard_error_create_failed'));

        router.push(`/resume/${resumeNumber}`);
      } else {
        const now = new Date();
        const days = Number.isFinite(creationDays) && creationDays > 0 ? creationDays : 30;
        const expiration = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        payload.is_premium = false;
        payload.premium_start = null;
        payload.premium_end = null;
        payload.create_time = now.toISOString();
        payload.expiration_date = expiration.toISOString();

        const { data, error: insertErr } = await supabase
          .from('resumes')
          .insert(payload)
          .select('id, resume_number')
          .maybeSingle();

        if (insertErr) throw new Error(insertErr.message);
        const createdId = (data as any)?.id?.toString();
        let resumeNumber = (data as any)?.resume_number;
        let parsedResumeNumber = Number(resumeNumber);

        if (!(Number.isFinite(parsedResumeNumber) && parsedResumeNumber > 0) && createdId) {
          const { data: patched, error: patchErr } = await supabase
            .from('resumes')
            .update({ resume_number: generatedResumeNumber })
            .eq('id', createdId)
            .eq('user_id', authUserId)
            .select('resume_number')
            .maybeSingle();

          if (patchErr) throw new Error(patchErr.message);
          resumeNumber = (patched as any)?.resume_number ?? resumeNumber;
          parsedResumeNumber = Number(resumeNumber);
        }

        if (!(Number.isFinite(parsedResumeNumber) && parsedResumeNumber > 0)) {
          throw new Error(t('resume_wizard_error_create_failed'));
        }

        router.push(`/resume/${resumeNumber}`);
      }
    } catch (e: any) {
      setError(t('resume_wizard_error_prefix').replace('{error}', e?.message ?? String(e)));
    } finally {
      setSaving(false);
    }
  }, [
    about,
    authUserId,
    birthYear,
    certifications,
    creationDays,
    cityKey,
    desiredPosition,
    desiredSalary,
    educationLevelKey,
    educations,
    email,
    experienceLevelKey,
    experiences,
    fullName,
    genderKey,
    languages,
    maritalStatus,
    phone,
    router,
    skills,
    supabase,
    t,
    validate,
  ]);

  const openConfirmDialog = useCallback(async () => {
    if (saving) return;
    setConfirmOpen(true);
    setConfirmReady(false);
    setConfirmMessage(t('resume_wizard_price_loading'));
    try {
      const { data, error: priceErr } = await supabase
        .from('price')
        .select('price_resume, normal_day_resume')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (priceErr) {
        setConfirmMessage(t('price_error'));
        return;
      }

      const priceResume = Number((data as any)?.price_resume);
      const daysRaw = Number((data as any)?.normal_day_resume ?? 30);
      const days = Number.isFinite(daysRaw) && daysRaw > 0 ? daysRaw : 30;
      const priceText = Number.isFinite(priceResume) && priceResume >= 0 ? String(priceResume) : t('dash_placeholder');
      setCreationDays(days);
      setConfirmMessage(t('resume_wizard_submit_cost').replace('{price}', priceText));
      setConfirmReady(true);
    } catch {
      setConfirmMessage(t('price_error'));
    }
  }, [saving, supabase, t]);

  const onSubmit = useCallback(async () => {
    if (isEditMode) {
      await submitImpl();
      return;
    }
    await openConfirmDialog();
  }, [isEditMode, openConfirmDialog, submitImpl]);

  if (loadingProfile) {
    return <PageShimmer />;
  }

  return (
    <div className="flex flex-col gap-4">
      <CustomAlertDialog
        open={confirmOpen}
        title={t('resume_wizard_submit_title')}
        message={confirmMessage}
        confirmText={t('resume_wizard_submit_confirm')}
        cancelText={t('resume_wizard_submit_cancel')}
        icon={
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <path d="M14.55 21.67C18.84 20.54 22 16.64 22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.64 3.16 8.54 7.45 9.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16v6l2-2M12 22l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        iconColor="#245BEB"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          if (!confirmReady) return;
          setConfirmOpen(false);
          await submitImpl();
        }}
      />

      {error ? (
        <div className="rounded-2xl border border-border px-4 py-3 text-[14px]" style={{ color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.06)' }}>
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('resume_wizard_step_basic_title')} />
          <div className="mt-4 grid gap-3">
            <TextInput value={desiredPosition} onChange={setDesiredPosition} placeholder={t('resume_wizard_hint_desired_position')} />
            <TextInput value={desiredSalary} onChange={setDesiredSalary} placeholder={t('resume_wizard_hint_desired_salary')} />
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('resume_wizard_step_demographics_title')} />
          <div className="mt-4 grid gap-3">
            <TextInput value={fullName} onChange={setFullName} placeholder={t('resume_wizard_hint_full_name')} />
            <TextInput value={birthYear} onChange={setBirthYear} placeholder={t('resume_wizard_hint_birth_year')} type="number" />
            <SingleSelectDropdown
              value={genderKey}
              onChange={setGenderKey}
              placeholder={t('gender')}
              options={genderKeys.map((k) => ({ value: k, label: t(k) }))}
            />
            <SingleSelectDropdown
              value={maritalStatus}
              onChange={setMaritalStatus}
              placeholder={t('resume_wizard_select_marital_status')}
              options={maritalStatuses.map((k) => ({ value: k, label: t(`marital_${k}`) }))}
            />
            <SingleSelectDropdown
              value={cityKey}
              onChange={setCityKey}
              placeholder={t('resume_wizard_select_city')}
              searchPlaceholder={t('resume_wizard_hint_search_city')}
              options={cityKeys.map((k) => ({ value: k, label: t(k) }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('resume_wizard_step_contact_title')} />
          <div className="mt-4 grid gap-3">
            <div className="relative">
              <Sms size={18} variant="Linear" className="absolute left-4 top-3" color={mainColor} />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('resume_wizard_hint_email')}
                className="pl-11 pr-4"
              />
            </div>
            <div className="relative">
              <Call size={18} variant="Linear" className="absolute left-4 top-3" color={mainColor} />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('resume_wizard_hint_phone_optional')}
                className="pl-11 pr-4"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('resume_wizard_step_education_title')} />
          <div className="mt-4 grid gap-3">
            <SingleSelectDropdown
              value={educationLevelKey}
              onChange={setEducationLevelKey}
              placeholder={t('resume_wizard_select_education_level')}
              options={educationKeys.map((k) => ({ value: k, label: t(k) }))}
            />

            {educations.map((e, idx) => (
              <div key={idx} className="rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-semibold text-foreground">
                    {t('resume_wizard_education_item_title').replace('{index}', String(idx + 1))}
                  </div>
                  {educations.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setEducations((prev) => prev.filter((_, i) => i !== idx))}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-white"
                      aria-label={t('resume_wizard_tooltip_delete')}
                    >
                      <Trash size={18} variant="Linear" className="text-red-500" />
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-3">
                  <TextInput
                    value={String(e.institution ?? '')}
                    onChange={(v) =>
                      setEducations((prev) => {
                        const copy = prev.slice();
                        copy[idx] = { ...copy[idx], institution: v };
                        return copy;
                      })
                    }
                    placeholder={t('resume_wizard_hint_education_institution')}
                  />
                  <TextInput
                    value={String(e.degree ?? '')}
                    onChange={(v) =>
                      setEducations((prev) => {
                        const copy = prev.slice();
                        copy[idx] = { ...copy[idx], degree: v };
                        return copy;
                      })
                    }
                    placeholder={t('resume_wizard_hint_education_degree')}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      value={(e as any).start_year == null ? '' : String((e as any).start_year)}
                      onChange={(v) =>
                        setEducations((prev) => {
                          const copy = prev.slice();
                          copy[idx] = { ...copy[idx], start_year: v ? Number(v) : undefined } as any;
                          return copy;
                        })
                      }
                      placeholder={t('resume_wizard_hint_start_year')}
                      type="number"
                    />
                    <TextInput
                      value={(e as any).end_year == null ? '' : String((e as any).end_year)}
                      onChange={(v) =>
                        setEducations((prev) => {
                          const copy = prev.slice();
                          copy[idx] = { ...copy[idx], end_year: v ? Number(v) : undefined } as any;
                          return copy;
                        })
                      }
                      placeholder={t('resume_wizard_hint_end_year')}
                      type="number"
                    />
                  </div>
                  <TextInput
                    value={String((e as any).description ?? '')}
                    onChange={(v) =>
                      setEducations((prev) => {
                        const copy = prev.slice();
                        copy[idx] = { ...copy[idx], description: v } as any;
                        return copy;
                      })
                    }
                    placeholder={t('resume_wizard_hint_education_description')}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setEducations((prev) => prev.concat({ institution: '', degree: '' }))}
              className="h-12 rounded-2xl border border-border bg-white text-[14px] font-semibold"
              style={{ color: mainColor }}
            >
              {t('resume_wizard_add_education')}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('resume_wizard_step_experience_title')} />
          <div className="mt-4 grid gap-3">
            <SingleSelectDropdown
              value={experienceLevelKey}
              onChange={setExperienceLevelKey}
              placeholder={t('resume_wizard_select_experience_level')}
              options={experienceKeys.map((k) => ({ value: k, label: t(k) }))}
            />

            {experiences.map((e, idx) => (
              <div key={idx} className="rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-semibold text-foreground">
                    {t('resume_wizard_experience_item_title').replace('{index}', String(idx + 1))}
                  </div>
                  {experiences.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setExperiences((prev) => prev.filter((_, i) => i !== idx))}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-white"
                      aria-label={t('resume_wizard_tooltip_delete')}
                    >
                      <Trash size={18} variant="Linear" className="text-red-500" />
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-3">
                  <TextInput
                    value={String(e.company ?? '')}
                    onChange={(v) =>
                      setExperiences((prev) => {
                        const copy = prev.slice();
                        copy[idx] = { ...copy[idx], company: v };
                        return copy;
                      })
                    }
                    placeholder={t('resume_wizard_hint_company_name')}
                  />
                  <TextInput
                    value={String(e.position ?? '')}
                    onChange={(v) =>
                      setExperiences((prev) => {
                        const copy = prev.slice();
                        copy[idx] = { ...copy[idx], position: v };
                        return copy;
                      })
                    }
                    placeholder={t('resume_wizard_hint_position')}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      value={(e as any).start_month == null ? '' : String((e as any).start_month)}
                      onChange={(v) =>
                        setExperiences((prev) => {
                          const copy = prev.slice();
                          copy[idx] = { ...copy[idx], start_month: v ? Number(v) : undefined } as any;
                          return copy;
                        })
                      }
                      placeholder={t('month_short')}
                      type="number"
                    />
                    <TextInput
                      value={(e as any).start_year == null ? '' : String((e as any).start_year)}
                      onChange={(v) =>
                        setExperiences((prev) => {
                          const copy = prev.slice();
                          copy[idx] = { ...copy[idx], start_year: v ? Number(v) : undefined } as any;
                          return copy;
                        })
                      }
                      placeholder={t('resume_wizard_hint_start_year')}
                      type="number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      value={(e as any).end_month == null ? '' : String((e as any).end_month)}
                      onChange={(v) =>
                        setExperiences((prev) => {
                          const copy = prev.slice();
                          copy[idx] = { ...copy[idx], end_month: v ? Number(v) : undefined } as any;
                          return copy;
                        })
                      }
                      placeholder={t('month_short')}
                      type="number"
                    />
                    <TextInput
                      value={(e as any).end_year == null ? '' : String((e as any).end_year)}
                      onChange={(v) =>
                        setExperiences((prev) => {
                          const copy = prev.slice();
                          copy[idx] = { ...copy[idx], end_year: v ? Number(v) : undefined } as any;
                          return copy;
                        })
                      }
                      placeholder={t('resume_wizard_hint_end_year')}
                      type="number"
                    />
                  </div>

                  <Textarea
                    value={String(e.description ?? '')}
                    onChange={(ev) =>
                      setExperiences((prev) => {
                        const copy = prev.slice();
                        copy[idx] = { ...copy[idx], description: stripEmojis(ev.target.value) };
                        return copy;
                      })
                    }
                    placeholder={t('resume_wizard_hint_experience_description')}
                    className="min-h-[96px] rounded-2xl"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setExperiences((prev) =>
                  prev.concat({ company: '', position: '', start_year: undefined, start_month: undefined, end_year: undefined, end_month: undefined, description: '' }),
                )
              }
              className="h-12 rounded-2xl border border-border bg-white text-[14px] font-semibold"
              style={{ color: mainColor }}
            >
              {t('resume_wizard_add_experience')}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('resume_wizard_step_certifications_title')} />
          <div className="mt-4 grid gap-3">
        {certifications.map((c, idx) => (
          <div key={idx} className="rounded-2xl border border-border p-3">
            <div className="flex items-center justify-between">
                  <div className="text-[14px] font-semibold text-foreground">
                    {t('resume_wizard_certification_item_title').replace('{index}', String(idx + 1))}
                  </div>
                  {certifications.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCertifications((prev) => prev.filter((_, i) => i !== idx))}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-white"
                      aria-label={t('resume_wizard_tooltip_delete')}
                    >
                      <Trash size={18} variant="Linear" className="text-red-500" />
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-3">
                  <TextInput
                    value={String(c.name ?? '')}
                    onChange={(v) =>
                      setCertifications((prev) => {
                        const copy = prev.slice();
                        copy[idx] = { ...copy[idx], name: v };
                        return copy;
                      })
                    }
                    placeholder={t('resume_wizard_hint_certification_name')}
                  />
                  <TextInput
                    value={String(c.issuer ?? '')}
                    onChange={(v) =>
                      setCertifications((prev) => {
                        const copy = prev.slice();
                        copy[idx] = { ...copy[idx], issuer: v };
                        return copy;
                      })
                    }
                    placeholder={t('resume_wizard_hint_certification_issuer')}
                  />
                  <TextInput
                    value={c.year == null ? '' : String(c.year)}
                    onChange={(v) =>
                      setCertifications((prev) => {
                        const copy = prev.slice();
                        copy[idx] = { ...copy[idx], year: v ? Number(v) : undefined };
                        return copy;
                      })
                    }
                    placeholder={t('resume_wizard_hint_certification_year')}
                    type="number"
                  />
                  <TextInput
                    value={String(c.description ?? '')}
                    onChange={(v) =>
                      setCertifications((prev) => {
                        const copy = prev.slice();
                        copy[idx] = { ...copy[idx], description: v };
                        return copy;
                      })
                    }
                    placeholder={t('resume_wizard_hint_certification_description')}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setCertifications((prev) => prev.concat({ name: '', issuer: '', year: undefined, description: '' }))}
              className="h-12 rounded-2xl border border-border bg-white text-[14px] font-semibold"
              style={{ color: mainColor }}
            >
              {t('resume_wizard_add_certification')}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('resume_wizard_step_skills_title')} />
          <div className="mt-4 grid gap-3">
            <TextInput value={skills} onChange={setSkills} placeholder={t('resume_wizard_hint_skills')} />

            <div className="rounded-2xl border border-border p-3">
              <div className="text-[14px] font-semibold text-foreground">
                {t('resume_wizard_label_languages')}
              </div>
              <div className="mt-3 grid gap-3">
                <SingleSelectDropdown
                  value={pendingLanguageKey}
                  onChange={(v) => {
                    setPendingLanguageKey(v);
                  }}
                  placeholder={t('resume_wizard_select_language')}
                  options={languageOptions.map((k) => ({ value: k, label: t(k) }))}
                />

                {pendingLanguageKey ? (
                  <SingleSelectDropdown
                    value=""
                    onChange={(lvl) => {
                      if (!pendingLanguageKey || !lvl) return;
                      addLanguageWithLevel(pendingLanguageKey, lvl);
                      setPendingLanguageKey('');
                    }}
                    placeholder={t('resume_wizard_sheet_select_language_level_title')}
                    options={['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((k) => ({ value: k, label: k }))}
                  />
                ) : null}

                {selectedLanguages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedLanguages.map((l, idx) => (
                      <button
                        key={`${l}-${idx}`}
                        type="button"
                        onClick={() => {
                          setLanguages((prev) => {
                            const list = prev
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean)
                              .filter((_, i) => i !== idx);
                            return list.join(', ');
                          });
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-[13px] text-foreground/80"
                      >
                        {t(l.replace(/ \([A-C][12]\)$/, ''))} {l.match(/\(([A-C][12])\)/)?.[0] ?? ''}
                        <CloseCircle size={16} variant="Linear" className="text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4">
          <SectionTitle title={t('resume_wizard_step_about_title')} />
          <div className="mt-4">
            <Textarea
              value={about}
              onChange={(e) => setAbout(stripEmojis(e.target.value))}
              placeholder={t('resume_wizard_hint_about')}
              className="min-h-[120px] rounded-2xl"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => void onSubmit()}
          disabled={saving}
          className="h-12 w-full rounded-2xl text-[16px] font-bold"
          style={{
            color: '#fff',
            background: saving ? 'rgba(36,91,235,0.55)' : 'linear-gradient(90deg, #245BEB, #22C55E, #A855F7)',
            boxShadow: '0 10px 18px rgba(36,91,235,0.18)',
          }}
        >
          {saving ? `${t('resume_wizard_submit')}…` : t('resume_wizard_submit')}
        </button>
      </div>
    </div>
  );
}
