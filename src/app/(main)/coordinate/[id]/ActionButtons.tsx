'use client';

import { useState } from 'react';
import { Heart, Bookmark, Share2, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  coordinateId: string;
  likeCount: number;
  saveCount: number;
  voteCount: number;
}

export function ActionButtons({ coordinateId, likeCount, saveCount, voteCount }: Props) {
  const [likes, setLikes] = useState(likeCount);
  const [saves, setSaves] = useState(saveCount);
  const [votes, setVotes] = useState(voteCount);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [voted, setVoted] = useState(false);

  const supabase = createClient();

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (liked) {
      await supabase.from('likes').delete().match({ user_id: user.id, coordinate_id: coordinateId });
      await supabase.from('coordinates').update({ like_count: likes - 1 }).eq('id', coordinateId);
      setLikes((n) => n - 1);
      setLiked(false);
    } else {
      await supabase.from('likes').insert({ user_id: user.id, coordinate_id: coordinateId });
      await supabase.from('coordinates').update({ like_count: likes + 1 }).eq('id', coordinateId);
      setLikes((n) => n + 1);
      setLiked(true);
    }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (saved) {
      await supabase.from('saves').delete().match({ user_id: user.id, coordinate_id: coordinateId });
      await supabase.from('coordinates').update({ save_count: saves - 1 }).eq('id', coordinateId);
      setSaves((n) => n - 1);
      setSaved(false);
    } else {
      await supabase.from('saves').insert({ user_id: user.id, coordinate_id: coordinateId });
      await supabase.from('coordinates').update({ save_count: saves + 1 }).eq('id', coordinateId);
      setSaves((n) => n + 1);
      setSaved(true);
    }
  };

  const handleVote = async () => {
    if (voted) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const week = `${now.getFullYear()}-W${String(Math.ceil(now.getDate() / 7)).padStart(2, '0')}`;

    const { error } = await supabase.from('votes').insert({
      user_id: user.id,
      coordinate_id: coordinateId,
      period: week,
    });

    if (!error) {
      await supabase.from('coordinates').update({ vote_count: votes + 1 }).eq('id', coordinateId);
      setVotes((n) => n + 1);
      setVoted(true);
    }
  };

  const handleShare = async () => {
    await navigator.share?.({ url: window.location.href }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
    });
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleLike}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors shadow-sm ${
          liked ? 'border-red-400 bg-red-50 text-red-500' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
        }`}
      >
        <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
        <span>{likes.toLocaleString()}</span>
      </button>
      <button
        onClick={handleSave}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors shadow-sm ${
          saved ? 'border-blue-400 bg-blue-50 text-blue-500' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
        }`}
      >
        <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        <span>{saves.toLocaleString()}</span>
      </button>
      <button
        onClick={handleVote}
        disabled={voted}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity ${
          voted ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-white hover:opacity-80'
        }`}
      >
        <ChevronUp size={18} />
        <span>Vote {votes.toLocaleString()}</span>
      </button>
      <button
        onClick={handleShare}
        className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-500 hover:border-zinc-400 transition-colors shadow-sm"
      >
        <Share2 size={18} />
      </button>
    </div>
  );
}
