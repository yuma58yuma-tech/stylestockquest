import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { MOCK_THREADS } from '@/mock/messages';
import { MOCK_USERS } from '@/mock/users';
import { cn } from '@/lib/utils';

const CURRENT_USER_ID = 'user_01';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

export default function MessagesPage() {
  const totalUnread = MOCK_THREADS.reduce((s, t) => s + t.unreadCount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle size={20} style={{ color: '#F5A623' }} />
        <h1 className="text-xl font-bold text-white">メッセージ</h1>
        {totalUnread > 0 && (
          <span className="rounded-full px-2 py-0.5 text-xs font-bold text-black" style={{ backgroundColor: '#F5A623' }}>
            {totalUnread}
          </span>
        )}
      </div>

      {/* Thread list */}
      <div className="space-y-2">
        {MOCK_THREADS.map((thread) => {
          const partnerId = thread.participants.find((id) => id !== CURRENT_USER_ID) ?? '';
          const partner = MOCK_USERS.find((u) => u.id === partnerId);
          if (!partner) return null;

          const isUnread = thread.unreadCount > 0;
          const isMyMessage = thread.lastMessage.senderId === CURRENT_USER_ID;

          return (
            <Link
              key={thread.id}
              href={`/messages/${thread.id}`}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:border-zinc-600',
                isUnread ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-transparent'
              )}
            >
              {/* Avatar */}
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                <Image src={partner.avatar} alt={partner.displayName} fill className="object-cover" sizes="48px" />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <span className={cn('text-sm font-semibold', isUnread ? 'text-white' : 'text-zinc-400')}>
                    {partner.displayName}
                  </span>
                  <span className="text-xs text-zinc-600">{timeAgo(thread.lastMessage.createdAt)}</span>
                </div>
                <p className={cn('mt-0.5 truncate text-xs', isUnread ? 'text-zinc-300' : 'text-zinc-600')}>
                  {isMyMessage ? 'あなた: ' : ''}{thread.lastMessage.content}
                </p>
              </div>

              {/* Unread badge */}
              {isUnread && (
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                  style={{ backgroundColor: '#F5A623' }}
                >
                  {thread.unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Chat placeholder */}
      <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
        <MessageCircle size={32} className="mx-auto mb-2 text-zinc-700" />
        <p className="text-sm text-zinc-600">チャット画面は近日実装予定です</p>
      </div>
    </div>
  );
}
