import { getCoordinates } from '@/lib/data';
import { CoordinateCard } from '@/components/feed/CoordinateCard';

export default function FeedPage() {
  const posts = getCoordinates();

  return (
    <div>
      <div className="pb-3 pt-0.5">
        <h1 className="text-base font-bold tracking-widest text-zinc-900 uppercase">SSQ</h1>
      </div>
      <div className="grid grid-cols-2 gap-x-1.5 gap-y-4">
        {posts.map((post) => (
          <CoordinateCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
