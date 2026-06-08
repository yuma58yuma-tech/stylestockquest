'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp, ArrowDown, Minus, Swords, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { getRanking } from '@/lib/data';
import { getScoreBreakdown } from '@/lib/score';
import type { RankingCategory, RankingPeriod, RankingEntryWithUser, ScoreBreakdown } from '@/types';

const PERIOD_TABS: { value: RankingPeriod; label: string }[] = [
  { value: 'daily',   label: 'DAY' },
  { value: 'weekly',  label: 'WEEK' },
  { value: 'monthly', label: 'MONTH' },
  { value: 'alltime', label: 'ALL TIME' },
];

const CATEGORY_TABS: { value: RankingCategory; label: string }[] = [
  { value: 'overall',  label: 'Overall' },
  { value: 'likes',    label: 'Likes' },
  { value: 'saves',    label: 'Saves' },
  { value: 'votes',    label: 'Votes' },
  { value: 'newcomer', label: 'Rookie' },
];

const RANK_BADGE: Record<string, string> = {
  S: 'bg-[#F5A623] text-black',
  A: 'bg-purple-600 text-white',
  B: 'bg-blue-600 text-white',
  C: 'bg-emerald-700 text-white',
  D: 'bg-zinc-700 text-zinc-300',
};

function PowerBar({ breakdown }: { breakdown: ScoreBreakdown }) {
  const total = breakdown.peerScore + breakdown.activityScore;
  const peerPct = total > 0 ? (breakdown.peerScore / total) * 100 : 70;
  const actPct  = 100 - peerPct;
  return (
    <div className="w-full">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full bg-[#F5A623]" style={{ width: `${peerPct.toFixed(1)}%` }} />
        <div className="h-full bg-zinc-500"  style={{ width: `${actPct.toFixed(1)}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-2.5 rounded-sm bg-[#F5A623]" />
          他人評価 {breakdown.peerScore.toLocaleString()}pt
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-2.5 rounded-sm bg-zinc-500" />
          自己活動 {breakdown.activityScore.toLocaleString()}pt
        </span>
      </div>
    </div>
  );
}

function BattleRecord({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [bd,   setBd]   = useState<ScoreBreakdown | null>(null);

  const handleToggle = () => {
    if (!open && !bd) setBd(getScoreBreakdown(userId));
    setOpen((v) => !v);
  };

  return (
    <div className="w-full">
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        <span>なぜこのスコア？</span>
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {open && bd && (
        <div className="mt-2 rounded border border-zinc-800 bg-[#0d0d0d] p-3 text-[10px] text-zinc-500">
          <p className="mb-1.5 text-[10px] font-semibold text-[#F5A623]">他人からの評価 × 0.7</p>
          <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1">
            <span>Vote</span>          <span className="text-right font-mono text-zinc-300">{bd.breakdown.votes} × 20 = {bd.breakdown.votes * 20}pt</span>
            <span>保存</span>          <span className="text-right font-mono text-zinc-300">{bd.breakdown.saves} × 10 = {bd.breakdown.saves * 10}pt</span>
            <span>いいね</span>        <span className="text-right font-mono text-zinc-300">{bd.breakdown.likes} × 5 = {bd.breakdown.likes * 5}pt</span>
            <span>コメント</span>      <span className="text-right font-mono text-zinc-300">{bd.breakdown.comments} × 3 = {bd.breakdown.comments * 3}pt</span>
            <span>商品購入</span>      <span className="text-right font-mono text-zinc-300">{bd.breakdown.purchases} × 50 = {bd.breakdown.purchases * 50}pt</span>
          </div>
          <p className="mb-1.5 text-[10px] font-semibold text-zinc-400">自己アクティビティ × 0.3</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span>ログイン</span>      <span className="text-right font-mono text-zinc-300">{bd.breakdown.loginDays}日 × 2 = {bd.breakdown.loginDays * 2}pt</span>
            <span>出品</span>          <span className="text-right font-mono text-zinc-300">{bd.breakdown.listings} × 5 = {bd.breakdown.listings * 5}pt</span>
            <span>レビュー avg</span>  <span className="text-right font-mono text-zinc-300">{bd.breakdown.reviews} × 10 = {Math.round(bd.breakdown.reviews * 10)}pt</span>
            <span>投稿</span>          <span className="text-right font-mono text-zinc-300">{bd.breakdown.posts} × 3 = {bd.breakdown.posts * 3}pt</span>
            <span>Quest</span>         <span className="text-right font-mono text-zinc-300">{bd.breakdown.quests} × 15 = {bd.breakdown.quests * 15}pt</span>
          </div>
        </div>
      )}
    </div>
  );
}

function RankChange({ change }: { change: number }) {
  if (change > 0) return <span className="flex items-center gap-0.5 text-[10px] text-emerald-500"><ArrowUp size={10} />{change}</span>;
  if (change < 0) return <span className="flex items-center gap-0.5 text-[10px] text-red-500"><ArrowDown size={10} />{Math.abs(change)}</span>;
  return <Minus size={10} className="text-zinc-700" />;
}

const CATEGORY_COL: Record<RankingCategory, string> = {
  overall: 'score', likes: 'like_count', saves: 'save_count',
  votes: 'vote_count', newcomer: 'score',
};

function periodFilter(period: RankingPeriod): string | null {
  const now = new Date();
  if (period === 'daily')   { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.toISOString(); }
  if (period === 'weekly')  { const d = new Date(now); d.setDate(now.getDate() - 7); return d.toISOString(); }
  if (period === 'monthly') { const d = new Date(now); d.setMonth(now.getMonth() - 1); return d.toISOString(); }
  return null;
}

type DbRow = {
  user_id: string; score: number; like_count: number; save_count: number; vote_count: number; created_at: string;
  profiles: { username: string; display_name: string | null; avatar_url: string | null; rank: string; rank_points: number } | null;
};

async function fetchRankings(category: RankingCategory, period: RankingPeriod): Promise<RankingEntryWithUser[]> {
  const supabase = createClient();
  const col   = CATEGORY_COL[category];
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
        username:    row.profiles?.username    ?? 'unknown',
        displayName: row.profiles?.display_name ?? row.profiles?.username ?? 'unknown',
        avatar:      row.profiles?.avatar_url   ?? `https://picsum.photos/seed/${row.user_id}/200`,
        bio: '', rank: 'B' as const,
        rankPoints:    row.profiles?.rank_points ?? 0,
        followersCount: 0, followingCount: 0, postCount: 0, createdAt: '',
      },
    }));
}

interface Props { initialEntries: RankingEntryWithUser[] }

export function RankingClient({ initialEntries }: Props) {
  const [period,   setPeriod]   = useState<RankingPeriod>('weekly');
  const [category, setCategory] = useState<RankingCategory>('overall');
  const [entries,  setEntries]  = useState<RankingEntryWithUser[]>(initialEntries);
  const [loading,  setLoading]  = useState(false);

  const handleChange = async (newPeriod: RankingPeriod, newCategory: RankingCategory) => {
    setPeriod(newPeriod); setCategory(newCategory);
    setLoading(true);
    const data = await fetchRankings(newCategory, newPeriod);
    setEntries(data);
    setLoading(false);
  };

  const top3 = entries.slice(0, 3);
  const rest  = entries.slice(3);

  return (
    <div className="min-h-screen bg-[#111111] text-white">

      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-5">
        <div className="flex items-center gap-2.5">
          <Swords size={18} className="text-[#F5A623]" />
          <div>
            <h1 className="text-base font-bold tracking-widest text-white uppercase">Style Battle</h1>
            <p className="text-[10px] tracking-widest text-zinc-600 uppercase">Ranking</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">

        {/* Period tabs */}
        <div className="flex overflow-hidden rounded-md border border-zinc-800">
          {PERIOD_TABS.map(({ value, label }) => (
            <button key={value} onClick={() => handleChange(value, category)}
              className={cn(
                'flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                period === value
                  ? 'bg-[#F5A623] text-black'
                  : 'bg-transparent text-zinc-500 hover:text-zinc-300'
              )}>
              {label}
            </button>
          ))}
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map(({ value, label }) => (
            <button key={value} onClick={() => handleChange(period, value)}
              className={cn(
                'flex-shrink-0 rounded border px-3 py-1 text-[11px] font-medium transition-colors',
                category === value
                  ? 'border-[#F5A623] text-[#F5A623]'
                  : 'border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400'
              )}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-zinc-600">読み込み中...</div>
        ) : (
          <>
            {/* Top 3 */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {[top3[1], top3[0], top3[2]].map((entry, displayIdx) => {
                  if (!entry) return <div key={displayIdx} />;
                  const isFirst = displayIdx === 1;
                  const medalColor = [, 'text-[#F5A623]', 'text-zinc-400', 'text-amber-700'][entry.rank];
                  const rankNum    = ['', '1st', '2nd', '3rd'][entry.rank];
                  return (
                    <Link key={entry.userId + entry.rank} href={`/profile/${entry.userId}`}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors',
                        isFirst ? 'border-[#F5A623]/40 bg-[#1a1500]' : 'border-zinc-800 bg-[#161616]'
                      )}>
                      <span className={cn('text-[10px] font-bold', medalColor)}>{rankNum}</span>
                      <div className={cn(
                        'relative overflow-hidden rounded-lg',
                        isFirst ? 'h-16 w-16 ring-1 ring-[#F5A623]/60' : 'h-12 w-12 ring-1 ring-zinc-700'
                      )}>
                        <Image src={entry.user.avatar} alt={entry.user.displayName} fill className="object-cover" sizes="64px" />
                      </div>
                      <div>
                        <p className={cn('font-semibold text-white', isFirst ? 'text-sm' : 'text-xs')}>{entry.user.displayName}</p>
                        <p className="text-[9px] text-zinc-600">@{entry.user.username}</p>
                      </div>
                      <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-bold', RANK_BADGE[entry.user.rank] ?? 'bg-zinc-700 text-zinc-300')}>
                        {entry.user.rank}
                      </span>
                      <span className={cn('font-mono font-bold', isFirst ? 'text-sm text-[#F5A623]' : 'text-xs text-zinc-300')}>
                        {entry.score.toLocaleString()}<span className="ml-0.5 text-[9px] font-normal text-zinc-600">pt</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Divider */}
            {rest.length > 0 && top3.length > 0 && (
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-[10px] tracking-widest text-zinc-700 uppercase">Contenders</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
            )}

            {/* List */}
            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((entry) => (
                  <div key={entry.userId + entry.rank}
                    className="rounded-lg border border-zinc-800 bg-[#161616] transition-colors hover:border-zinc-700">
                    <div className="flex items-center gap-3 px-3 py-3">
                      <span className="w-5 text-center font-mono text-xs text-zinc-600">{entry.rank}</span>
                      <Link href={`/profile/${entry.userId}`}
                        className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-zinc-800">
                        <Image src={entry.user.avatar} alt={entry.user.displayName} fill className="object-cover" sizes="36px" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/profile/${entry.userId}`}
                            className="text-sm font-medium text-white hover:text-[#F5A623] transition-colors">
                            {entry.user.displayName}
                          </Link>
                          <span className={cn('rounded px-1 py-0.5 text-[9px] font-bold', RANK_BADGE[entry.user.rank] ?? 'bg-zinc-700 text-zinc-300')}>
                            {entry.user.rank}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-600">@{entry.user.username}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono text-sm font-semibold text-[#F5A623]">
                          {entry.score.toLocaleString()}<span className="ml-0.5 text-[10px] font-normal text-zinc-600">pt</span>
                        </span>
                        <RankChange change={entry.rankChange} />
                      </div>
                    </div>
                    <div className="border-t border-zinc-900 px-3 py-2.5 space-y-2">
                      <PowerBar breakdown={getScoreBreakdown(entry.userId)} />
                      <BattleRecord userId={entry.userId} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {entries.length === 0 && (
              <div className="py-16 text-center text-sm text-zinc-600">データがありません</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
