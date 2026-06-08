import type { RankingEntry, RankingCategory, RankingPeriod } from '@/types';

const makeEntries = (
  category: RankingCategory,
  period: RankingPeriod,
  data: Array<{ userId: string; score: number; rankChange: number }>
): RankingEntry[] =>
  data.map((d, i) => ({
    userId: d.userId,
    rank: i + 1,
    score: d.score,
    period,
    category,
    rankChange: d.rankChange,
  }));

// ---- overall / weekly (メインランキング) ----
export const RANKING_OVERALL_WEEKLY = makeEntries('overall', 'weekly', [
  { userId: 'user_01', score: 14737, rankChange: 0 },
  { userId: 'user_02', score: 11477, rankChange: 1 },
  { userId: 'user_03', score: 10004, rankChange: -1 },
  { userId: 'user_01', score: 9354, rankChange: 2 },  // coord_09
  { userId: 'user_02', score: 7969, rankChange: 0 },
  { userId: 'user_03', score: 7154, rankChange: -1 },
  { userId: 'user_04', score: 6352, rankChange: 1 },
  { userId: 'user_05', score: 5756, rankChange: 0 },
  { userId: 'user_06', score: 5019, rankChange: -2 },
  { userId: 'user_07', score: 4468, rankChange: 0 },
]);

export const RANKING_OVERALL_MONTHLY = makeEntries('overall', 'monthly', [
  { userId: 'user_01', score: 48230, rankChange: 0 },
  { userId: 'user_02', score: 39180, rankChange: 1 },
  { userId: 'user_03', score: 35620, rankChange: -1 },
  { userId: 'user_04', score: 22400, rankChange: 2 },
  { userId: 'user_05', score: 19870, rankChange: 0 },
  { userId: 'user_06', score: 17340, rankChange: -1 },
  { userId: 'user_07', score: 14200, rankChange: 1 },
  { userId: 'user_08', score: 11500, rankChange: 0 },
  { userId: 'user_09', score: 5800, rankChange: 3 },
  { userId: 'user_10', score: 3200, rankChange: -1 },
]);

export const RANKING_OVERALL_DAILY = makeEntries('overall', 'daily', [
  { userId: 'user_01', score: 3200, rankChange: 1 },
  { userId: 'user_02', score: 2800, rankChange: -1 },
  { userId: 'user_03', score: 2400, rankChange: 0 },
  { userId: 'user_04', score: 1900, rankChange: 2 },
  { userId: 'user_05', score: 1600, rankChange: 0 },
  { userId: 'user_06', score: 1300, rankChange: -1 },
  { userId: 'user_07', score: 1100, rankChange: 1 },
  { userId: 'user_08', score: 900, rankChange: 0 },
  { userId: 'user_09', score: 600, rankChange: 2 },
  { userId: 'user_10', score: 400, rankChange: -1 },
]);

export const RANKING_OVERALL_ALLTIME = makeEntries('overall', 'alltime', [
  { userId: 'user_01', score: 198400, rankChange: 0 },
  { userId: 'user_02', score: 152300, rankChange: 0 },
  { userId: 'user_03', score: 128700, rankChange: 0 },
  { userId: 'user_04', score: 89200, rankChange: 0 },
  { userId: 'user_05', score: 74600, rankChange: 0 },
  { userId: 'user_06', score: 61300, rankChange: 0 },
  { userId: 'user_07', score: 48900, rankChange: 0 },
  { userId: 'user_08', score: 38200, rankChange: 0 },
  { userId: 'user_09', score: 12400, rankChange: 0 },
  { userId: 'user_10', score: 7800, rankChange: 0 },
]);

// ---- likes / weekly ----
export const RANKING_LIKES_WEEKLY = makeEntries('likes', 'weekly', [
  { userId: 'user_01', score: 2340, rankChange: 0 },
  { userId: 'user_02', score: 1890, rankChange: 1 },
  { userId: 'user_03', score: 1650, rankChange: -1 },
  { userId: 'user_01', score: 1540, rankChange: 0 },
  { userId: 'user_02', score: 1320, rankChange: 1 },
  { userId: 'user_03', score: 1180, rankChange: -1 },
  { userId: 'user_04', score: 1050, rankChange: 0 },
  { userId: 'user_05', score: 920, rankChange: 2 },
  { userId: 'user_06', score: 830, rankChange: -1 },
  { userId: 'user_07', score: 740, rankChange: 0 },
]);

// ---- saves / weekly ----
export const RANKING_SAVES_WEEKLY = makeEntries('saves', 'weekly', [
  { userId: 'user_01', score: 890, rankChange: 0 },
  { userId: 'user_02', score: 720, rankChange: 0 },
  { userId: 'user_03', score: 680, rankChange: 1 },
  { userId: 'user_01', score: 620, rankChange: -1 },
  { userId: 'user_02', score: 550, rankChange: 0 },
  { userId: 'user_03', score: 500, rankChange: 1 },
  { userId: 'user_04', score: 440, rankChange: 0 },
  { userId: 'user_05', score: 390, rankChange: -1 },
  { userId: 'user_06', score: 360, rankChange: 0 },
  { userId: 'user_07', score: 320, rankChange: 1 },
]);

// ---- votes / weekly ----
export const RANKING_VOTES_WEEKLY = makeEntries('votes', 'weekly', [
  { userId: 'user_01', score: 560, rankChange: 0 },
  { userId: 'user_02', score: 430, rankChange: 1 },
  { userId: 'user_03', score: 390, rankChange: -1 },
  { userId: 'user_01', score: 340, rankChange: 0 },
  { userId: 'user_02', score: 290, rankChange: 0 },
  { userId: 'user_03', score: 260, rankChange: 1 },
  { userId: 'user_04', score: 230, rankChange: -1 },
  { userId: 'user_05', score: 200, rankChange: 0 },
  { userId: 'user_06', score: 180, rankChange: 2 },
  { userId: 'user_07', score: 160, rankChange: -1 },
]);

// ---- newcomer / weekly ----
export const RANKING_NEWCOMER_WEEKLY = makeEntries('newcomer', 'weekly', [
  { userId: 'user_09', score: 2550, rankChange: 2 },
  { userId: 'user_10', score: 1877, rankChange: -1 },
  { userId: 'user_08', score: 1200, rankChange: 0 },
  { userId: 'user_07', score: 980, rankChange: 1 },
  { userId: 'user_06', score: 820, rankChange: -1 },
]);

// ---- lookup map ----
type RankingKey = `${RankingCategory}_${RankingPeriod}`;

export const RANKING_MAP: Record<string, RankingEntry[]> = {
  overall_daily: RANKING_OVERALL_DAILY,
  overall_weekly: RANKING_OVERALL_WEEKLY,
  overall_monthly: RANKING_OVERALL_MONTHLY,
  overall_alltime: RANKING_OVERALL_ALLTIME,
  likes_weekly: RANKING_LIKES_WEEKLY,
  saves_weekly: RANKING_SAVES_WEEKLY,
  votes_weekly: RANKING_VOTES_WEEKLY,
  newcomer_weekly: RANKING_NEWCOMER_WEEKLY,
};

export function getRankingData(category: RankingCategory, period: RankingPeriod): RankingEntry[] {
  const key: RankingKey = `${category}_${period}`;
  return RANKING_MAP[key] ?? RANKING_OVERALL_WEEKLY;
}
