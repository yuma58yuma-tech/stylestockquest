'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Shirt, Plus, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  isPost?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'フィード', icon: House },
  { href: '/closet', label: 'クローゼット', icon: Shirt },
  { href: '/post', label: 'Post', icon: Plus, isPost: true },
  { href: '/marketplace', label: 'マーケット', icon: ShoppingBag },
  { href: '/profile/user_01', label: 'プロフィール', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white lg:hidden">
      <ul className="flex h-14 items-center">
        {NAV_ITEMS.map(({ href, label, icon: Icon, isPost }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

          if (isPost) {
            return (
              <li key={href} className="flex flex-1 justify-center">
                <Link href={href} aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white">
                  <Icon size={16} strokeWidth={2.5} />
                </Link>
              </li>
            );
          }

          return (
            <li key={href} className="flex flex-1 flex-col items-center gap-0.5">
              <Link href={href} aria-label={label}
                className={cn('flex flex-col items-center gap-0.5 px-3 py-1 transition-colors',
                  isActive ? 'text-zinc-900' : 'text-zinc-400')}>
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
