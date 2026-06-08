'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Shirt, Plus, ShoppingBag, User, Trophy, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Feed', icon: House },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
  { href: '/quest', label: 'Quest', icon: Swords },
  { href: '/closet', label: 'Closet', icon: Shirt },
  { href: '/marketplace', label: 'Market', icon: ShoppingBag },
  { href: '/profile/user_01', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-52 lg:flex-col lg:border-r lg:border-zinc-200 lg:bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center px-5">
        <span className="text-base font-bold tracking-widest text-zinc-900 uppercase">SSQ</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-2 py-2 text-sm transition-colors',
                isActive
                  ? 'text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-700'
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className={cn(isActive ? 'font-medium' : 'font-normal')}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Post button */}
      <div className="px-3 pb-6 pt-4">
        <Link
          href="/post"
          className="flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: '#F5A623' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          投稿する
        </Link>
      </div>
    </aside>
  );
}
