import { RankingClient } from './RankingClient';
import { getRanking } from '@/lib/data';

export default function RankingPage() {
  const initial = getRanking('overall', 'weekly');
  return <RankingClient initialEntries={initial} />;
}
