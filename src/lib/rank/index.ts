import type { RankTier, XPEvent, XPEventKind } from '@/types';

const XP_TABLE: Record<XPEventKind, number> = {
  post: 50,
  like_received: 3,
  save_received: 5,
  vote_received: 10,
  comment_received: 2,
  ranking_award: 500,
  item_sold: 100,
  quest_completed: 100,
};

const TIER_THRESHOLDS: { tier: RankTier; minXP: number }[] = [
  { tier: 'ArchiveKing', minXP: 50000 },
  { tier: 'Legend',      minXP: 25000 },
  { tier: 'Master',      minXP: 12000 },
  { tier: 'Diamond',     minXP: 6000  },
  { tier: 'Platinum',    minXP: 3000  },
  { tier: 'Gold',        minXP: 1500  },
  { tier: 'Silver',      minXP: 700   },
  { tier: 'Bronze',      minXP: 300   },
  { tier: 'Rookie',      minXP: 100   },
  { tier: 'Beginner',    minXP: 0     },
];

export function calcXPFromEvent(event: XPEvent): number {
  const base = XP_TABLE[event.kind];
  return Math.round(base * (event.multiplier ?? 1));
}

export function getRankTier(totalXP: number): RankTier {
  for (const { tier, minXP } of TIER_THRESHOLDS) {
    if (totalXP >= minXP) return tier;
  }
  return 'Beginner';
}

export function getNextTier(current: RankTier): RankTier | null {
  const idx = TIER_THRESHOLDS.findIndex((t) => t.tier === current);
  return idx > 0 ? TIER_THRESHOLDS[idx - 1].tier : null;
}

export function getXPToNextTier(totalXP: number): number | null {
  const current = getRankTier(totalXP);
  const next = getNextTier(current);
  if (!next) return null;
  const threshold = TIER_THRESHOLDS.find((t) => t.tier === next)!.minXP;
  return threshold - totalXP;
}
