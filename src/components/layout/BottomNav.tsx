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
  { href: '/', label: 'Feed', icon: House },
  { href: '/closet', label: 'Closet', icon: Shirt },
  { href: '/post', label: 'Post', icon: Plus, isPost: true },
  { href: '/marketplace', label: 'Market', icon: ShoppingBag },
  { href: '/profile/user_01', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-100 bg-white/95 backdrop-blur-md lg:hidden">
      <ul className="flex h-12 items-center">
        {NAV_ITEMS.map(({ href, label, icon: Icon, isPost }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

          if (isPost) {
            return (
              <li key={href} className="flex flex-1 justify-center">
                <Link href={href} aria-label={label}
                  className="flex h-7 w-7 items-center justify-center text-white"
                  style={{ backgroundColor: '#F5A623' }}>
                  <Icon size={15} strokeWidth={2.5} />
                </Link>
              </li>
            );
          }

          return (
            <li key={href} className="flex flex-1 justify-center">
              <Link href={href} aria-label={label}
                className={cn('flex items-center justify-center p-2.5 transition-colors',
                  isActive ? 'text-zinc-900' : 'text-zinc-400')}>
                <Icon size={19} strokeWidth={isActive ? 2 : 1.5} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
