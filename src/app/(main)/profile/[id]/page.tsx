import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUserById, getCoordinatesByUser } from '@/lib/data';
import { CoordinateCard } from '@/components/feed/CoordinateCard';
import { Settings2, Trophy } from 'lucide-react';

const RANK_COLORS: Record<string, string> = {
  S: 'bg-yellow-400 text-black',
  A: 'bg-purple-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-green-600 text-white',
  D: 'bg-zinc-500 text-white',
};

const RANK_LABELS: Record<string, string> = {
  S: 'Style Master',
  A: 'Style Expert',
  B: 'Style Player',
  C: 'Style Starter',
  D: 'Newcomer',
};

const NEXT_RANK_POINTS: Record<string, number> = {
  D: 1000,
  C: 3000,
  B: 6000,
  A: 9000,
  S: Infinity,
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const user = getUserById(id);
  if (!user) notFound();

  const posts = getCoordinatesByUser(id);
  const isCurrentUser = id === 'user_01';

  const nextThreshold = NEXT_RANK_POINTS[user.rank];
  const rankPct = nextThreshold === Infinity
    ? 100
    : Math.min(100, Math.round((user.rankPoints / nextThreshold) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-zinc-700">
            <Image src={user.avatar} alt={user.displayName} fill className="object-cover" sizes="80px" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{user.displayName}</h1>
              <span className={`rounded px-2 py-0.5 text-sm font-bold ${RANK_COLORS[user.rank]}`}>
                {user.rank}
              </span>
            </div>
            <p className="text-sm text-zinc-500">@{user.username}</p>
            <p className="mt-0.5 text-xs text-zinc-600">{RANK_LABELS[user.rank]}</p>
          </div>
        </div>
        {isCurrentUser && (
          <Link href="/settings" className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:border-zinc-500">
            <Settings2 size={18} />
          </Link>
        )}
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-sm text-zinc-400 leading-relaxed">{user.bio}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
        {[
          { label: '投稿', value: user.postCount },
          { label: 'フォロワー', value: user.followersCount.toLocaleString() },
          { label: 'フォロー中', value: user.followingCount.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="py-4 text-center">
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Rank progress */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={14} style={{ color: '#F5A623' }} />
            <span className="text-sm font-medium text-zinc-300">ランクポイント</span>
          </div>
          <span className="text-sm font-bold" style={{ color: '#F5A623' }}>
            {user.rankPoints.toLocaleString()} pt
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-2 rounded-full"
            style={{ width: `${rankPct}%`, backgroundColor: '#F5A623' }}
          />
        </div>
        {nextThreshold !== Infinity && (
          <p className="text-xs text-zinc-600">
            次のランクまで {(nextThreshold - user.rankPoints).toLocaleString()} pt
          </p>
        )}
        {nextThreshold === Infinity && (
          <p className="text-xs text-zinc-600">最高ランク達成！</p>
        )}
      </div>

      {/* Action button */}
      {!isCurrentUser && (
        <button
          className="w-full rounded-xl py-3 text-sm font-bold text-black"
          style={{ backgroundColor: '#F5A623' }}
        >
          フォローする
        </button>
      )}

      {/* Posts grid */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300">
          投稿コーデ
          <span className="ml-2 text-zinc-600">({posts.length})</span>
        </h2>
        {posts.length === 0 ? (
          <div className="py-12 text-center text-zinc-600">まだ投稿がありません</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {posts.map((post) => (
              <CoordinateCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
