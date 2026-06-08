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
    <article>
      <Link href={`/coordinate/${post.id}`} className="block relative aspect-[3/4] w-full overflow-hidden group">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 50vw, 300px"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pt-10 pb-2 px-2">
          <p className="text-xs font-medium text-white leading-tight line-clamp-1">{post.title}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-white/60">{user.displayName}</span>
            <span className={`text-[10px] font-bold ${RANK_COLORS[user.rank]}`}>{user.rank}</span>
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-2 px-0.5 pt-1 text-[10px] text-zinc-400">
        <span>♥ {post.likeCount.toLocaleString()}</span>
        <span style={{ color: '#F5A623' }}>▲ {post.voteCount}</span>
      </div>
    </article>
  );
}
