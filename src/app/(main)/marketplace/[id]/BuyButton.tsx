'use client';

import { useState } from 'react';
import { ShoppingBag, Tag } from 'lucide-react';

interface Props {
  price: number;
}

export function BuyButton({ price }: Props) {
  const [clicked, setClicked] = useState<'buy' | 'offer' | null>(null);

  const handleClick = (type: 'buy' | 'offer') => {
    setClicked(type);
    setTimeout(() => setClicked(null), 3000);
  };

  if (clicked) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-900 py-5 text-center">
        <p className="text-sm font-semibold text-[#F5A623]">Coming Soon 🚧</p>
        <p className="mt-1 text-xs text-zinc-500">決済機能は近日実装予定です</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => handleClick('buy')}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-black transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#F5A623' }}
      >
        <ShoppingBag size={18} />
        ¥{price.toLocaleString()} で購入
      </button>
      <button
        onClick={() => handleClick('offer')}
        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-600 px-5 py-4 text-sm font-medium text-zinc-300 hover:border-zinc-400 transition-colors"
      >
        <Tag size={16} />
        オファー
      </button>
    </div>
  );
}
