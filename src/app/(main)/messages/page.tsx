import { createClient } from '@/lib/supabase/server';
import { MessageCircle } from 'lucide-react';
import { MessagesClient } from './MessagesClient';

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} style={{ color: '#F5A623' }} />
          <h1 className="text-xl font-bold text-white">メッセージ</h1>
        </div>
        <p className="text-center text-sm text-zinc-500 py-16">ログインするとメッセージを送受信できます</p>
      </div>
    );
  }

  // 自分が参加しているルームを取得
  const { data: memberships } = await supabase
    .from('room_members')
    .select('room_id')
    .eq('user_id', user.id);

  const roomIds = (memberships ?? []).map((m) => m.room_id);

  type RoomRow = {
    id: string; last_message_at: string;
    room_members: { user_id: string; profiles: { username: string; display_name: string | null; avatar_url: string | null } | null }[];
    messages: { id: string; body: string; sender_id: string; is_read: boolean; created_at: string }[];
  };

  let rooms: RoomRow[] = [];
  if (roomIds.length > 0) {
    const { data } = await supabase
      .from('rooms')
      .select('id, last_message_at, room_members ( user_id, profiles ( username, display_name, avatar_url ) ), messages ( id, body, sender_id, is_read, created_at )')
      .in('id', roomIds)
      .order('last_message_at', { ascending: false });
    rooms = (data ?? []) as unknown as RoomRow[];
  }

  return <MessagesClient rooms={rooms} currentUserId={user.id} />;
}
