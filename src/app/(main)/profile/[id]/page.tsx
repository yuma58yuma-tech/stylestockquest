import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCoordinatesByUser } from '@/lib/data';
import { CoordinateCard } from '@/components/feed/CoordinateCard';
import { Settings2, Trophy } from 'lucide-react';
import { ProfileFollowButton } from './ProfileFollowButton';

const RANK_COLORS: Record<string, string> = {
  S: 'bg-yellow-400 text-black',
  A: 'bg-purple-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-green-600 text-white',
  D: 'bg-zinc-500 text-white',
  Bronze: 'bg-amber-700 text-white',
  Silver: 'bg-zinc-400 text-black',
  Gold: 'bg-yellow-400 text-black',
  Platinum: 'bg-cyan-300 text-black',
};

const NEXT_RANK_POINTS: Record<string, number> = {
  Bronze: 1000, Silver: 3000, Gold: 6000, Platinum: Infinity,
  D: 1000, C: 3000, B: 6000, A: 9000, S: Infinity,
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // DBからプロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, rank, rank_points, follower_count, following_count')
    .eq('id', id)
    .single();

  // 投稿数を取得
  const { count: postCount } = await supabase
    .from('coordinates')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', id)
    .eq('is_public', true);

  if (!profile) notFound();

  const isCurrentUser = currentUser?.id === id;

  // フォロー済みか確認
  let isFollowing = false;
  if (currentUser && !isCurrentUser) {
    const { data: followRow } = await supabase
      .from('follows')
      .select('id')
      .match({ follower_id: currentUser.id, following_id: id })
      .single();
    isFollowing = !!followRow;
  }

  // コーデ投稿取得（モックフォールバック込み）
  const posts = getCoordinatesByUser(id);

  const rank = profile.rank ?? 'Bronze';
  const rankPoints = profile.rank_points ?? 0;
  const nextThreshold = NEXT_RANK_POINTS[rank] ?? Infinity;
  const rankPct = nextThreshold === Infinity
    ? 100
    : Math.min(100, Math.round((rankPoints / nextThreshold) * 100));

  const displayName = profile.display_name ?? profile.username;
  const avatarUrl = profile.avatar_url ?? `https://picsum.photos/seed/${profile.id}/200`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-zinc-700">
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" sizes="80px" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{displayName}</h1>
              <span className={`rounded px-2 py-0.5 text-sm font-bold ${RANK_COLORS[rank] ?? 'bg-zinc-600 text-white'}`}>
                {rank}
              </span>
            </div>
            <p className="text-sm text-zinc-500">@{profile.username}</p>
          </div>
        </div>
        {isCurrentUser && (
          <Link href="/settings" className="rounded-lg border border-zinc-700 p-2 text-zinc-400 hover:border-zinc-500">
            <Settings2 size={18} />
          </Link>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-zinc-400 leading-relaxed">{profile.bio}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
        {[
          { label: '投稿', value: postCount ?? 0 },
          { label: 'フォロワー', value: (profile.follower_count ?? 0).toLocaleString() },
          { label: 'フォロー中', value: (profile.following_count ?? 0).toLocaleString() },
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
            {rankPoints.toLocaleString()} pt
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div className="h-2 rounded-full" style={{ width: `${rankPct}%`, backgroundColor: '#F5A623' }} />
        </div>
        {nextThreshold !== Infinity ? (
          <p className="text-xs text-zinc-600">次のランクまで {(nextThreshold - rankPoints).toLocaleString()} pt</p>
        ) : (
          <p className="text-xs text-zinc-600">最高ランク達成！</p>
        )}
      </div>

      {/* Follow button */}
      {!isCurrentUser && (
        <ProfileFollowButton targetUserId={id} initialFollowing={isFollowing} />
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
