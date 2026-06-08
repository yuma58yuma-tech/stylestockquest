'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Pencil, Bell, BellOff, CreditCard, Shield, LogOut, ChevronRight, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_CURRENT_USER } from '@/mock/users';

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
        enabled ? 'bg-[#F5A623]' : 'bg-zinc-700'
      )}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
          enabled ? 'translate-x-4' : 'translate-x-1'
        )}
      />
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="pb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h2>;
}

function RowLink({ icon: Icon, label, sub, danger = false }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; sub?: string; danger?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3', danger && 'border-red-900/40')}>
      <Icon size={18} className={danger ? 'text-red-400' : 'text-zinc-400'} />
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-medium', danger ? 'text-red-400' : 'text-zinc-200')}>{label}</p>
        {sub && <p className="text-xs text-zinc-600">{sub}</p>}
      </div>
      <ChevronRight size={16} className="text-zinc-600" />
    </div>
  );
}

export default function SettingsPage() {
  const user = MOCK_CURRENT_USER;

  const [notifs, setNotifs] = useState({
    likes: true,
    votes: true,
    follows: true,
    comments: true,
    sales: true,
    quests: true,
    ranking: false,
  });

  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);

  const notifItems: { key: keyof typeof notifs; label: string; icon: typeof Bell }[] = [
    { key: 'likes', label: 'いいね通知', icon: Bell },
    { key: 'votes', label: 'Vote通知', icon: Bell },
    { key: 'follows', label: 'フォロー通知', icon: Bell },
    { key: 'comments', label: 'コメント通知', icon: Bell },
    { key: 'sales', label: '販売通知', icon: Bell },
    { key: 'quests', label: 'クエスト通知', icon: Bell },
    { key: 'ranking', label: 'ランキング通知', icon: Bell },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings2 size={20} style={{ color: '#F5A623' }} />
        <h1 className="text-xl font-bold text-white">設定</h1>
      </div>

      {/* Profile section */}
      <section className="space-y-3">
        <SectionHeader title="プロフィール編集" />

        {/* Avatar */}
        <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full">
            <Image src={user.avatar} alt={user.displayName} fill className="object-cover" sizes="64px" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-300">プロフィール写真</p>
            <p className="text-xs text-zinc-600">タップして変更</p>
          </div>
          <Pencil size={16} className="text-zinc-500" />
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-500">表示名</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#F5A623] focus:outline-none"
          />
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-500">自己紹介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#F5A623] focus:outline-none"
          />
        </div>

        <button
          className="w-full rounded-xl py-3 text-sm font-bold text-black"
          style={{ backgroundColor: '#F5A623' }}
        >
          保存する
        </button>
      </section>

      {/* Notification settings */}
      <section className="space-y-3">
        <SectionHeader title="通知設定" />
        <div className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          {notifItems.map(({ key, label }) => {
            const enabled = notifs[key];
            return (
              <div key={key} className="flex items-center gap-3 px-4 py-3">
                {enabled ? (
                  <Bell size={16} className="text-zinc-400" />
                ) : (
                  <BellOff size={16} className="text-zinc-600" />
                )}
                <span className={cn('flex-1 text-sm', enabled ? 'text-zinc-200' : 'text-zinc-600')}>
                  {label}
                </span>
                <Toggle enabled={enabled} onChange={(v) => setNotifs((p) => ({ ...p, [key]: v }))} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Payment / Stripe */}
      <section className="space-y-3">
        <SectionHeader title="決済・収益" />
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4 space-y-2">
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-zinc-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-200">Stripe 連携</p>
              <p className="text-xs text-zinc-600">売上の受け取りに必要です</p>
            </div>
            <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-500">
              Coming Soon
            </span>
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="space-y-2">
        <SectionHeader title="アカウント" />
        <RowLink icon={Shield} label="プライバシー設定" sub="ブロック・非公開設定" />
        <RowLink icon={LogOut} label="ログアウト" danger />
      </section>
    </div>
  );
}
