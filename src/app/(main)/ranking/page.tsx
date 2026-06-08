import { createClient } from '@/lib/supabase/server';
import { RankingClient } from './RankingClient';
import { getRanking } from '@/lib/data';
import type { RankingEntryWithUser } from '@/types';

type DbRow = {
  user_id: string;
  score: number;
  like_count: number;
  save_count: number;
  vote_count: number;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    rank: string;
    rank_points: number;
  } | null;
};

export default async function RankingPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('coordinates')
    .select('user_id, score, like_count, save_count, vote_count, profiles ( username, display_name, avatar_url, rank, rank_points )')
    .eq('is_public', true)
    .order('score', { ascending: false })
    .limit(20);

  let initial: RankingEntryWithUser[] = [];

  if (data && data.length > 0) {
    const seen = new Set<string>();
    initial = (data as unknown as DbRow[])
      .filter((row) => { if (seen.has(row.user_id)) return false; seen.add(row.user_id); return true; })
      .map((row, i) => ({
        userId: row.user_id,
        rank: i + 1,
        score: row.score,
        period: 'alltime' as const,
        category: 'overall' as const,
        rankChange: 0,
        user: {
          id: row.user_id,
          username: row.profiles?.username ?? 'unknown',
          displayName: row.profiles?.display_name ?? row.profiles?.username ?? 'unknown',
          avatar: row.profiles?.avatar_url ?? `https://picsum.photos/seed/${row.user_id}/200`,
          bio: '',
          rank: 'B' as const,
          rankPoints: row.profiles?.rank_points ?? 0,
          followersCount: 0,
          followingCount: 0,
          postCount: 0,
          createdAt: '',
        },
      }));
  } else {
    initial = getRanking('overall', 'weekly');
  }

  return <RankingClient initialEntries={initial} />;
}
