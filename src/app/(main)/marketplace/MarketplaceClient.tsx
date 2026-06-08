'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarketplaceListingWithSeller, ItemCategory } from '@/types';

const CATEGORY_FILTERS: { value: ItemCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tops', label: 'トップス' },
  { value: 'bottoms', label: 'ボトムス' },
  { value: 'outerwear', label: 'アウター' },
  { value: 'shoes', label: 'シューズ' },
  { value: 'bag', label: 'バッグ' },
];

const PRICE_FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: 'under10k', label: '〜1万円' },
  { value: '10k-30k', label: '1〜3万円' },
  { value: 'over30k', label: '3万円〜' },
];

const CONDITION_LABELS: Record<string, string> = {
  new: '新品',
  like_new: '未使用に近い',
  good: '良い',
  fair: 'やや傷あり',
  poor: '傷・汚れあり',
};

interface Props {
  listings: MarketplaceListingWithSeller[];
}

export function MarketplaceClient({ listings }: Props) {
  const [category, setCategory] = useState<ItemCategory | 'all'>('all');
  const [priceRange, setPriceRange] = useState('all');

  const filtered = listings.filter((l) => {
    const catOk = category === 'all' || l.item.category === category;
    const priceOk =
      priceRange === 'all' ||
      (priceRange === 'under10k' && l.price < 10000) ||
      (priceRange === '10k-30k' && l.price >= 10000 && l.price < 30000) ||
      (priceRange === 'over30k' && l.price >= 30000);
    return catOk && priceOk;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-1 pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Market</h1>
        <p className="text-xs text-zinc-600 mt-0.5">{filtered.length} items</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={cn(
              'flex-shrink-0 text-xs transition-colors pb-0.5',
              category === value
                ? 'text-white border-b border-white'
                : 'text-zinc-600 hover:text-zinc-400'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Price filter */}
      <div className="flex gap-3">
        {PRICE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPriceRange(value)}
            className={cn(
              'flex-1 py-1.5 text-xs transition-colors border-b',
              priceRange === value
                ? 'text-white border-white'
                : 'text-zinc-600 border-transparent hover:text-zinc-400'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-zinc-600">該当する商品がありません</div>
      ) : (
        <div className="grid grid-cols-2 gap-x-2 gap-y-6">
          {filtered.map((listing) => (
            <Link key={listing.id} href={`/marketplace/${listing.id}`} className="group">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={listing.item.imageUrl}
                  alt={listing.item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 50vw, 280px"
                />
                <button className="absolute right-2 top-2 p-1 text-white/60 hover:text-white transition-colors">
                  <Heart size={14} />
                </button>
              </div>
              <div className="pt-2 space-y-0.5">
                <p className="text-xs text-zinc-500">{listing.item.brand}</p>
                <p className="text-xs text-zinc-300 line-clamp-1">{listing.item.name}</p>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-sm font-medium text-white">¥{listing.price.toLocaleString()}</span>
                  <span className="text-xs text-zinc-600">{CONDITION_LABELS[listing.condition]}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
