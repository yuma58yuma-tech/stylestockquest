import Image from 'next/image';
import Link from 'next/link';
import type { CoordinatePostWithUser } from '@/types';

const RANK_COLORS: Record<string, string> = {
  S: 'text-yellow-500',
  A: 'text-purple-500',
  B: 'text-blue-500',
  C: 'text-green-500',
  D: 'text-zinc-400',
};

interface CoordinateCardProps {
  post: CoordinatePostWithUser;
}

export function CoordinateCard({ post }: CoordinateCardProps) {
  const { user } = post;

  return (
    <article className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <Link href={`/coordinate/${post.id}`} className="block relative aspect-[3/4] w-full overflow-hidden group">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 50vw, 300px"
        />
      </Link>
      <div className="px-3 pt-2.5 pb-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500">{user.displayName}</span>
          <span className={`text-[10px] font-bold ${RANK_COLORS[user.rank]}`}>{user.rank}</span>
        </div>
        <p className="text-xs font-semibold text-zinc-900 leading-tight line-clamp-1">{post.title}</p>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-0.5">
          <span>♥ {post.likeCount.toLocaleString()}</span>
          <span>▲ {post.voteCount}</span>
        </div>
      </div>
    </article>
  );
}
