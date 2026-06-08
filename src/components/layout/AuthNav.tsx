'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function AuthNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 px-2 py-2 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
      >
        <LogIn size={18} strokeWidth={1.5} />
        <span>ログイン</span>
      </Link>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-2 py-2 text-sm text-zinc-400 hover:text-zinc-700 transition-colors w-full"
    >
      <LogOut size={18} strokeWidth={1.5} />
      <span>ログアウト</span>
    </button>
  );
}
