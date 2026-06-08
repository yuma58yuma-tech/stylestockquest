'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Shirt, Plus, ShoppingBag, User, Trophy, Swords } from 'lucide-react';
import { AuthNav } from './AuthNav';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const STATIC_NAV = [
  { href: '/', label: 'フィード', icon: House },
  { href: '/ranking', label: 'ランキング', icon: Trophy },
  { href: '/quest', label: 'クエスト', icon: Swords },
  { href: '/closet', label: 'クローゼット', icon: Shirt },
  { href: '/marketplace', label: 'マーケット', icon: ShoppingBag },
];

export function Sidebar() {
  const pathname = usePathname();
  const [profileHref, setProfileHref] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setProfileHref(`/profile/${data.user.id}`);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setProfileHref(session?.user ? `/profile/${session.user.id}` : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    ...STATIC_NAV,
    { href: profileHref ?? '/login', label: 'プロフィール', icon: User },
  ];

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-52 lg:flex-col lg:border-r lg:border-zinc-800 lg:bg-[#111111]">
      <div className="flex h-14 items-center px-5">
        <span className="text-base font-bold tracking-widest text-white uppercase">SSQ</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && href !== '/login' && pathname.startsWith(href));
          return (
            <Link key={label} href={href}
              className={cn('flex items-center gap-3 px-2 py-2 text-sm transition-colors',
                isActive ? 'text-[#F5A623]' : 'text-zinc-500 hover:text-zinc-300')}>
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className={cn(isActive ? 'font-medium' : 'font-normal')}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pt-2">
        <AuthNav />
      </div>

      <div className="px-3 pb-6 pt-2">
        <Link href="/post"
          className="flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: '#F5A623' }}>
          <Plus size={16} strokeWidth={2.5} />
          投稿する
        </Link>
      </div>
    </aside>
  );
}
