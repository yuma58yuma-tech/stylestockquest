import type { MessageThread, Message } from '@/types';

export const MOCK_MESSAGES: Message[] = [
  { id: 'msg_01', threadId: 'thread_01', senderId: 'user_02', content: 'このコーデ本当に素敵です！どこで買ったんですか？', read: true, createdAt: '2024-05-22T10:00:00Z' },
  { id: 'msg_02', threadId: 'thread_01', senderId: 'user_01', content: 'ありがとうございます！COMOLIで購入しました。', read: true, createdAt: '2024-05-22T10:05:00Z' },
  { id: 'msg_03', threadId: 'thread_01', senderId: 'user_02', content: 'やっぱり！サイズ感教えてもらえますか？', read: false, createdAt: '2024-05-22T10:10:00Z' },

  { id: 'msg_04', threadId: 'thread_02', senderId: 'user_03', content: 'タンカーバッグ、オファーできますか？¥15,000ではどうでしょう', read: true, createdAt: '2024-05-21T18:00:00Z' },
  { id: 'msg_05', threadId: 'thread_02', senderId: 'user_01', content: '¥16,000ならお譲りできます！', read: true, createdAt: '2024-05-21T18:30:00Z' },
  { id: 'msg_06', threadId: 'thread_02', senderId: 'user_03', content: 'では¥16,000でお願いします！', read: true, createdAt: '2024-05-21T18:45:00Z' },

  { id: 'msg_07', threadId: 'thread_03', senderId: 'user_05', content: 'コーデいつも参考にしています！', read: false, createdAt: '2024-05-20T09:00:00Z' },
];

export const MOCK_THREADS: MessageThread[] = [
  {
    id: 'thread_01',
    participants: ['user_01', 'user_02'],
    lastMessage: MOCK_MESSAGES[2],
    unreadCount: 1,
  },
  {
    id: 'thread_02',
    participants: ['user_01', 'user_03'],
    lastMessage: MOCK_MESSAGES[5],
    unreadCount: 0,
  },
  {
    id: 'thread_03',
    participants: ['user_01', 'user_05'],
    lastMessage: MOCK_MESSAGES[6],
    unreadCount: 1,
  },
];
