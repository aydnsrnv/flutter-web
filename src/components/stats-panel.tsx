import { getStatsData } from "@/app/actions/stats";
import { StatsWidget } from "@/components/stats-widget";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";

export async function StatsPanel() {
  const data = await getStatsData();
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);

  return (
    <StatsWidget
      data={data}
      labels={{
        active: dict.active ?? "active",
        today: dict.today ?? "today",
        thisWeek: dict.thisWeek ?? "thisWeek",
        thisMonth: dict.thisMonth ?? "thisMonth",
        statistics: dict.statistics ?? "statistics",
        jobs: dict.menuTabVacancies ?? "jobs",
        resumes: dict.menuTabCvs ?? "resumes",
      }}
    />
  );
}
