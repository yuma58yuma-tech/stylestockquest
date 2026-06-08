'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp, ArrowDown, Minus, Crown, Medal, Award, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRanking } from '@/lib/data';
import type { RankingCategory, RankingPeriod, RankingEntryWithUser } from '@/types';

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
  S: 'bg-yellow-400 text-black',
  A: 'bg-purple-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-green-600 text-white',
  D: 'bg-zinc-500 text-white',
};

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

interface Props {
  initialEntries: RankingEntryWithUser[];
}

export function RankingClient({ initialEntries }: Props) {
  const [period, setPeriod] = useState<RankingPeriod>('weekly');
  const [category, setCategory] = useState<RankingCategory>('overall');
  const [entries, setEntries] = useState<RankingEntryWithUser[]>(initialEntries);

  const handleChange = (newPeriod: RankingPeriod, newCategory: RankingCategory) => {
    setPeriod(newPeriod);
    setCategory(newCategory);
    setEntries(getRanking(newCategory, newPeriod));
  };

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Trophy size={20} className="text-zinc-900" />
        <h1 className="text-xl font-bold text-zinc-900">ランキング</h1>
      </div>

      {/* Period tabs */}
      <div className="flex rounded-xl border border-zinc-200 bg-zinc-100 p-1">
        {PERIOD_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleChange(value, category)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors',
              period === value ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleChange(period, value)}
            className={cn(
              'flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              category === value
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[top3[1], top3[0], top3[2]].map((entry, displayIdx) => {
            if (!entry) return <div key={displayIdx} />;
            const isCenter = displayIdx === 1;
            return (
              <Link
                key={entry.userId + entry.rank}
                href={`/profile/${entry.userId}`}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors bg-white shadow-sm',
                  isCenter ? 'border-zinc-900' : 'border-zinc-100'
                )}
              >
                <TopBadge rank={entry.rank} />
                <div className={cn(
                  'relative overflow-hidden rounded-full',
                  isCenter ? 'h-16 w-16 ring-2 ring-zinc-900' : 'h-12 w-12'
                )}>
                  <Image src={entry.user.avatar} alt={entry.user.displayName} fill className="object-cover" sizes="64px" />
                </div>
                <span className={cn('font-semibold text-zinc-900', isCenter ? 'text-sm' : 'text-xs')}>
                  {entry.user.displayName}
                </span>
                <span className={cn('rounded px-1.5 py-0.5 text-xs font-bold', RANK_COLORS[entry.user.rank])}>
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

      {/* Rest of ranking */}
      {rest.length > 0 && (
        <div className="space-y-2">
          {rest.map((entry) => (
            <Link
              key={entry.userId + entry.rank}
              href={`/profile/${entry.userId}`}
              className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 shadow-sm hover:border-zinc-300 transition-colors"
            >
              <span className="w-6 text-center text-sm font-bold text-zinc-400">{entry.rank}</span>
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full">
                <Image src={entry.user.avatar} alt={entry.user.displayName} fill className="object-cover" sizes="36px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-zinc-900">{entry.user.displayName}</span>
                  <span className={`rounded px-1 py-0.5 text-xs font-bold ${RANK_COLORS[entry.user.rank]}`}>
                    {entry.user.rank}
                  </span>
                </div>
                <span className="text-xs text-zinc-400">@{entry.user.username}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-bold text-zinc-900">{entry.score.toLocaleString()} pt</span>
                <RankChange change={entry.rankChange} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <div className="py-16 text-center text-zinc-400">データがありません</div>
      )}
    </div>
  );
}
