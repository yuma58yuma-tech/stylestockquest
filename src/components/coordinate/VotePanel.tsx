'use client';

import { useState } from 'react';
import type { VoteType } from '@/types';
import type { VoteRecord } from '@/mock/votes';

const VOTE_LABELS: Record<VoteType, string> = {
  BestFit:         'ベストフィット',
  Cool:            'クール',
  Unique:          'ユニーク',
  Clean:           'クリーン',
  Street:          'ストリート',
  Vintage:         'ヴィンテージ',
  ExpensiveLooking: '高見え',
  GoodColor:       '配色◎',
  WantToBuy:       '欲しい',
};

const ALL_VOTE_TYPES = Object.keys(VOTE_LABELS) as VoteType[];

interface Props {
  coordinateId: string;
  initialVotes: VoteRecord[];
}

export default function VotePanel({ coordinateId: _coordinateId, initialVotes }: Props) {
  const [counts, setCounts] = useState<Record<VoteType, number>>(() => {
    const map = {} as Record<VoteType, number>;
    for (const t of ALL_VOTE_TYPES) map[t] = 0;
    for (const v of initialVotes) map[v.voteType] = v.count;
    return map;
  });
  const [selected, setSelected] = useState<Set<VoteType>>(new Set());
  const [animating, setAnimating] = useState<VoteType | null>(null);

  function toggle(type: VoteType) {
    setAnimating(type);
    setTimeout(() => setAnimating(null), 300);

    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
        setCounts((c) => ({ ...c, [type]: Math.max(0, c[type] - 1) }));
      } else {
        next.add(type);
        setCounts((c) => ({ ...c, [type]: c[type] + 1 }));
      }
      return next;
    });
  }

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm space-y-3">
      <h2 className="text-sm font-semibold text-zinc-700">Vote でスタイルを評価</h2>
      <div className="grid grid-cols-3 gap-2">
        {ALL_VOTE_TYPES.map((type) => {
          const isSelected = selected.has(type);
          const isAnimating = animating === type;
          return (
            <button
              key={type}
              onClick={() => toggle(type)}
              className={[
                'flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-all duration-150',
                isSelected
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400',
                isAnimating ? 'scale-90' : 'scale-100',
              ].join(' ')}
            >
              <span className="text-xs font-semibold leading-tight">
                {VOTE_LABELS[type]}
              </span>
              <span className={`text-xs font-bold ${isSelected ? 'text-white/80' : 'text-zinc-400'}`}>
                {counts[type].toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
      {selected.size > 0 && (
        <p className="text-center text-xs text-zinc-500">
          {selected.size}種類のVoteを送りました
        </p>
      )}
    </div>
  );
}
