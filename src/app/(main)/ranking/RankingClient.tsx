'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp, ArrowDown, Minus, Crown, Medal, Award, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { getRanking } from '@/lib/data';
import { getScoreBreakdown } from '@/lib/score';
import type { RankingCategory, RankingPeriod, RankingEntryWithUser, ScoreBreakdown } from '@/types';

const PERIOD_TABS: { value: RankingPeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'alltime', label: 'AllTime' },
];

const CATEGORY_TABS: { value: RankingCategory; label: string }[] = [
  { value: 'overall', label: 'Overall' },
  { value: 'likes', label: 'Likes' },
  { value: 'saves', label: 'Saves' },
  { value: 'votes', label: 'Votes' },
  { value: 'newcomer', label: 'Rookie' },
];

const RANK_COLORS: Record<string, string> = {
  S: 'bg-yellow-400 text-black', A: 'bg-purple-500 text-white',
  B: 'bg-blue-500 text-white', C: 'bg-green-600 text-white', D: 'bg-zinc-500 text-white',
  Bronze: 'bg-amber-700 text-white', Silver: 'bg-zinc-400 text-black',
  Gold: 'bg-yellow-400 text-black', Platinum: 'bg-cyan-300 text-black',
};

function ScoreBar({ breakdown }: { breakdown: ScoreBreakdown }) {
  const total = breakdown.peerScore + breakdown.activityScore;
  const peerPct = total > 0 ? (breakdown.peerScore / total) * 100 : 70;
  const actPct = 100 - peerPct;
  return (
    <div className="w-full">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-100">
        <div className="bg-yellow-400 transition-all" style={{ width: `${peerPct.toFixed(1)}%` }} />
        <div className="bg-blue-400 transition-all" style={{ width: `${actPct.toFixed(1)}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />他人評価 {breakdown.peerScore.toLocaleString()}pt</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-blue-400" />自己活動 {breakdown.activityScore.toLocaleString()}pt</span>
      </div>
    </div>
  );
}

function ScoreAccordion({ userId }: { userId: string }) {
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
        className="flex w-full items-center justify-between text-[11px] text-zinc-400 hover:text-zinc-600"
      >
        <span>なぜこのスコア？</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && bd && (
        <div className="mt-2 space-y-1 rounded-lg bg-zinc-50 p-2 text-[11px] text-zinc-600">
          <p className="mb-1 font-semibold text-zinc-700">他人からの評価（×0.7）</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span>Vote獲得 ×20pt</span><span className="text-right font-medium">{bd.breakdown.votes}件 = {bd.breakdown.votes * 20}pt</span>
            <span>保存獲得 ×10pt</span><span className="text-right font-medium">{bd.breakdown.saves}件 = {bd.breakdown.saves * 10}pt</span>
            <span>いいね獲得 ×5pt</span><span className="text-right font-medium">{bd.breakdown.likes}件 = {bd.breakdown.likes * 5}pt</span>
            <span>コメント獲得 ×3pt</span><span className="text-right font-medium">{bd.breakdown.comments}件 = {bd.breakdown.comments * 3}pt</span>
            <span>商品購入 ×50pt</span><span className="text-right font-medium">{bd.breakdown.purchases}件 = {bd.breakdown.purchases * 50}pt</span>
          </div>
          <p className="mb-1 mt-2 font-semibold text-zinc-700">自己アクティビティ（×0.3）</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            <span>ログイン ×2pt/日</span><span className="text-right font-medium">{bd.breakdown.loginDays}日 = {bd.breakdown.loginDays * 2}pt</span>
            <span>出品数 ×5pt</span><span className="text-right font-medium">{bd.breakdown.listings}件 = {bd.breakdown.listings * 5}pt</span>
            <span>レビュー評価 ×10pt</span><span className="text-right font-medium">avg {bd.breakdown.reviews} = {Math.round(bd.breakdown.reviews * 10)}pt</span>
            <span>投稿数 ×3pt</span><span className="text-right font-medium">{bd.breakdown.posts}件 = {bd.breakdown.posts * 3}pt</span>
            <span>Quest達成 ×15pt</span><span className="text-right font-medium">{bd.breakdown.quests}件 = {bd.breakdown.quests * 15}pt</span>
          </div>
        </div>
      )}
    </div>
  );
}

function TopBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={20} className="text-yellow-400" />;
  if (rank === 2) return <Medal size={20} className="text-zinc-300" />;
  if (rank === 3) return <Award size={20} className="text-amber-600" />;
  return null;
}

function RankChange({ change }: { change: number }) {
  if (change > 0) return <span className="flex items-center gap-0.5 text-xs text-green-400"><ArrowUp size={11} />{change}</span>;
  if (change < 0) return <span className="flex items-center gap-0.5 text-xs text-red-400"><ArrowDown size={11} />{Math.abs(change)}</span>;
  return <span className="text-zinc-600"><Minus size={11} /></span>;
}

// カテゴリ→DBカラム
const CATEGORY_COL: Record<RankingCategory, string> = {
  overall: 'score', likes: 'like_count', saves: 'save_count',
  votes: 'vote_count', newcomer: 'score',
};

// 期間→フィルタ日付
function periodFilter(period: RankingPeriod): string | null {
  const now = new Date();
  if (period === 'daily') {
    const d = new Date(now); d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  if (period === 'weekly') {
    const d = new Date(now); d.setDate(now.getDate() - 7);
    return d.toISOString();
  }
  if (period === 'monthly') {
    const d = new Date(now); d.setMonth(now.getMonth() - 1);
    return d.toISOString();
  }
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

  if (error || !data || data.length === 0) {
    return getRanking(category, period);
  }

  const seen = new Set<string>();
  return (data as unknown as DbRow[])
    .filter((row) => { if (seen.has(row.user_id)) return false; seen.add(row.user_id); return true; })
    .map((row, i) => ({
      userId: row.user_id,
      rank: i + 1,
      score: Number(row[col as keyof DbRow] ?? row.score),
      period,
      category,
      rankChange: 0,
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
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Trophy size={20} className="text-zinc-900" />
        <h1 className="text-xl font-bold text-zinc-900">ランキング</h1>
      </div>

      <div className="flex rounded-xl border border-zinc-200 bg-zinc-100 p-1">
        {PERIOD_TABS.map(({ value, label }) => (
          <button key={value} onClick={() => handleChange(value, category)}
            className={cn('flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors',
              period === value ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-700')}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map(({ value, label }) => (
          <button key={value} onClick={() => handleChange(period, value)}
            className={cn('flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              category === value ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400')}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-zinc-400 text-sm">読み込み中...</div>
      ) : (
        <>
          {top3.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {[top3[1], top3[0], top3[2]].map((entry, displayIdx) => {
                if (!entry) return <div key={displayIdx} />;
                const isCenter = displayIdx === 1;
                return (
                  <Link key={entry.userId + entry.rank} href={`/profile/${entry.userId}`}
                    className={cn('flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors bg-white shadow-sm',
                      isCenter ? 'border-zinc-900' : 'border-zinc-100')}>
                    <TopBadge rank={entry.rank} />
                    <div className={cn('relative overflow-hidden rounded-full', isCenter ? 'h-16 w-16 ring-2 ring-zinc-900' : 'h-12 w-12')}>
                      <Image src={entry.user.avatar} alt={entry.user.displayName} fill className="object-cover" sizes="64px" />
                    </div>
                    <span className={cn('font-semibold text-zinc-900', isCenter ? 'text-sm' : 'text-xs')}>{entry.user.displayName}</span>
                    <span className={cn('rounded px-1.5 py-0.5 text-xs font-bold', RANK_COLORS[entry.user.rank] ?? 'bg-zinc-500 text-white')}>
                      {entry.user.rank}
                    </span>
                    <span className={cn('font-bold text-zinc-700', isCenter ? 'text-sm' : 'text-xs')}>
                      {entry.score.toLocaleString()} pt
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {rest.length > 0 && (
            <div className="space-y-2">
              {rest.map((entry) => (
                <div key={entry.userId + entry.rank}
                  className="rounded-xl border border-zinc-100 bg-white px-4 py-3 shadow-sm hover:border-zinc-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm font-bold text-zinc-400">{entry.rank}</span>
                    <Link href={`/profile/${entry.userId}`} className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full">
                      <Image src={entry.user.avatar} alt={entry.user.displayName} fill className="object-cover" sizes="36px" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/profile/${entry.userId}`} className="text-sm font-medium text-zinc-900">{entry.user.displayName}</Link>
                        <span className={`rounded px-1 py-0.5 text-xs font-bold ${RANK_COLORS[entry.user.rank] ?? 'bg-zinc-500 text-white'}`}>
                          {entry.user.rank}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400">@{entry.user.username}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-zinc-900">{entry.score.toLocaleString()} pt</span>
                      <RankChange change={entry.rankChange} />
                    </div>
                  </div>
                  <div className="mt-2 space-y-1.5 pl-9">
                    <ScoreBar breakdown={getScoreBreakdown(entry.userId)} />
                    <ScoreAccordion userId={entry.userId} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {entries.length === 0 && (
            <div className="py-16 text-center text-zinc-400">データがありません</div>
          )}
        </>
      )}
    </div>
  );
}
