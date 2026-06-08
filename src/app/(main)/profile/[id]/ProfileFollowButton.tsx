'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  targetUserId: string;
  initialFollowing: boolean;
}

export function ProfileFollowButton({ targetUserId, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

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
      onClick={handleToggle}
      disabled={loading}
      className="w-full rounded-xl py-3 text-sm font-bold transition-opacity disabled:opacity-50"
      style={{ backgroundColor: following ? 'transparent' : '#F5A623', color: following ? '#F5A623' : 'black', border: following ? '1px solid #F5A623' : 'none' }}
    >
      {following ? 'フォロー中' : 'フォローする'}
    </button>
  );
}
