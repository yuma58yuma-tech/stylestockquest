'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

type RoomRow = {
  id: string; last_message_at: string;
  room_members: { user_id: string; profiles: { username: string; display_name: string | null; avatar_url: string | null } | null }[];
  messages: { id: string; body: string; sender_id: string; is_read: boolean; created_at: string }[];
};

type Message = { id: string; body: string; sender_id: string; is_read: boolean; created_at: string };

interface Props {
  rooms: RoomRow[];
  currentUserId: string;
}

export function MessagesClient({ rooms: initialRooms, currentUserId }: Props) {
  const [rooms] = useState<RoomRow[]>(initialRooms);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const partner = activeRoom?.room_members.find((m) => m.user_id !== currentUserId);

  useEffect(() => {
    if (!activeRoomId) return;
    // 初期メッセージ取得
    supabase.from('messages').select('*').eq('room_id', activeRoomId).order('created_at').then(({ data }) => {
      setMessages((data ?? []) as Message[]);
    });

    // リアルタイム購読
    const channel = supabase.channel(`room:${activeRoomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${activeRoomId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeRoomId || sending) return;
    setSending(true);
    const body = input.trim();
    setInput('');

    await supabase.from('messages').insert({ room_id: activeRoomId, sender_id: currentUserId, body });
    await supabase.from('rooms').update({ last_message_at: new Date().toISOString() }).eq('id', activeRoomId);
    setSending(false);
  };

  const totalUnread = rooms.reduce((s, r) => {
    const last = r.messages[r.messages.length - 1];
    return s + (last && !last.is_read && last.sender_id !== currentUserId ? 1 : 0);
  }, 0);

  // チャット画面
  if (activeRoomId && partner) {
    const partnerName = partner.profiles?.display_name ?? partner.profiles?.username ?? 'unknown';
    const partnerAvatar = partner.profiles?.avatar_url ?? `https://picsum.photos/seed/${partner.user_id}/200`;

    return (
      <div className="flex h-[calc(100vh-7rem)] flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
          <button onClick={() => setActiveRoomId(null)} className="text-zinc-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="relative h-8 w-8 overflow-hidden rounded-full">
            <Image src={partnerAvatar} alt={partnerName} fill className="object-cover" sizes="32px" />
          </div>
          <span className="text-sm font-semibold text-white">{partnerName}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {messages.length === 0 && (
            <p className="text-center text-xs text-zinc-600">メッセージを送ってみよう</p>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                  isMine ? 'bg-zinc-100 text-zinc-900 rounded-br-sm' : 'bg-zinc-800 text-white rounded-bl-sm')}>
                  <p>{msg.body}</p>
                  <p className={cn('mt-0.5 text-right text-xs', isMine ? 'text-zinc-400' : 'text-zinc-500')}>
                    {timeAgo(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-zinc-800 pt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="メッセージを入力..."
            className="flex-1 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-9 w-9 items-center justify-center rounded-full text-black disabled:opacity-40"
            style={{ backgroundColor: '#F5A623' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  // スレッド一覧
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle size={20} style={{ color: '#F5A623' }} />
        <h1 className="text-xl font-bold text-white">メッセージ</h1>
        {totalUnread > 0 && (
          <span className="rounded-full px-2 py-0.5 text-xs font-bold text-black" style={{ backgroundColor: '#F5A623' }}>
            {totalUnread}
          </span>
        )}
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <MessageCircle size={32} className="mx-auto mb-2 text-zinc-700" />
          <p className="text-sm text-zinc-600">まだメッセージがありません</p>
          <p className="text-xs text-zinc-700 mt-1">出品者・購入者とのやり取りがここに表示されます</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => {
            const partner = room.room_members.find((m) => m.user_id !== currentUserId);
            if (!partner) return null;
            const partnerName = partner.profiles?.display_name ?? partner.profiles?.username ?? 'unknown';
            const partnerAvatar = partner.profiles?.avatar_url ?? `https://picsum.photos/seed/${partner.user_id}/200`;
            const lastMsg = [...room.messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            const isUnread = lastMsg && !lastMsg.is_read && lastMsg.sender_id !== currentUserId;

            return (
              <button key={room.id} onClick={() => setActiveRoomId(room.id)} className={cn(
                'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:border-zinc-600',
                isUnread ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-transparent')}>
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                  <Image src={partnerAvatar} alt={partnerName} fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className={cn('text-sm font-semibold', isUnread ? 'text-white' : 'text-zinc-400')}>{partnerName}</span>
                    {lastMsg && <span className="text-xs text-zinc-600">{timeAgo(lastMsg.created_at)}</span>}
                  </div>
                  {lastMsg && (
                    <p className={cn('mt-0.5 truncate text-xs', isUnread ? 'text-zinc-300' : 'text-zinc-600')}>
                      {lastMsg.sender_id === currentUserId ? 'あなた: ' : ''}{lastMsg.body}
                    </p>
                  )}
                </div>
                {isUnread && (
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-black" style={{ backgroundColor: '#F5A623' }}>
                    1
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
