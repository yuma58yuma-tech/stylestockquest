export const dynamic = 'force-dynamic';

import { getCoordinates } from '@/lib/data';
import { CoordinateCard } from '@/components/feed/CoordinateCard';

export default async function FeedPage() {
  const posts = await getCoordinates();

  return (
    <div>
      <div className="flex items-center justify-between pb-4 pt-1">
        <h1 className="text-lg font-bold tracking-widest text-zinc-900 uppercase">SSQ</h1>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {posts.map((post) => (
          <CoordinateCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
