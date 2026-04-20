import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocaleFromCookies } from '@/lib/i18n/server';

export default async function MenuPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('menu_title')}</h1>
      </header>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-sm text-muted-foreground">{t('page_in_progress')}</div>
      </div>
    </div>
  );
}
