import Link from 'next/link';

import { cloneElement, isValidElement, type ReactElement } from 'react';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';

import { Add, ArrowRight2, Briefcase, Edit, Lock, LogoutCurve, User, Wallet2, WalletMinus } from 'iconsax-react';
import { ManatIcon } from '@/components/ui/manat-icon';
import { ProfileAvatarUpload } from '@/components/profile-avatar-upload';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

type UserRow = {
  user_id: string;
  email?: string | null;
  full_name?: string | null;
  profile_image?: string | null;
  wallet?: number | null;
  user_type?: string | null;
};

function formatCount(n: number) {
  if (n < 10000) return String(n);
  const isExact = n % 1000 === 0;
  const inK = n / 1000;
  const formatted = isExact ? inK.toFixed(0) : inK.toFixed(1);
  return `${formatted.replace('.', ',')}{k}`;
}

function MenuRow({
  title,
  icon,
  href,
  danger,
}: {
  title: string;
  icon: ReactElement;
  href?: string;
  danger?: boolean;
}) {
  const iconBg = danger ? 'rgba(239, 68, 68, 0.10)' : 'rgba(36, 91, 235, 0.10)';
  const iconColor = danger ? '#EF4444' : 'var(--jobly-main, #245BEB)';
  const resolvedIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<any>, { color: 'currentColor' } as any)
    : icon;
  const row = (
    <div className="flex items-center px-3 py-3">
      <div className="grid h-[60px] w-[60px] place-items-center">
        <div className="grid h-[60px] w-[60px] place-items-center rounded-full" style={{ backgroundColor: iconBg }}>
          <span style={{ color: iconColor }}>{resolvedIcon}</span>
        </div>
      </div>
      <div className="w-4 shrink-0" />
      <div className="min-w-0 flex-1 text-[16px] font-normal" style={{ color: danger ? '#EF4444' : 'inherit' }}>
        {title}
      </div>
      <div className="shrink-0 text-muted-foreground">
        <ArrowRight2 size={20} variant="Linear" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {row}
      </Link>
    );
  }

  return <div className="opacity-60">{row}</div>;
}

function Separator() {
  return <div className="h-[0.35px] w-full bg-black/15 dark:bg-white/15" />;
}

export default async function ProfilePage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? dict[toSnakeCase(key)] ?? key;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const uid = user?.id;
  const email = user?.email ?? null;

  let userRow: UserRow | null = null;
  let userError: string | null = null;

  if (uid) {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, email, full_name, profile_image, wallet, user_type')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) userError = error.message;
    userRow = (data as UserRow | null) ?? null;
  }

  const fullName = (userRow?.full_name ?? '').trim() || t('user');
  const avatar = (userRow?.profile_image ?? '').trim() || null;
  const wallet = userRow?.wallet ?? 0;
  const userType = (userRow?.user_type ?? '').toLowerCase();
  const isCandidate = userType === 'candidate';

  let postedJobsCount = 0;
  let appliedCount = 0;
  let totalViewCount = 0;

  if (uid && !isCandidate) {
    const { data: jobStats, error: statsErr } = await supabase
      .from('jobs')
      .select('view_count, applied_count')
      .eq('creator_id', uid)
      .limit(5000);
    if (statsErr) {
      // keep zeros
    } else {
      const list = Array.isArray(jobStats) ? (jobStats as Array<any>) : [];
      postedJobsCount = list.length;
      for (const j of list) {
        const v = j?.view_count;
        const a = j?.applied_count;
        totalViewCount += typeof v === 'number' ? v : Number(v) || 0;
        appliedCount += typeof a === 'number' ? a : Number(a) || 0;
      }
    }
  }

  const mainColor = 'var(--jobly-main, #245BEB)';
  const topSurface = 'var(--card, #ffffff)';

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-end">

        <div className="flex items-center gap-2">
          <div
            className="inline-flex items-center gap-1 rounded-full pl-2 pr-3 py-1.5 text-[14px] font-bold bg-primary/10 text-foreground"
          >
            <WalletMinus size={16} variant="Outline" color="currentColor" className="mr-1" />
            <span>{wallet}</span>
            <ManatIcon size={16} color={mainColor} />
          </div>

          <Link
            href="/wallet"
            className="grid h-10 w-10 place-items-center rounded-xl"
            style={{ backgroundColor: 'rgba(36, 91, 235, 0.10)' }}
            aria-label={t('wallet_add_balance')}
          >
            <div className="grid h-7 w-7 place-items-center rounded-full" style={{ backgroundColor: mainColor }}>
              <Add size={18} variant="Linear" color="#fff" />
            </div>
          </Link>
        </div>
      </header>

      {userError ? (
        <div className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
          {t('profile_load_error').replace('{error}', userError)}
        </div>
      ) : null}

      <div
        className="w-full overflow-hidden rounded-b-[28px] rounded-t-2xl border border-border"
        style={{ backgroundColor: topSurface, boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}
      >
        <div className="px-4 pb-5 pt-5">
          <div className="flex flex-col items-center">
            <ProfileAvatarUpload
              avatarUrl={avatar}
              fullName={fullName || ''}
              isCandidate={isCandidate}
              userId={user?.id || ''}
              mainColor={mainColor}
              editable={false}
            />

            <div className="mt-3 text-center">
              <div className="text-[20px] font-bold text-foreground">
                {fullName}
              </div>
              <div className="mt-1 text-[16px] text-muted-foreground">
                {userRow?.email ?? email ?? ''}
              </div>
            </div>

            {isCandidate ? (
              <div className="mt-4 w-full">
                <Link
                  href="/create/cv/add"
                  className="block h-12 w-full rounded-xl text-center text-[16px] font-semibold leading-[48px]"
                  style={{
                    color: '#fff',
                    background: 'linear-gradient(90deg, #245BEB, #22C55E, #A855F7)',
                    boxShadow: '0 10px 18px rgba(36,91,235,0.18)',
                  }}
                >
                  {t('profile_create_cv')}
                </Link>
              </div>
            ) : (
              <div className="mt-4 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <div className="text-[20px] font-bold text-foreground">
                      {formatCount(postedJobsCount).replace('{k}', t('number_k_suffix'))}
                    </div>
                    <div className="mt-1 text-[13px] text-muted-foreground">
                      {t('stat_posted')}
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-[20px] font-bold text-foreground">
                      {formatCount(appliedCount).replace('{k}', t('number_k_suffix'))}
                    </div>
                    <div className="mt-1 text-[13px] text-muted-foreground">
                      {t('stat_applied')}
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-[20px] font-bold text-foreground">
                      {formatCount(totalViewCount).replace('{k}', t('number_k_suffix'))}
                    </div>
                    <div className="mt-1 text-[13px] text-muted-foreground">
                      {t('stat_view')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-0">
        <div className="px-2 pb-1">
          <div className="px-2 text-[13px] font-semibold tracking-[1.2px] text-muted-foreground">
            {t('account_section')}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border">
          <MenuRow
            title={isCandidate ? t('profile_my_cvs') : t('menu_my_jobs')}
            icon={<Briefcase size={34} variant="Linear" />}
            href={isCandidate ? '/my/cvs' : '/my/jobs'}
          />
          <Separator />
          <MenuRow
            title={t('drafts')}
            icon={<Edit size={34} variant="Linear" />}
            href="/my/drafts"
          />
          <Separator />
          <MenuRow
            title={t('menu_payments_history')}
            icon={<Wallet2 size={34} variant="Linear" />}
            href="/payments-history"
          />
          <Separator />
          <MenuRow
            title={t('spendings_title')}
            icon={<WalletMinus size={34} variant="Linear" />}
            href="/wallet-transactions"
          />
        </div>

        <div className="mt-3 px-2 pb-1">
          <div className="px-2 text-[13px] font-semibold tracking-[1.2px] text-muted-foreground">
            {t('other_section')}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border">
          <MenuRow
            title={t('menu_change_password')}
            icon={<Lock size={34} variant="Linear" />}
            href="/change-password"
          />
          <Separator />
          <MenuRow
            title={t('logout')}
            icon={<LogoutCurve size={34} variant="Linear" />}
            href="/logout"
            danger
          />
        </div>
      </div>
    </div>
  );
}
