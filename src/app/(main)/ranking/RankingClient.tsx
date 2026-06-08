'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp, ArrowDown, Minus, Swords, ChevronDown, ChevronUp, Zap, Flame, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { getRanking } from '@/lib/data';
import { getScoreBreakdown } from '@/lib/score';
import type { RankingCategory, RankingPeriod, RankingEntryWithUser, ScoreBreakdown } from '@/types';

const PERIOD_TABS: { value: RankingPeriod; label: string }[] = [
  { value: 'daily', label: 'DAY' },
  { value: 'weekly', label: 'WEEK' },
  { value: 'monthly', label: 'MONTH' },
  { value: 'alltime', label: 'ALL TIME' },
];

const CATEGORY_TABS: { value: RankingCategory; label: string }[] = [
  { value: 'overall', label: 'OVERALL' },
  { value: 'likes', label: 'LIKES' },
  { value: 'saves', label: 'SAVES' },
  { value: 'votes', label: 'VOTES' },
  { value: 'newcomer', label: 'ROOKIE' },
];

const RANK_BADGE: Record<string, string> = {
  S: 'bg-amber-400 text-black shadow-[0_0_8px_#fbbf24]',
  A: 'bg-purple-500 text-white shadow-[0_0_8px_#a855f7]',
  B: 'bg-blue-500 text-white',
  C: 'bg-emerald-600 text-white',
  D: 'bg-zinc-600 text-white',
};

const TOP_GLOWS = [
  '',
  'shadow-[0_0_20px_#fbbf24,0_0_40px_#f59e0b44]',  // 1st gold
  'shadow-[0_0_14px_#94a3b8,0_0_28px_#94a3b844]',   // 2nd silver
  'shadow-[0_0_14px_#b45309,0_0_28px_#b4530944]',   // 3rd bronze
];

const TOP_RING = [
  '',
  'ring-2 ring-amber-400',
  'ring-2 ring-zinc-400',
  'ring-2 ring-amber-700',
];

const TOP_LABELS = ['', '👑 CHAMPION', '⚔ CHALLENGER', '⚔ CHALLENGER'];
const TOP_LABEL_COLORS = ['', 'text-amber-400', 'text-zinc-400', 'text-amber-700'];

// HP-bar style score breakdown
function PowerBar({ breakdown }: { breakdown: ScoreBreakdown }) {
  const total = breakdown.peerScore + breakdown.activityScore;
  const peerPct = total > 0 ? (breakdown.peerScore / total) * 100 : 70;
  const actPct = 100 - peerPct;
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-500">
        <span>POWER BREAKDOWN</span>
      </div>
      <div className="relative flex h-3 w-full overflow-hidden rounded-sm bg-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all"
          style={{ width: `${peerPct.toFixed(1)}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all"
          style={{ width: `${actPct.toFixed(1)}%` }}
        />
        {/* scanline overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.15)_3px,rgba(0,0,0,0.15)_4px)]" />
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-3 rounded-sm bg-amber-400" />
          他人評価 <span className="text-amber-400">{breakdown.peerScore.toLocaleString()}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-3 rounded-sm bg-cyan-400" />
          自己活動 <span className="text-cyan-400">{breakdown.activityScore.toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
}

function BattleRecord({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [bd, setBd] = useState<ScoreBreakdown | null>(null);

  const handleToggle = () => {
    if (!open && !bd) setBd(getScoreBreakdown(userId));
    setOpen((v) => !v);
  };

  return (
    <div className="w-full">
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        <span className="flex items-center gap-1"><ShieldAlert size={10} /> BATTLE RECORD</span>
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>
      {open && bd && (
        <div className="mt-2 rounded border border-zinc-800 bg-zinc-950 p-3 text-[10px]">
          <p className="mb-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-400">
            <Zap size={9} /> 他人からの評価 <span className="text-zinc-500">×0.7</span>
          </p>
          <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-zinc-400">
            <span>Vote</span><span className="text-right font-mono text-amber-300">{bd.breakdown.votes} × 20 = <span className="text-white">{bd.breakdown.votes * 20}</span></span>
            <span>保存</span><span className="text-right font-mono text-amber-300">{bd.breakdown.saves} × 10 = <span className="text-white">{bd.breakdown.saves * 10}</span></span>
            <span>いいね</span><span className="text-right font-mono text-amber-300">{bd.breakdown.likes} × 5 = <span className="text-white">{bd.breakdown.likes * 5}</span></span>
            <span>コメント</span><span className="text-right font-mono text-amber-300">{bd.breakdown.comments} × 3 = <span className="text-white">{bd.breakdown.comments * 3}</span></span>
            <span>商品購入</span><span className="text-right font-mono text-amber-300">{bd.breakdown.purchases} × 50 = <span className="text-white">{bd.breakdown.purchases * 50}</span></span>
          </div>
          <p className="mb-2 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-cyan-400">
            <Flame size={9} /> 自己アクティビティ <span className="text-zinc-500">×0.3</span>
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-zinc-400">
            <span>ログイン</span><span className="text-right font-mono text-cyan-300">{bd.breakdown.loginDays}日 × 2 = <span className="text-white">{bd.breakdown.loginDays * 2}</span></span>
            <span>出品</span><span className="text-right font-mono text-cyan-300">{bd.breakdown.listings} × 5 = <span className="text-white">{bd.breakdown.listings * 5}</span></span>
            <span>レビュー avg</span><span className="text-right font-mono text-cyan-300">{bd.breakdown.reviews} × 10 = <span className="text-white">{Math.round(bd.breakdown.reviews * 10)}</span></span>
            <span>投稿</span><span className="text-right font-mono text-cyan-300">{bd.breakdown.posts} × 3 = <span className="text-white">{bd.breakdown.posts * 3}</span></span>
            <span>Quest</span><span className="text-right font-mono text-cyan-300">{bd.breakdown.quests} × 15 = <span className="text-white">{bd.breakdown.quests * 15}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

function RankChange({ change }: { change: number }) {
  if (change > 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
      <ArrowUp size={10} />{change}
    </span>
  );
  if (change < 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-500">
      <ArrowDown size={10} />{Math.abs(change)}
    </span>
  );
  return <Minus size={10} className="text-zinc-700" />;
}

const CATEGORY_COL: Record<RankingCategory, string> = {
  overall: 'score', likes: 'like_count', saves: 'save_count',
  votes: 'vote_count', newcomer: 'score',
};

function periodFilter(period: RankingPeriod): string | null {
  const now = new Date();
  if (period === 'daily') { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.toISOString(); }
  if (period === 'weekly') { const d = new Date(now); d.setDate(now.getDate() - 7); return d.toISOString(); }
  if (period === 'monthly') { const d = new Date(now); d.setMonth(now.getMonth() - 1); return d.toISOString(); }
  return null;
}

type DbRow = {
  user_id: string; score: number; like_count: number; save_count: number; vote_count: number; created_at: string;
  profiles: { username: string; display_name: string | null; avatar_url: string | null; rank: string; rank_points: number } | null;
};

async function fetchRankings(category: RankingCategory, period: RankingPeriod): Promise<RankingEntryWithUser[]> {
  const supabase = createClient();
  const col = CATEGORY_COL[category];
  const since = periodFilter(period);

  let query = supabase
    .from('coordinates')
    .select('user_id, score, like_count, save_count, vote_count, created_at, profiles ( username, display_name, avatar_url, rank, rank_points )')
    .eq('is_public', true)
    .order(col, { ascending: false })
    .limit(20);

  if (since) query = query.gte('created_at', since);

  const { data, error } = await query;

  if (error || !data || data.length === 0) return getRanking(category, period);

  const seen = new Set<string>();
  return (data as unknown as DbRow[])
    .filter((row) => { if (seen.has(row.user_id)) return false; seen.add(row.user_id); return true; })
    .map((row, i) => ({
      userId: row.user_id, rank: i + 1,
      score: Number(row[col as keyof DbRow] ?? row.score),
      period, category, rankChange: 0,
      user: {
        id: row.user_id,
        username: row.profiles?.username ?? 'unknown',
        displayName: row.profiles?.display_name ?? row.profiles?.username ?? 'unknown',
        avatar: row.profiles?.avatar_url ?? `https://picsum.photos/seed/${row.user_id}/200`,
        bio: '', rank: 'B' as const,
        rankPoints: row.profiles?.rank_points ?? 0,
        followersCount: 0, followingCount: 0, postCount: 0, createdAt: '',
      },
    }));
}

interface Props { initialEntries: RankingEntryWithUser[] }

export function RankingClient({ initialEntries }: Props) {
  const [period, setPeriod] = useState<RankingPeriod>('weekly');
  const [category, setCategory] = useState<RankingCategory>('overall');
  const [entries, setEntries] = useState<RankingEntryWithUser[]>(initialEntries);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newPeriod: RankingPeriod, newCategory: RankingCategory) => {
    setPeriod(newPeriod); setCategory(newCategory);
    setLoading(true);
    const data = await fetchRankings(newCategory, newPeriod);
    setEntries(data);
    setLoading(false);
  };

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-zinc-800 bg-zinc-950 px-4 py-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#78350f22_0%,transparent_70%)]" />
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 ring-1 ring-amber-400/30">
            <Swords size={18} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-widest text-white">Style Battle</h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Fashion Power Ranking</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Period selector */}
        <div className="flex overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          {PERIOD_TABS.map(({ value, label }) => (
            <button key={value} onClick={() => handleChange(value, category)}
              className={cn(
                'flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
                period === value
                  ? 'bg-amber-400 text-black'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}>
              {label}
            </button>
          ))}
        </div>

        {/* Category selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map(({ value, label }) => (
            <button key={value} onClick={() => handleChange(period, value)}
              className={cn(
                'flex-shrink-0 rounded border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all',
                category === value
                  ? 'border-amber-400 bg-amber-400/10 text-amber-400 shadow-[0_0_8px_#fbbf2433]'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400'
              )}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Swords size={28} className="animate-pulse text-amber-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Loading battle data...</span>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length > 0 && (
              <div className="relative">
                {/* VS line */}
                <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-zinc-800" />
                <div className="grid grid-cols-3 gap-2">
                  {[top3[1], top3[0], top3[2]].map((entry, displayIdx) => {
                    if (!entry) return <div key={displayIdx} />;
                    const isChampion = displayIdx === 1;
                    return (
                      <Link key={entry.userId + entry.rank} href={`/profile/${entry.userId}`}
                        className={cn(
                          'group relative flex flex-col items-center gap-2 overflow-hidden rounded-lg border p-3 text-center transition-all',
                          isChampion
                            ? 'border-amber-400/50 bg-gradient-to-b from-amber-950/40 to-zinc-950'
                            : 'border-zinc-800 bg-zinc-950'
                        )}>
                        {/* bg glow */}
                        {isChampion && (
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#78350f33_0%,transparent_60%)]" />
                        )}

                        <span className={cn(
                          'text-[8px] font-black uppercase tracking-widest',
                          TOP_LABEL_COLORS[entry.rank]
                        )}>
                          {TOP_LABELS[entry.rank]}
                        </span>

                        <div className={cn(
                          'relative overflow-hidden transition-all',
                          isChampion ? 'h-16 w-16 rounded-xl' : 'h-11 w-11 rounded-lg',
                          TOP_RING[entry.rank],
                          TOP_GLOWS[entry.rank]
                        )}>
                          <Image src={entry.user.avatar} alt={entry.user.displayName} fill className="object-cover" sizes="64px" />
                        </div>

                        <div>
                          <p className={cn('font-black text-white', isChampion ? 'text-sm' : 'text-xs')}>
                            {entry.user.displayName}
                          </p>
                          <p className="text-[9px] text-zinc-600">@{entry.user.username}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-black', RANK_BADGE[entry.user.rank] ?? 'bg-zinc-700 text-white')}>
                            {entry.user.rank}
                          </span>
                        </div>

                        <div className={cn(
                          'rounded border px-2 py-0.5 font-mono font-black',
                          isChampion
                            ? 'border-amber-400/30 bg-amber-400/10 text-amber-300 text-sm'
                            : 'border-zinc-700 bg-zinc-900 text-zinc-300 text-xs'
                        )}>
                          {entry.score.toLocaleString()}
                          <span className="ml-0.5 text-[8px] font-normal text-zinc-500">pt</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Separator */}
            {rest.length > 0 && top3.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Contenders</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
            )}

            {/* Rest of ranking */}
            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((entry) => (
                  <div key={entry.userId + entry.rank}
                    className="group rounded-lg border border-zinc-800 bg-zinc-950 transition-all hover:border-zinc-700">
                    <div className="flex items-center gap-3 px-3 py-3">
                      {/* Rank number */}
                      <span className="w-6 text-center font-mono text-xs font-black text-zinc-600">
                        {entry.rank}
                      </span>

                      <Link href={`/profile/${entry.userId}`}
                        className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-zinc-800 transition-all group-hover:ring-zinc-600">
                        <Image src={entry.user.avatar} alt={entry.user.displayName} fill className="object-cover" sizes="36px" />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/profile/${entry.userId}`}
                            className="text-sm font-bold text-white hover:text-amber-300 transition-colors">
                            {entry.user.displayName}
                          </Link>
                          <span className={cn('rounded px-1 py-0.5 text-[9px] font-black', RANK_BADGE[entry.user.rank] ?? 'bg-zinc-700 text-white')}>
                            {entry.user.rank}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-600">@{entry.user.username}</span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono text-sm font-black text-amber-300">
                          {entry.score.toLocaleString()}
                          <span className="ml-0.5 text-[9px] font-normal text-zinc-600">pt</span>
                        </span>
                        <RankChange change={entry.rankChange} />
                      </div>
                    </div>

                    <div className="border-t border-zinc-900 px-3 py-2 space-y-2">
                      <PowerBar breakdown={getScoreBreakdown(entry.userId)} />
                      <BattleRecord userId={entry.userId} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {entries.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16">
                <Swords size={28} className="text-zinc-700" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">No fighters yet</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
