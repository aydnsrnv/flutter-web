import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';

export default async function MePage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">{t('session_debug_title')}</h1>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
          <div className="font-medium">{t('get_user_error_title')}</div>
          <div className="mt-1 text-sm">{error.message}</div>
        </div>
      ) : null}

      <div className="rounded-md border p-4">
        <div className="text-sm font-medium">{t('user')}</div>
        <pre className="mt-2 overflow-auto text-xs">
          {JSON.stringify(data.user, null, 2)}
        </pre>
      </div>

      <div className="text-sm text-zinc-600">
        <Link className="underline" href="/">
          {t('nav_home')}
        </Link>
        {' | '}
        <Link className="underline" href="/login">
          {t('login')}
        </Link>
      </div>
    </div>
  );
}
