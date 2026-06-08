import { getUsers, getCoordinates, getMarketplaceListings, getQuests } from '@/lib/data';
import { Users, Image, ShoppingBag, Activity, TrendingUp, Crown, Shield } from 'lucide-react';

export default function AdminPage() {
  const users = getUsers();
  const coords = getCoordinates();
  const listings = getMarketplaceListings();
  const quests = getQuests();

  const activeListings = listings.length;
  const totalLikes = coords.reduce((s, c) => s + c.likeCount, 0);
  const totalVotes = coords.reduce((s, c) => s + c.voteCount, 0);
  const completedQuests = quests.filter((q) => q.completed).length;

  const rankDist = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.rank] = (acc[u.rank] ?? 0) + 1;
    return acc;
  }, {});

  const topPosters = [...users]
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 5);

  const stats = [
    { label: '総ユーザー数', value: users.length, icon: Users, color: 'text-blue-400' },
    { label: '総投稿数', value: coords.length, icon: Image, color: 'text-purple-400' },
    { label: '出品中', value: activeListings, icon: ShoppingBag, color: 'text-[#F5A623]' },
    { label: 'DAU (mock)', value: Math.round(users.length * 0.6), icon: Activity, color: 'text-green-400' },
    { label: '総いいね数', value: totalLikes.toLocaleString(), icon: TrendingUp, color: 'text-red-400' },
    { label: '総Vote数', value: totalVotes.toLocaleString(), icon: TrendingUp, color: 'text-[#F5A623]' },
    { label: 'クエスト達成数', value: completedQuests, icon: Crown, color: 'text-yellow-400' },
    { label: '総スコア', value: coords.reduce((s, c) => s + c.score, 0).toLocaleString(), icon: Activity, color: 'text-purple-400' },
  ];

  const RANK_COLORS: Record<string, string> = {
    S: 'bg-yellow-400 text-black',
    A: 'bg-purple-500 text-white',
    B: 'bg-blue-500 text-white',
    C: 'bg-green-600 text-white',
    D: 'bg-zinc-500 text-white',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield size={20} style={{ color: '#F5A623' }} />
        <h1 className="text-xl font-bold text-white">管理画面</h1>
        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-500">Admin</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
            <Icon size={18} className={color} />
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Rank distribution */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300">ランク分布</h2>
        <div className="space-y-2">
          {(['S', 'A', 'B', 'C', 'D'] as const).map((rank) => {
            const count = rankDist[rank] ?? 0;
            const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
            return (
              <div key={rank} className="flex items-center gap-3">
                <span className={`w-7 rounded px-1.5 py-0.5 text-center text-xs font-bold ${RANK_COLORS[rank]}`}>{rank}</span>
                <div className="flex-1 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-2 rounded-full bg-zinc-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-xs text-zinc-500">{count}人</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top posters */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300">投稿数ランキング</h2>
        <div className="space-y-2">
          {topPosters.map((user, i) => (
            <div key={user.id} className="flex items-center gap-3">
              <span className="w-5 text-center text-xs font-bold text-zinc-600">{i + 1}</span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${RANK_COLORS[user.rank]}`}>{user.rank}</span>
              <span className="flex-1 text-sm text-zinc-300">{user.displayName}</span>
              <span className="text-sm font-bold text-white">{user.postCount}件</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity mock */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300">最近のアクティビティ</h2>
        <div className="space-y-2 text-xs text-zinc-500">
          {[
            { time: '10分前', msg: 'user_09 が新しいコーデを投稿しました' },
            { time: '25分前', msg: 'listing_09 (Supreme Box Logo) が売れました' },
            { time: '1時間前', msg: 'user_01 がランキング1位を維持しています' },
            { time: '2時間前', msg: 'デイリークエストのリセットが完了しました' },
            { time: '3時間前', msg: 'user_10 が新規登録しました' },
          ].map(({ time, msg }) => (
            <div key={msg} className="flex gap-3">
              <span className="w-14 flex-shrink-0 text-zinc-700">{time}</span>
              <span>{msg}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
