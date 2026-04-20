import { getStatsData } from '@/app/actions/stats';
import { StatsWidget } from '@/components/stats-widget';

export async function StatsPanel() {
  const data = await getStatsData();
  return <StatsWidget data={data} />;
}
