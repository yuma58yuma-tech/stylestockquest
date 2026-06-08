'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  targetUserId: string;
}

export function FollowButton({ targetUserId }: Props) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === targetUserId) { setLoading(false); return; }

    if (following) {
      await supabase.from('follows').delete().match({ follower_id: user.id, following_id: targetUserId });
      setFollowing(false);
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });
      setFollowing(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`ml-auto rounded-full border px-4 py-1.5 text-sm transition-colors ${
        following
          ? 'border-zinc-900 bg-zinc-900 text-white'
          : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
      }`}
    >
      {following ? 'フォロー中' : 'フォロー'}
    </button>
  );
}
