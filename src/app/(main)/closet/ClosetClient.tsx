'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClosetItem, ItemCategory } from '@/types';

const FILTERS: { value: ItemCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tops', label: 'トップス' },
  { value: 'bottoms', label: 'ボトムス' },
  { value: 'outerwear', label: 'アウター' },
  { value: 'shoes', label: 'シューズ' },
  { value: 'bag', label: 'バッグ' },
  { value: 'accessory', label: 'アクセ' },
];

interface Props {
  items: ClosetItem[];
}

export function ClosetClient({ items }: Props) {
  const [activeFilter, setActiveFilter] = useState<ItemCategory | 'all'>('all');

  const filtered = activeFilter === 'all'
    ? items
    : items.filter((i) => i.category === activeFilter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Closet</h1>
        <button
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-black"
          style={{ backgroundColor: '#F5A623' }}
        >
          <Plus size={12} strokeWidth={2.5} />
          追加
        </button>
      </div>

      {/* Stats — シンプルなテキスト行 */}
      <div className="flex gap-5 text-sm">
        <span><span className="font-semibold text-white">{items.length}</span> <span className="text-zinc-600">items</span></span>
        <span><span className="font-semibold text-white">{items.filter((i) => i.isListed).length}</span> <span className="text-zinc-600">listed</span></span>
        <span><span className="font-semibold text-white">{items.reduce((s, i) => s + i.wearCount, 0)}</span> <span className="text-zinc-600">wears</span></span>
      </div>

      {/* Category filter */}
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={cn(
              'flex-shrink-0 text-xs transition-colors pb-0.5',
              activeFilter === value
                ? 'text-white border-b border-white'
                : 'text-zinc-600 hover:text-zinc-400'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-zinc-700 text-sm">アイテムがありません</div>
      ) : (
        <div className="grid grid-cols-2 gap-x-2 gap-y-5 sm:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="group">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                {item.isListed && (
                  <span
                    className="absolute left-2 top-2 px-1.5 py-0.5 text-xs font-semibold text-black"
                    style={{ backgroundColor: '#F5A623' }}
                  >
                    出品中
                  </span>
                )}
              </div>
              <div className="pt-2 space-y-0.5">
                <p className="text-xs font-medium text-zinc-300 line-clamp-1">{item.brand}</p>
                <p className="text-xs text-zinc-600 line-clamp-1">{item.name}</p>
                <p className="text-xs text-zinc-700">{item.wearCount}回着用</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
