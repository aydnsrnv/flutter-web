import { getStatsData } from "@/app/actions/stats";
import { StatsWidget } from "@/components/stats-widget";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";

export async function StatsPanel() {
  const data = await getStatsData();
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);

  const t = (key: string) => dict[key] ?? key;

  return (
    <StatsWidget
      data={data}
      labels={{
        active: t("active"),
        today: t("today"),
        thisWeek: t("thisWeek"),
        thisMonth: t("thisMonth"),
        statistics: t("statistics"),
        jobs: t("menu_tab_vacancies"),
        resumes: t("menu_tab_cvs"),
      }}
    />
  );
}
