import Image from 'next/image';
import { Heart, ChevronUp, UserPlus, MessageCircle, ShoppingBag, Trophy, Bookmark, Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { MOCK_NOTIFICATIONS } from '@/mock/notifications';
import { MOCK_USERS } from '@/mock/users';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

const TYPE_CONFIG: Record<
  Notification['type'],
  { icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; color: string; bg: string }
> = {
  like: { icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
  save: { icon: Bookmark, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  vote: { icon: ChevronUp, color: 'text-[#F5A623]', bg: 'bg-[#F5A623]/10' },
  follow: { icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  comment: { icon: MessageCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
  sale: { icon: ShoppingBag, color: 'text-[#F5A623]', bg: 'bg-[#F5A623]/10' },
  rank_up: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  quest: { icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-400/10' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

type NotifRow = {
  id: string;
  type: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  sender_id: string | null;
  profiles: { username: string; avatar_url: string | null; display_name: string | null } | null;
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let notifications: Notification[] = [];

  if (user) {
    const { data } = await supabase
      .from('notifications')
      .select('id, type, message, is_read, created_at, sender_id, profiles:sender_id ( username, avatar_url, display_name )')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      notifications = (data as unknown as NotifRow[]).map((row) => ({
        id: row.id,
        userId: user.id,
        type: (row.type as Notification['type']) ?? 'like',
        fromUserId: row.sender_id ?? undefined,
        message: row.message ?? '',
        read: row.is_read,
        createdAt: row.created_at,
      }));
    }
  }

  if (notifications.length === 0) {
    notifications = MOCK_NOTIFICATIONS;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={20} style={{ color: '#F5A623' }} />
          <h1 className="text-xl font-bold text-white">通知</h1>
          {unreadCount > 0 && (
            <span className="rounded-full px-2 py-0.5 text-xs font-bold text-black" style={{ backgroundColor: '#F5A623' }}>
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {notifications.map((notif) => {
          const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.like;
          const Icon = config.icon;
          const fromUser = notif.fromUserId ? MOCK_USERS.find((u) => u.id === notif.fromUserId) : null;

          return (
            <div
              key={notif.id}
              className={cn(
                'flex items-start gap-3 rounded-xl px-4 py-3 transition-colors',
                notif.read ? 'bg-transparent' : 'bg-zinc-900'
              )}
            >
              <div className="flex-shrink-0">
                {fromUser ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image src={fromUser.avatar} alt={fromUser.displayName} fill className="object-cover" sizes="40px" />
                    <span className={cn('absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full', config.bg)}>
                      <Icon size={10} className={config.color} />
                    </span>
                  </div>
                ) : (
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', config.bg)}>
                    <Icon size={18} className={config.color} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm leading-relaxed', notif.read ? 'text-zinc-500' : 'text-zinc-200')}>
                  {notif.message}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">{timeAgo(notif.createdAt)}</p>
              </div>
              {!notif.read && (
                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: '#F5A623' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
