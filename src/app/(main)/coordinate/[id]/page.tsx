import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShoppingBag, Tag, Eye } from 'lucide-react';
import { getCoordinateById, getScoreBreakdown } from '@/lib/data';
import VotePanel from '@/components/coordinate/VotePanel';
import { getVotesForCoordinate } from '@/mock/votes';
import { ActionButtons } from './ActionButtons';
import { FollowButton } from './FollowButton';

const RANK_COLORS: Record<string, string> = {
  S: 'bg-yellow-400 text-black',
  A: 'bg-purple-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-green-600 text-white',
  D: 'bg-zinc-500 text-white',
};

const CATEGORY_LABELS: Record<string, string> = {
  tops: 'トップス',
  bottoms: 'ボトムス',
  outerwear: 'アウター',
  shoes: 'シューズ',
  bag: 'バッグ',
  accessory: 'アクセサリー',
  hat: 'ハット',
  other: 'その他',
};

const CONDITION_LABELS: Record<string, string> = {
  new: '新品',
  like_new: '未使用に近い',
  good: '良い',
  fair: 'やや傷あり',
  poor: '傷・汚れあり',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CoordinateDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await getCoordinateById(id);
  if (!post) notFound();

  const { user } = post;
  const score = getScoreBreakdown(post);
  const votes = getVotesForCoordinate(id);

  const scoreItems = [
    { label: 'いいね', value: post.likeCount, multiplier: 3 },
    { label: '保存', value: post.saveCount, multiplier: 5 },
    { label: 'Vote', value: post.voteCount, multiplier: 10 },
    { label: 'コメント', value: post.commentCount, multiplier: 2 },
    { label: '閲覧', value: post.viewCount, multiplier: 0.1 },
  ];

  return (
    <div className="space-y-6">
      {/* Main image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 672px) 100vw, 672px"
          priority
        />
      </div>

      {/* User info */}
      <div className="flex items-center gap-3">
        <Link href={`/profile/${user.id}`} className="flex items-center gap-3 min-w-0">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-zinc-700">
            <Image src={user.avatar} alt={user.displayName} fill className="object-cover" sizes="40px" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{user.displayName}</span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${RANK_COLORS[user.rank]}`}>
                {user.rank}
              </span>
            </div>
            <p className="text-xs text-zinc-400">@{user.username}</p>
          </div>
        </Link>
        <FollowButton targetUserId={user.id} />
      </div>

      {/* Title & tags */}
      <div>
        <h1 className="text-xl font-bold text-white">{post.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{post.description}</p>
        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs text-zinc-500">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <ActionButtons
        coordinateId={post.id}
        likeCount={post.likeCount}
        saveCount={post.saveCount}
        voteCount={post.voteCount}
      />

      {/* Score breakdown */}
      <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-400">スコア内訳</h2>
          <span className="text-lg font-bold text-[#F5A623]">
            {Math.round(score.total).toLocaleString()} pts
          </span>
        </div>
        <div className="space-y-2">
          {scoreItems.map(({ label, value, multiplier }) => {
            const contribution = value * multiplier;
            const pct = score.total > 0 ? (contribution / score.total) * 100 : 0;
            return (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>{label} × {multiplier} = {Math.round(contribution).toLocaleString()}</span>
                  <span>{value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800">
                  <div
                    className="h-1.5 rounded-full bg-[#F5A623]"
                    style={{ width: `${pct}%`, opacity: 0.8 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-600">
          <Eye size={12} />
          <span>{post.viewCount.toLocaleString()} views</span>
        </div>
      </div>

      {/* Vote panel */}
      <VotePanel coordinateId={id} initialVotes={votes} />

      {/* Worn items */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
          <Tag size={14} />
          着用アイテム
        </h2>
        <div className="space-y-2">
          {post.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#1a1a1a] px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-xs text-zinc-500">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                  <span className="text-xs text-zinc-600">{item.size}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-white">
                  {item.brand} — {item.name}
                </p>
                <p className="text-xs text-zinc-500">{item.color}</p>
              </div>
              <Link
                href={`/marketplace?brand=${encodeURIComponent(item.brand)}`}
                className="ml-3 flex flex-shrink-0 items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <ShoppingBag size={12} />
                マーケット
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
