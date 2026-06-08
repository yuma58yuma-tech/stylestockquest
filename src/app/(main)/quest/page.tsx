import { createClient } from '@/lib/supabase/server';
import { Check, Gift, Clock, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Quest } from '@/types';

function todayStart() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString();
}
function weekStart() {
  const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString();
}

function QuestCard({ quest }: { quest: Quest }) {
  const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));
  return (
    <div className={cn('rounded-xl border p-4 space-y-3 transition-colors',
      quest.completed ? 'border-zinc-800 bg-zinc-900/50 opacity-60' : 'border-zinc-800 bg-zinc-900')}>
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
          <span className="text-xs font-bold" style={{ color: '#F5A623' }}>+{quest.rewardPoints}pt</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-zinc-600">
          <span>{quest.progress} / {quest.target}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div className="h-2 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: quest.completed ? '#6b7280' : '#F5A623' }} />
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-zinc-600">
        <Clock size={11} />
        <span>{quest.expiresAt}</span>
      </div>
    </div>
  );
}

export default async function QuestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = todayStart();
  const thisWeek = weekStart();

  // デイリー: 今日の投稿数
  const [postsToday, likesToday, closetToday, votesToday, followsToday] = await Promise.all([
    user ? supabase.from('coordinates').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', today) : Promise.resolve({ count: 0 }),
    user ? supabase.from('likes').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', today) : Promise.resolve({ count: 0 }),
    user ? supabase.from('closet_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', today) : Promise.resolve({ count: 0 }),
    user ? supabase.from('votes').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', today) : Promise.resolve({ count: 0 }),
    user ? supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', user.id).gte('created_at', today) : Promise.resolve({ count: 0 }),
  ]);

  // ウィークリー
  const [postsWeek, likesWeek, followsWeek] = await Promise.all([
    user ? supabase.from('coordinates').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', thisWeek) : Promise.resolve({ count: 0 }),
    user ? supabase.from('likes').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', thisWeek) : Promise.resolve({ count: 0 }),
    user ? supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', user.id).gte('created_at', thisWeek) : Promise.resolve({ count: 0 }),
  ]);

  const now = new Date();
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59);
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + (7 - now.getDay()));

  const dailyQuests: Quest[] = [
    { id: 'd1', title: '今日のコーデを投稿しよう', description: 'コーデを1件投稿するとクリア。', type: 'daily', progress: Math.min(postsToday.count ?? 0, 1), target: 1, completed: (postsToday.count ?? 0) >= 1, rewardPoints: 100, expiresAt: todayEnd.toLocaleString('ja-JP') },
    { id: 'd2', title: '3件のコーデにいいねしよう', description: '他のユーザーのコーデに3件いいねするとクリア。', type: 'daily', progress: Math.min(likesToday.count ?? 0, 3), target: 3, completed: (likesToday.count ?? 0) >= 3, rewardPoints: 50, expiresAt: todayEnd.toLocaleString('ja-JP') },
    { id: 'd3', title: 'クローゼットにアイテムを追加しよう', description: 'クローゼットにアイテムを1件登録するとクリア。', type: 'daily', progress: Math.min(closetToday.count ?? 0, 1), target: 1, completed: (closetToday.count ?? 0) >= 1, rewardPoints: 50, expiresAt: todayEnd.toLocaleString('ja-JP') },
    { id: 'd4', title: 'コーデに投票しよう', description: 'Voteを1件するとクリア。', type: 'daily', progress: Math.min(votesToday.count ?? 0, 1), target: 1, completed: (votesToday.count ?? 0) >= 1, rewardPoints: 75, expiresAt: todayEnd.toLocaleString('ja-JP') },
    { id: 'd5', title: '誰かをフォローしよう', description: '新しいユーザーを1人フォローするとクリア。', type: 'daily', progress: Math.min(followsToday.count ?? 0, 1), target: 1, completed: (followsToday.count ?? 0) >= 1, rewardPoints: 30, expiresAt: todayEnd.toLocaleString('ja-JP') },
  ];

  const weeklyQuests: Quest[] = [
    { id: 'w1', title: '週5コーデ達成', description: '今週5件以上コーデを投稿するとクリア。', type: 'weekly', progress: Math.min(postsWeek.count ?? 0, 5), target: 5, completed: (postsWeek.count ?? 0) >= 5, rewardPoints: 500, expiresAt: weekEnd.toLocaleString('ja-JP') },
    { id: 'w2', title: '20件いいねしよう', description: '今週20件いいねするとクリア。', type: 'weekly', progress: Math.min(likesWeek.count ?? 0, 20), target: 20, completed: (likesWeek.count ?? 0) >= 20, rewardPoints: 300, expiresAt: weekEnd.toLocaleString('ja-JP') },
    { id: 'w3', title: '5人フォローしよう', description: '今週5人フォローするとクリア。', type: 'weekly', progress: Math.min(followsWeek.count ?? 0, 5), target: 5, completed: (followsWeek.count ?? 0) >= 5, rewardPoints: 200, expiresAt: weekEnd.toLocaleString('ja-JP') },
  ];

  const dailyCompleted = dailyQuests.filter((q) => q.completed).length;
  const weeklyCompleted = weeklyQuests.filter((q) => q.completed).length;
  const totalPoints = [...dailyQuests, ...weeklyQuests].filter((q) => q.completed).reduce((s, q) => s + q.rewardPoints, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Swords size={20} style={{ color: '#F5A623' }} />
        <h1 className="text-xl font-bold text-white">クエスト</h1>
      </div>

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

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">デイリークエスト <span className="ml-2 text-zinc-600">({dailyCompleted}/{dailyQuests.length})</span></h2>
          <span className="text-xs text-zinc-600">毎日0時リセット</span>
        </div>
        {dailyQuests.map((q) => <QuestCard key={q.id} quest={q} />)}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">ウィークリークエスト <span className="ml-2 text-zinc-600">({weeklyCompleted}/{weeklyQuests.length})</span></h2>
          <span className="text-xs text-zinc-600">毎週月曜リセット</span>
        </div>
        {weeklyQuests.map((q) => <QuestCard key={q.id} quest={q} />)}
      </section>

      {!user && (
        <p className="text-center text-sm text-zinc-600">ログインするとクエスト進捗が記録されます</p>
      )}
    </div>
  );
}
