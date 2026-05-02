'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { Refresh2 } from 'iconsax-react';
import { useI18n } from '@/lib/i18n/client';
import { createClient } from '@/lib/supabase/browser';
import { extractAvatarObjectKey } from '@/lib/r2';
import { CustomAlertDialog } from '@/components/custom-alert-dialog';

const FlashIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6.09 13.28h3.09v7.2c0 1.68.91 2.02 2.02.76l7.57-8.6c.93-1.05.54-1.92-.87-1.92h-3.09v-7.2c0-1.68-.91-2.02-2.02-.76l-7.57 8.6c-.93 1.05-.54 1.92.87 1.92Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M11 2H9C4 2 2 4 2 9v6c0 5 2 7 7 7h6c5 0 7-2 7-7v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.04 3.02 8.16 10.9c-.3.3-.6.89-.66 1.32l-.43 3.01c-.16 1.09.61 1.85 1.7 1.7l3.01-.43c.42-.06 1.01-.36 1.32-.66l7.88-7.88c1.36-1.36 2-2.94 0-4.94-2-2-3.58-1.36-4.94 0Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.91 4.15a7.144 7.144 0 0 0 4.94 4.94" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrashIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 5.98c-3.33-.33-6.68-.5-10.02-.5-1.98 0-3.96.1-5.94.3L3 5.98M8.5 4.97l.22-1.31C8.88 2.71 9 2 10.69 2h2.62c1.69 0 1.82.75 1.97 1.67l.22 1.3M18.85 9.14l-.65 10.07C18.09 20.78 18 22 15.21 22H8.79C6 22 5.91 20.78 5.8 19.21L5.15 9.14M10.33 16.5h3.33M9.5 12.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type ResumeActionsProps = {
  resumeId: string;
  isActive: boolean;
  isPremium?: boolean;
  onDelete?: () => void;
};

export function ResumeActions({ resumeId, isActive, isPremium, onDelete }: ResumeActionsProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [reactivateMessage, setReactivateMessage] = useState<string>('');
  const [reactivateReady, setReactivateReady] = useState(false);
  const [reactivatePrice, setReactivatePrice] = useState<number>(0);
  const [reactivateDays, setReactivateDays] = useState<number>(30);

  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumMessage, setPremiumMessage] = useState<string>('');
  const [premiumReady, setPremiumReady] = useState(false);
  const [premiumPrice, setPremiumPrice] = useState<number>(0);
  const [premiumDays, setPremiumDays] = useState<number>(7);

  const openPremiumDialog = useCallback(async () => {
    if (loading) return;
    if (isPremium) {
      alert(t('premium_resume_active'));
      return;
    }

    setPremiumOpen(true);
    setPremiumReady(false);
    setPremiumPrice(0);
    setPremiumDays(7);
    setPremiumMessage(t('price_loading'));

    try {
      const { data, error: priceErr } = await supabase
        .from('price')
        .select('price_premium_resume, premium_day_resume')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (priceErr) {
        setPremiumMessage(t('price_error'));
        return;
      }

      const pricePremium = Number((data as any)?.price_premium_resume ?? 0);
      const days = Number((data as any)?.premium_day_resume ?? 7);
      if (!Number.isFinite(pricePremium) || pricePremium <= 0) {
        setPremiumMessage(t('premium_price_not_found'));
        return;
      }

      const safeDays = Number.isFinite(days) && days > 0 ? days : 7;
      setPremiumPrice(pricePremium);
      setPremiumDays(safeDays);
      setPremiumMessage(
        t('premium_resume_confirm')
          .replace('{days}', String(safeDays))
          .replace('{price}', String(pricePremium)),
      );
      setPremiumReady(true);
    } catch {
      setPremiumMessage(t('price_error'));
    }
  }, [isPremium, loading, supabase, t]);

  const confirmPremium = useCallback(async () => {
    if (!premiumReady || premiumPrice <= 0) return;
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error(t('profile_login_required'));

      const { data: resumeRow, error: rErr } = await supabase
        .from('resumes')
        .select('user_id, is_premium')
        .eq('id', resumeId)
        .maybeSingle();

      if (rErr) throw new Error(rErr.message);
      if (!resumeRow) throw new Error(t('resume_detail_not_found'));

      const ownerId = String((resumeRow as any)?.user_id ?? '');
      if (!ownerId || ownerId !== uid) throw new Error(t('premium_resume_error').replace('{error}', 'not_allowed'));

      if ((resumeRow as any)?.is_premium) throw new Error(t('premium_resume_already'));

      const { data: userRow, error: uErr } = await supabase.from('users').select('wallet').eq('user_id', uid).maybeSingle();
      if (uErr) throw new Error(uErr.message);
      const wallet = Number((userRow as any)?.wallet ?? 0) || 0;
      if (wallet < premiumPrice) throw new Error(t('premium_balance_not_enough'));

      const now = new Date();
      const end = new Date(now.getTime() + premiumDays * 24 * 60 * 60 * 1000);

      const { error: upResumeErr } = await supabase
        .from('resumes')
        .update({
          is_premium: true,
          premium_start: now.toISOString(),
          premium_end: end.toISOString(),
        } as any)
        .eq('id', resumeId)
        .eq('user_id', uid);
      if (upResumeErr) throw new Error(upResumeErr.message);

      const nextWallet = wallet - premiumPrice;
      const { error: upWalletErr } = await supabase.from('users').update({ wallet: nextWallet } as any).eq('user_id', uid);
      if (upWalletErr) throw new Error(t('balance_update_failed'));

      try {
        await supabase.from('wallet_transactions').insert({
          user_id: uid,
          amount: -Math.abs(Math.round(premiumPrice)),
          source: 'make_premium',
          type: 'resume',
          resume_id: resumeId,
          created_at: new Date().toISOString(),
        } as any);
      } catch {
        // ignore wallet tx failure
      }

      setPremiumOpen(false);
      router.refresh();
      alert(t('premium_resume_success'));
    } catch (e: any) {
      alert(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [premiumDays, premiumPrice, premiumReady, resumeId, router, supabase, t]);

  const handlePremium = async () => {
    await openPremiumDialog();
  };

  const handleEdit = () => {
    router.push(`/cv?id=${resumeId}`);
  };

  const handleDelete = async () => {
    setDeleteOpen(true);
  };

  const openReactivateDialog = useCallback(async () => {
    if (loading) return;
    setReactivateOpen(true);
    setReactivateReady(false);
    setReactivatePrice(0);
    setReactivateDays(30);
    setReactivateMessage(t('price_loading'));
    try {
      const { data, error: priceErr } = await supabase
        .from('price')
        .select('price_resume, normal_day_resume')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (priceErr) {
        setReactivateMessage(t('price_error'));
        return;
      }

      const priceResume = Number((data as any)?.price_resume ?? 0);
      const days = Number((data as any)?.normal_day_resume ?? 30);
      if (!Number.isFinite(priceResume) || priceResume < 0) {
        setReactivateMessage(t('resume_wizard_price_not_found'));
        return;
      }

      setReactivatePrice(priceResume);
      setReactivateDays(Number.isFinite(days) && days > 0 ? days : 30);
      setReactivateMessage(t('resume_wizard_submit_cost').replace('{price}', String(priceResume)));
      setReactivateReady(true);
    } catch {
      setReactivateMessage(t('price_error'));
    }
  }, [loading, supabase, t]);

  const handleReactivate = async () => {
    await openReactivateDialog();
  };

  const confirmReactivate = useCallback(async () => {
    if (!reactivateReady || reactivatePrice < 0) return;
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error(t('profile_login_required'));

      const { data: userRow, error: uErr } = await supabase.from('users').select('wallet').eq('user_id', uid).maybeSingle();
      if (uErr) throw new Error(uErr.message);
      const wallet = Number((userRow as any)?.wallet ?? 0) || 0;
      if (reactivatePrice > 0 && wallet < reactivatePrice) throw new Error(t('resume_wizard_error_balance_not_enough'));

      const { error: rpcErr } = await supabase.rpc('reactivate_resume', {
        p_resume_id: resumeId,
        p_user_id: uid,
        p_days: reactivateDays,
      });
      if (rpcErr) throw new Error(rpcErr.message);

      if (reactivatePrice > 0) {
        const nextWallet = wallet - reactivatePrice;
        const { error: upErr } = await supabase.from('users').update({ wallet: nextWallet } as any).eq('user_id', uid);
        if (upErr) throw new Error(t('resume_wizard_error_balance_update_failed'));
      }

      try {
        if (reactivatePrice > 0) {
          await supabase.from('wallet_transactions').insert({
            user_id: uid,
            amount: -Math.abs(Math.round(reactivatePrice)),
            source: 'post_resume',
            type: 'resume',
            resume_id: resumeId,
            created_at: new Date().toISOString(),
          } as any);
        }
      } catch {
        // ignore wallet tx failure
      }

      setReactivateOpen(false);
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [reactivateDays, reactivatePrice, reactivateReady, resumeId, router, supabase, t]);

  return (
    <div className="mt-3 flex items-center justify-between">
      <CustomAlertDialog
        open={deleteOpen}
        title={t('delete')}
        message={t('delete_resume_confirm')}
        confirmText={t('confirm_button')}
        cancelText={t('cancel_button')}
        isDestructive
        icon={<TrashIcon size={22} className="" />}
        iconColor="var(--destructive)"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          setDeleteOpen(false);
          setLoading(true);
          try {
            const { data: auth } = await supabase.auth.getUser();
            const uid = auth.user?.id;
            if (!uid) throw new Error(t('profile_login_required'));

            const { data: resumeRow, error: fetchErr } = await supabase
              .from('resumes')
              .select('avatar')
              .eq('id', resumeId)
              .eq('user_id', uid)
              .maybeSingle();
            if (fetchErr) throw new Error(fetchErr.message);

            const avatarUrl = (resumeRow as any)?.avatar ?? null;

            const { error: dErr } = await supabase
              .from('resumes')
              .delete()
              .eq('id', resumeId)
              .eq('user_id', uid);
            if (dErr) throw new Error(dErr.message);

            if (avatarUrl) {
              const oldKey = extractAvatarObjectKey(avatarUrl);
              if (oldKey) {
                await supabase.functions
                  .invoke('r2-avatar-delete', {
                    body: { key: oldKey },
                  })
                  .catch(() => {
                    // ignore R2 cleanup errors
                  });
              }
            }

            onDelete?.();
            alert(t('resume_deleted_notification'));
          } catch (e: any) {
            alert(e?.message ?? String(e));
          } finally {
            setLoading(false);
          }
        }}
      />

      <CustomAlertDialog
        open={premiumOpen}
        title={t('premium_resume_title')}
        message={premiumMessage}
        confirmText={t('confirm_button')}
        cancelText={t('cancel_button')}
        icon={<FlashIcon size={22} className="" />}
        iconColor="var(--warning, #F59E0B)"
        onCancel={() => setPremiumOpen(false)}
        onConfirm={async () => {
          if (!premiumReady) return;
          await confirmPremium();
        }}
      />

      <CustomAlertDialog
        open={reactivateOpen}
        title={t('confirm')}
        message={reactivateMessage}
        confirmText={t('confirm_button')}
        cancelText={t('cancel_button')}
        icon={<Refresh2 size={22} variant="Linear" color="currentColor" />}
        iconColor="var(--jobly-main)"
        onCancel={() => setReactivateOpen(false)}
        onConfirm={async () => {
          if (!reactivateReady) return;
          await confirmReactivate();
        }}
      />

      <div className="flex items-center gap-2">
        {isActive ? (
          <>
            <button
              type="button"
              onClick={handlePremium}
              disabled={loading}
              className="grid h-8 w-8 place-items-center rounded-[10px] bg-orange-500/12 transition-opacity hover:opacity-80 disabled:opacity-50"
              title={isPremium ? t('premium_resume_active') : t('premium')}
            >
              <FlashIcon size={20} className="text-orange-500/80" />
            </button>
            <button
              type="button"
              onClick={handleEdit}
              disabled={loading}
              className="grid h-8 w-8 place-items-center rounded-[10px] bg-blue-500/12 transition-opacity hover:opacity-80 disabled:opacity-50"
              title={t('edit')}
            >
              <EditIcon size={20} className="text-blue-500/80" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleReactivate}
            disabled={loading}
            className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary/12 transition-opacity hover:opacity-80 disabled:opacity-50"
            title={t('confirm')}
          >
            <Refresh2 size={20} variant="Linear" color="currentColor" className="text-primary" />
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="grid h-8 w-8 place-items-center rounded-[10px] bg-red-500/12 transition-opacity hover:opacity-80 disabled:opacity-50"
          title={t('delete')}
        >
          <TrashIcon size={20} className="text-red-500/80" />
        </button>
      </div>
    </div>
  );
}
