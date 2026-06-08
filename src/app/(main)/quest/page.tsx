import { getQuestsByType } from '@/lib/data';
import { Check, Gift, Clock, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Quest } from '@/types';

function QuestCard({ quest }: { quest: Quest }) {
  const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));

  return (
    <div
      className={cn(
        'rounded-xl border p-4 space-y-3 transition-colors',
        quest.completed
          ? 'border-zinc-800 bg-zinc-900/50 opacity-60'
          : 'border-zinc-800 bg-zinc-900'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {quest.completed && (
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-600">
                <Check size={12} className="text-white" />
              </span>
            )}
            <p className={cn('text-sm font-semibold', quest.completed ? 'text-zinc-500 line-through' : 'text-white')}>
              {quest.title}
            </p>
          </div>
          <p className="mt-0.5 text-xs text-zinc-600">{quest.description}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-zinc-700 px-2.5 py-1">
          <Gift size={12} style={{ color: '#F5A623' }} />
          <span className="text-xs font-bold" style={{ color: '#F5A623' }}>
            +{quest.rewardPoints}pt
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-zinc-600">
          <span>{quest.progress} / {quest.target}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: quest.completed ? '#6b7280' : '#F5A623',
            }}
          />
        </div>
      </div>

      {/* Expiry */}
      <div className="flex items-center gap-1 text-xs text-zinc-600">
        <Clock size={11} />
        <span>
          {new Date(quest.expiresAt).toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })} まで
        </span>
      </div>
    </div>
  );
}

export default function QuestPage() {
  const dailyQuests = getQuestsByType('daily');
  const weeklyQuests = getQuestsByType('weekly');

  const dailyCompleted = dailyQuests.filter((q) => q.completed).length;
  const weeklyCompleted = weeklyQuests.filter((q) => q.completed).length;
  const totalPoints = [...dailyQuests, ...weeklyQuests]
    .filter((q) => q.completed)
    .reduce((s, q) => s + q.rewardPoints, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Swords size={20} style={{ color: '#F5A623' }} />
        <h1 className="text-xl font-bold text-white">クエスト</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'デイリー達成', value: `${dailyCompleted}/${dailyQuests.length}` },
          { label: 'ウィークリー達成', value: `${weeklyCompleted}/${weeklyQuests.length}` },
          { label: '獲得ポイント', value: `${totalPoints}pt` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-center">
            <p className="text-base font-bold" style={{ color: '#F5A623' }}>{value}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Daily */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">
            デイリークエスト
            <span className="ml-2 text-zinc-600">({dailyCompleted}/{dailyQuests.length})</span>
          </h2>
          <span className="text-xs text-zinc-600">毎日0時リセット</span>
        </div>
        {dailyQuests.map((q) => <QuestCard key={q.id} quest={q} />)}
      </section>

      {/* Weekly */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">
            ウィークリークエスト
            <span className="ml-2 text-zinc-600">({weeklyCompleted}/{weeklyQuests.length})</span>
          </h2>
          <span className="text-xs text-zinc-600">毎週月曜リセット</span>
        </div>
        {weeklyQuests.map((q) => <QuestCard key={q.id} quest={q} />)}
      </section>
    </div>
  );
}
