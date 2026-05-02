'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { useI18n } from '@/lib/i18n/client';

const STORAGE_KEY = 'jobly_cv_wizard_draft';

function stripEmojis(input: string) {
  try {
    return input.replace(/\p{Extended_Pictographic}/gu, '').replace(/[\uFE0F\u200D]/g, '');
  } catch {
    return input.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
  }
}

function sanitizeNonNegativeNumberString(input: string) {
  return stripEmojis(input).replace(/-/g, '').replace(/[^0-9]/g, '');
}

function parsePossiblyStringArray(v: any) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    try { const p = JSON.parse(v); if (Array.isArray(p)) return p; } catch { /* ignore */ }
  }
  if (v && typeof v === 'object') return [v];
  return [];
}

async function generateUniqueResumeNumber(
  supabase: ReturnType<typeof createClient>,
  t: (key: string) => string,
) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const n = 100000 + Math.floor(Math.random() * 900000);
    const { data, error } = await supabase.from('resumes').select('resume_number').eq('resume_number', n).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return n;
  }
  throw new Error(t('resume_wizard_error_generate_number_failed'));
}

export type ExperienceEntry = {
  company: string;
  position?: string;
  start_year?: number;
  start_month?: number;
  end_year?: number;
  end_month?: number;
  description?: string;
};

export type EducationEntry = {
  institution: string;
  degree?: string;
  field?: string;
  start_year?: number;
  end_year?: number;
  description?: string;
};

export type CertificationEntry = {
  name: string;
  issuer?: string;
  year?: number;
  description?: string;
};

export type CvWizardData = {
  fullName: string;
  desiredPosition: string;
  desiredSalary: string;
  birthYear: string;
  maritalStatus: string;
  cityKey: string;
  genderKey: string;
  email: string;
  phone: string;
  educationLevelKey: string;
  experienceLevelKey: string;
  educations: EducationEntry[];
  experiences: ExperienceEntry[];
  certifications: CertificationEntry[];
  skills: string;
  languages: string;
  about: string;
};

const DEFAULT_DATA: CvWizardData = {
  fullName: '',
  desiredPosition: '',
  desiredSalary: '',
  birthYear: '',
  maritalStatus: '',
  cityKey: '',
  genderKey: '',
  email: '',
  phone: '0',
  educationLevelKey: '',
  experienceLevelKey: '',
  educations: [{ institution: '', degree: '' }],
  experiences: [{ company: '', position: '', start_year: undefined, start_month: undefined, end_year: undefined, end_month: undefined, description: '' }],
  certifications: [{ name: '', issuer: '', year: undefined, description: '' }],
  skills: '',
  languages: '',
  about: '',
};

const TOTAL_STEPS = 9;

function getStepTitle(step: number, t: (k: string) => string): string {
  switch (step) {
    case 1: return t('resume_wizard_step_basic_title');
    case 2: return t('resume_wizard_step_demographics_title');
    case 3: return t('resume_wizard_step_contact_title');
    case 4: return t('resume_wizard_step_education_title');
    case 5: return t('resume_wizard_step_experience_title');
    case 6: return t('resume_wizard_step_certifications_title');
    case 7: return t('resume_wizard_step_skills_title');
    case 8: return t('resume_wizard_step_about_title');
    case 9: return t('resume_wizard_step_preview_title');
    default: return '';
  }
}

type CvWizardContextValue = {
  step: number;
  totalSteps: number;
  stepTitle: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditMode: boolean;
  canGoNext: boolean;
  data: CvWizardData;
  updateData: (patch: Partial<CvWizardData>) => void;
  setDataField: <K extends keyof CvWizardData>(key: K, value: CvWizardData[K]) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  submit: () => Promise<void>;
  saveDraft: () => Promise<void>;
  openConfirmDialog: () => Promise<void>;
  confirmOpen: boolean;
  confirmMessage: string;
  confirmReady: boolean;
  setConfirmOpen: (v: boolean) => void;
  addLanguageWithLevel: (lang: string, level: string) => void;
  removeLanguage: (index: number) => void;
  selectedLanguages: string[];
};

const CvWizardContext = createContext<CvWizardContextValue | null>(null);

export function useCvWizard() {
  const ctx = useContext(CvWizardContext);
  if (!ctx) throw new Error('useCvWizard must be used inside CvWizardProvider');
  return ctx;
}

export function CvWizardProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const editId = (searchParams.get('id') ?? '').trim();
  const draftId = (searchParams.get('draft_id') ?? '').trim();
  const isEditMode = Boolean(editId);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  const [data, setData] = useState<CvWizardData>(DEFAULT_DATA);
  const [loadedEdit, setLoadedEdit] = useState(false);
  const [loadedDraft, setLoadedDraft] = useState(false);
  const [creationDays, setCreationDays] = useState(30);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmReady, setConfirmReady] = useState(false);

  const selectedLanguages = useMemo(() => {
    return data.languages.split(',').map((s) => s.trim()).filter(Boolean);
  }, [data.languages]);

  const stepTitle = getStepTitle(step, t);

  // ── Load user profile ──
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      const u = authData.user;
      if (!mounted) return;
      if (!u) {
        setAuthUserId(null);
        setLoading(false);
        return;
      }
      setAuthUserId(u.id);
      setData((prev) => ({ ...prev, email: u.email ?? '' }));

      const { data: row } = await supabase.from('users').select('user_id, email, full_name').eq('user_id', u.id).maybeSingle();
      if (!mounted) return;
      if (row) {
        const r: any = row;
        setData((prev) => ({
          ...prev,
          fullName: (r.full_name ?? '').trim(),
          email: (r.email ?? prev.email).trim(),
        }));
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [supabase]);

  // ── Load edit mode data ──
  useEffect(() => {
    let mounted = true;
    if (!isEditMode) { setLoadedEdit(true); return; }
    if (!authUserId || loadedEdit) return;

    (async () => {
      try {
        const { data: row, error: qErr } = await supabase
          .from('resumes')
          .select('id, user_id, full_name, desired_position, desired_salary, birth_year, marital_status, city, gender_key, email, phone, education_key, experience_key, skills, languages, about, experiences, educations, certifications')
          .eq('id', editId)
          .eq('user_id', authUserId)
          .maybeSingle();
        if (qErr) throw new Error(qErr.message);
        if (!row) throw new Error(t('profile_not_loaded'));
        const r: any = row;

        const exps = parsePossiblyStringArray(r.experiences);
        const edus = parsePossiblyStringArray(r.educations);
        const certs = parsePossiblyStringArray(r.certifications);

        setData({
          fullName: String(r.full_name ?? ''),
          desiredPosition: String(r.desired_position ?? ''),
          desiredSalary: String(r.desired_salary ?? ''),
          birthYear: r.birth_year == null ? '' : String(r.birth_year),
          maritalStatus: String(r.marital_status ?? ''),
          cityKey: String(r.city ?? ''),
          genderKey: String(r.gender_key ?? ''),
          email: String(r.email ?? ''),
          phone: String(r.phone ?? '0'),
          educationLevelKey: String(r.education_key ?? ''),
          experienceLevelKey: String(r.experience_key ?? ''),
          skills: String(r.skills ?? ''),
          languages: String(r.languages ?? ''),
          about: String(r.about ?? ''),
          experiences: exps.length ? exps : [{ company: '', position: '', start_year: undefined, start_month: undefined, end_year: undefined, end_month: undefined, description: '' }],
          educations: edus.length ? edus : [{ institution: '', degree: '' }],
          certifications: certs.length ? certs : [{ name: '', issuer: '', year: undefined, description: '' }],
        });
        setStep(9);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoadedEdit(true);
      }
    })();
    return () => { mounted = false; };
  }, [authUserId, editId, isEditMode, loadedEdit, supabase, t]);

  // ── Load draft data ──
  useEffect(() => {
    let mounted = true;
    if (!draftId || isEditMode) { setLoadedDraft(true); return; }
    if (!authUserId) return;
    if (loadedDraft) return;

    (async () => {
      try {
        const { data: row, error } = await supabase.from('resume_drafts').select('*').eq('id', draftId).eq('creator_id', authUserId).maybeSingle();
        if (error) throw new Error(error.message);
        if (!row) throw new Error(t('draft_not_found'));
        const r: any = row;

        const exps = parsePossiblyStringArray(r.experiences);
        const edus = parsePossiblyStringArray(r.educations);
        const certs = parsePossiblyStringArray(r.certifications);

        setData({
          fullName: String(r.full_name ?? ''),
          desiredPosition: String(r.desired_position ?? ''),
          desiredSalary: String(r.desired_salary ?? ''),
          birthYear: r.birth_year == null ? '' : String(r.birth_year),
          maritalStatus: String(r.marital_status ?? ''),
          cityKey: String(r.city ?? ''),
          genderKey: String(r.gender_key ?? ''),
          email: String(r.email ?? ''),
          phone: String(r.phone ?? '0'),
          educationLevelKey: String(r.education_key ?? ''),
          experienceLevelKey: String(r.experience_key ?? ''),
          skills: String(r.skills ?? ''),
          languages: String(r.languages ?? ''),
          about: String(r.about ?? ''),
          experiences: exps.length ? exps : [{ company: '', position: '', start_year: undefined, start_month: undefined, end_year: undefined, end_month: undefined, description: '' }],
          educations: edus.length ? edus : [{ institution: '', degree: '' }],
          certifications: certs.length ? certs : [{ name: '', issuer: '', year: undefined, description: '' }],
        });
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        if (mounted) setLoadedDraft(true);
      }
    })();
    return () => { mounted = false; };
  }, [authUserId, draftId, isEditMode, loadedDraft, supabase, t]);

  // ── Restore from localStorage ──
  useEffect(() => {
    if (isEditMode || draftId) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setData((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch { /* ignore */ }
  }, [isEditMode, draftId]);

  // ── Persist to localStorage ──
  useEffect(() => {
    if (isEditMode) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data, isEditMode]);

  const updateData = useCallback((patch: Partial<CvWizardData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const setDataField = useCallback(<K extends keyof CvWizardData>(key: K, value: CvWizardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addLanguageWithLevel = useCallback((languageKeyValue: string, level: string) => {
    const entry = `${languageKeyValue} (${level})`;
    setData((prev) => {
      const list = prev.languages.split(',').map((s) => s.trim()).filter(Boolean);
      if (!list.includes(entry)) list.push(entry);
      return { ...prev, languages: list.join(', ') };
    });
  }, []);

  const removeLanguage = useCallback((index: number) => {
    setData((prev) => {
      const list = prev.languages.split(',').map((s) => s.trim()).filter(Boolean);
      list.splice(index, 1);
      return { ...prev, languages: list.join(', ') };
    });
  }, []);

  // ── Validation ──
  const validateStep = useCallback((s: number): string | null => {
    switch (s) {
      case 1:
        if (!data.desiredPosition.trim()) return t('resume_wizard_error_desired_position_required');
        break;
      case 2: {
        if (!data.fullName.trim()) return t('resume_wizard_error_full_name_required');
        const by = data.birthYear.trim();
        if (by) {
          if (!/^\d{4}$/.test(by)) return t('resume_wizard_error_birth_year_invalid');
          const year = Number(by);
          const nowYear = new Date().getFullYear();
          const age = nowYear - year;
          if (!Number.isFinite(age) || age < 15) return 'Yaşınız 15-dən kiçikdir. CV əlavə etmək üçün ən az 15 yaşınız olmalıdır.';
        }
        break;
      }
      case 3: {
        const p = data.phone.trim();
        if (p && !/^0\d{9}$/.test(p)) return t('resume_wizard_error_phone_invalid');
        const em = data.email.trim();
        if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return t('invalid_email');
        break;
      }
      case 4:
        // education optional
        break;
      case 5:
        // experience is optional; "no experience" checkbox disables cards
        break;
      case 6:
        // certifications optional
        break;
      case 7:
        // skills optional
        break;
      case 8:
        // about optional
        break;
      case 9:
        break;
    }
    return null;
  }, [data, t]);

  const canGoNext = useMemo(() => {
    if (step >= TOTAL_STEPS) return true;
    return validateStep(step) === null;
  }, [step, validateStep]);

  // ── Navigation ──
  const goToStep = useCallback((s: number) => {
    const clamped = Math.max(1, Math.min(TOTAL_STEPS, s));
    setStep(clamped);
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(clamped));
    window.history.pushState({}, '', url.toString());
  }, []);

  const nextStep = useCallback(() => {
    if (step < TOTAL_STEPS) goToStep(step + 1);
  }, [step, goToStep]);

  const prevStep = useCallback(() => {
    if (step > 1) goToStep(step - 1);
  }, [step, goToStep]);

  useEffect(() => {
    const urlStep = Number(searchParams.get('step'));
    if (Number.isFinite(urlStep) && urlStep >= 1 && urlStep <= TOTAL_STEPS) {
      setStep(urlStep);
    }
  }, [searchParams]);

  // ── Submit ──
  const submitImpl = useCallback(async () => {
    setError(null);
    const vErr = validateStep(2) || validateStep(1);
    if (vErr) { setError(vErr); return; }
    if (!authUserId) { setError(t('profile_login_required')); return; }

    setSaving(true);
    try {
      const generatedResumeNumber = await generateUniqueResumeNumber(supabase, t);
      const safeBirthYear = data.birthYear.trim() ? Number(data.birthYear.trim()) : null;
      const safeDesiredSalary = data.desiredSalary.trim() ? data.desiredSalary.trim() : null;
      const safePhone = data.phone.trim() && data.phone.trim() !== '0' ? data.phone.trim() : null;

      const expPayload = data.experiences
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
        .filter(Boolean) as any[];

      const eduPayload = data.educations
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
        .filter(Boolean) as any[];

      const certPayload = data.certifications
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
        .filter(Boolean) as any[];

      const payload: Record<string, any> = {
        user_id: authUserId,
        resume_number: generatedResumeNumber,
        full_name: data.fullName.trim(),
        desired_position: data.desiredPosition.trim(),
        desired_salary: safeDesiredSalary,
        birth_year: safeBirthYear,
        marital_status: data.maritalStatus || null,
        city: data.cityKey || null,
        gender_key: data.genderKey || null,
        email: data.email.trim(),
        phone: safePhone,
        education_key: data.educationLevelKey || null,
        experience_key: data.experienceLevelKey || null,
        skills: data.skills.trim() ? data.skills.trim() : null,
        languages: data.languages.trim() ? data.languages.trim() : null,
        about: data.about.trim() ? data.about.trim() : null,
        experiences: expPayload.length ? expPayload : null,
        educations: eduPayload.length ? eduPayload : null,
        certifications: certPayload.length ? certPayload : null,
        status: true,
      };

      if (isEditMode) {
        const { data: upData, error: upErr } = await supabase.from('resumes').update(payload).eq('id', editId).eq('user_id', authUserId).select('resume_number').maybeSingle();
        if (upErr) throw new Error(upErr.message);
        const resumeNumber = (upData as any)?.resume_number;
        if (!resumeNumber) throw new Error(t('resume_wizard_error_create_failed'));
        router.push(`/cv/${resumeNumber}`);
      } else {
        const now = new Date();
        const days = Number.isFinite(creationDays) && creationDays > 0 ? creationDays : 30;
        const expiration = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        payload.is_premium = false;
        payload.premium_start = null;
        payload.premium_end = null;
        payload.create_time = now.toISOString();
        payload.expiration_date = expiration.toISOString();

        const { data: insData, error: insertErr } = await supabase.from('resumes').insert(payload).select('id, resume_number').maybeSingle();
        if (insertErr) throw new Error(insertErr.message);
        const createdId = (insData as any)?.id?.toString();
        let resumeNumber = (insData as any)?.resume_number;
        let parsed = Number(resumeNumber);

        if (!(Number.isFinite(parsed) && parsed > 0) && createdId) {
          const { data: patched, error: patchErr } = await supabase.from('resumes').update({ resume_number: generatedResumeNumber }).eq('id', createdId).eq('user_id', authUserId).select('resume_number').maybeSingle();
          if (patchErr) throw new Error(patchErr.message);
          resumeNumber = (patched as any)?.resume_number ?? resumeNumber;
          parsed = Number(resumeNumber);
        }

        if (!(Number.isFinite(parsed) && parsed > 0)) {
          throw new Error(t('resume_wizard_error_create_failed'));
        }

        localStorage.removeItem(STORAGE_KEY);
        if (draftId) {
          await supabase.from('resume_drafts').delete().eq('id', draftId).eq('creator_id', authUserId);
        }
        router.push(`/cv/${resumeNumber}`);
      }
    } catch (e: any) {
      setError(t('resume_wizard_error_prefix').replace('{error}', e?.message ?? String(e)));
    } finally {
      setSaving(false);
    }
  }, [data, authUserId, creationDays, editId, isEditMode, draftId, router, supabase, t, validateStep]);

  const openConfirmDialog = useCallback(async () => {
    if (saving) return;
    setConfirmOpen(true);
    setConfirmReady(false);
    setConfirmMessage(t('resume_wizard_price_loading'));
    try {
      const { data: priceRow, error: priceErr } = await supabase.from('price').select('price_resume, normal_day_resume').order('id', { ascending: false }).limit(1).maybeSingle();
      if (priceErr) { setConfirmMessage(t('price_error')); return; }
      const priceResume = Number((priceRow as any)?.price_resume);
      const daysRaw = Number((priceRow as any)?.normal_day_resume ?? 30);
      const days = Number.isFinite(daysRaw) && daysRaw > 0 ? daysRaw : 30;
      const priceText = Number.isFinite(priceResume) && priceResume >= 0 ? String(priceResume) : t('dash_placeholder');
      setCreationDays(days);
      setConfirmMessage(t('resume_wizard_submit_cost').replace('{price}', priceText));
      setConfirmReady(true);
    } catch {
      setConfirmMessage(t('price_error'));
    }
  }, [saving, supabase, t]);

  const submit = useCallback(async () => {
    if (isEditMode) { await submitImpl(); return; }
    await openConfirmDialog();
  }, [isEditMode, openConfirmDialog, submitImpl]);

  const saveDraft = useCallback(async () => {
    if (!authUserId) { setError(t('profile_login_required')); return; }
    setSaving(true);
    try {
      const { count, error: countErr } = await supabase.from('resume_drafts').select('*', { count: 'exact', head: true }).eq('creator_id', authUserId);
      if (countErr) throw new Error(countErr.message);
      if ((count ?? 0) >= 3 && !draftId) {
        throw new Error(t('draft_limit_reached').replace('{max}', '3'));
      }

      const payload: Record<string, any> = {
        creator_id: authUserId,
        title: data.fullName.trim() || data.desiredPosition.trim() || t('resume_wizard_draft_title_fallback'),
        full_name: data.fullName.trim() || null,
        desired_position: data.desiredPosition.trim() || null,
        desired_salary: data.desiredSalary.trim() || null,
        birth_year: data.birthYear.trim() ? Number(data.birthYear.trim()) : null,
        marital_status: data.maritalStatus || null,
        city: data.cityKey || null,
        gender_key: data.genderKey || null,
        email: data.email.trim() || null,
        phone: data.phone.trim() || '0',
        education_key: data.educationLevelKey || null,
        experience_key: data.experienceLevelKey || null,
        skills: data.skills.trim() || null,
        languages: data.languages.trim() || null,
        about: data.about.trim() || null,
        experiences: data.experiences.length ? data.experiences : null,
        educations: data.educations.length ? data.educations : null,
        certifications: data.certifications.length ? data.certifications : null,
      };

      if (draftId) {
        const { error: upErr } = await supabase.from('resume_drafts').update(payload).eq('id', draftId).eq('creator_id', authUserId);
        if (upErr) throw new Error(upErr.message);
      } else {
        const { error: inErr } = await supabase.from('resume_drafts').insert(payload);
        if (inErr) throw new Error(inErr.message);
      }

      localStorage.removeItem(STORAGE_KEY);
      router.push('/my/drafts');
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }, [authUserId, data, draftId, router, supabase, t]);

  const value: CvWizardContextValue = {
    step, totalSteps: TOTAL_STEPS, stepTitle,
    loading, saving, error, isEditMode, canGoNext,
    data, updateData, setDataField,
    goToStep, nextStep, prevStep,
    submit, saveDraft, openConfirmDialog,
    confirmOpen, confirmMessage, confirmReady, setConfirmOpen,
    addLanguageWithLevel, removeLanguage, selectedLanguages,
  };

  return (
    <CvWizardContext.Provider value={value}>
      {children}
    </CvWizardContext.Provider>
  );
}
