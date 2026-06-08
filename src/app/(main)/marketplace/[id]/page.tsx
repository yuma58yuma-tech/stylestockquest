import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Heart, Share2, ShoppingBag, Star, MessageCircle } from 'lucide-react';
import { getMarketplaceListingById, getCoordinates } from '@/lib/data';
import { BuyButton } from './BuyButton';

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: '新品', color: 'text-green-400' },
  like_new: { label: '未使用に近い', color: 'text-green-400' },
  good: { label: '良い', color: 'text-blue-400' },
  fair: { label: 'やや傷あり', color: 'text-yellow-400' },
  poor: { label: '傷・汚れあり', color: 'text-red-400' },
};

const CATEGORY_LABELS: Record<string, string> = {
  tops: 'トップス',
  bottoms: 'ボトムス',
  outerwear: 'アウター',
  shoes: 'シューズ',
  bag: 'バッグ',
  accessory: 'アクセサリー',
  hat: 'ハット',
  other: 'その他',
};

const RANK_COLORS: Record<string, string> = {
  S: 'bg-yellow-400 text-black',
  A: 'bg-purple-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-green-600 text-white',
  D: 'bg-zinc-500 text-white',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MarketplaceDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getMarketplaceListingById(id);
  if (!listing) notFound();

  const { seller, item } = listing;
  const condition = CONDITION_LABELS[listing.condition];

  // コーデ着用例：このブランドが含まれる投稿を検索
  const allCoords = await getCoordinates();
  const relatedCoords = allCoords
    .filter((p) => p.items.some((i) => i.brand === item.brand))
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-8">
      {/* Item image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 672px) 100vw, 672px"
          priority
        />
        <button className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-zinc-300">
          <Heart size={20} />
        </button>
      </div>

      {/* Item info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm text-zinc-500">{item.brand}</p>
            <h1 className="text-xl font-bold text-white">{item.name}</h1>
          </div>
          <button className="flex-shrink-0 rounded-full border border-zinc-700 p-2 text-zinc-400 hover:border-zinc-500">
            <Share2 size={16} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-400">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-400">
            サイズ: {item.size}
          </span>
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-zinc-400">
            {item.color}
          </span>
          <span className={`rounded-full border border-zinc-700 px-3 py-1 ${condition.color}`}>
            {condition.label}
          </span>
        </div>

        <p className="text-3xl font-bold text-white">¥{listing.price.toLocaleString()}</p>

        {item.purchasePrice && (
          <p className="text-xs text-zinc-600">
            定価 ¥{item.purchasePrice.toLocaleString()}
            <span className="ml-2 text-green-500">
              ({Math.round((1 - listing.price / item.purchasePrice) * 100)}% OFF)
            </span>
          </p>
        )}
      </div>

      {/* Description */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-2 text-sm font-semibold text-zinc-300">商品説明</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">{listing.description}</p>
      </div>

      {/* Seller */}
      <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <Link href={`/profile/${seller.id}`} className="flex items-center gap-3 min-w-0">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
            <Image src={seller.avatar} alt={seller.displayName} fill className="object-cover" sizes="40px" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{seller.displayName}</span>
              <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${RANK_COLORS[seller.rank]}`}>
                {seller.rank}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Star size={11} className="fill-current text-yellow-400" />
              <span>4.8 · {seller.postCount}件投稿</span>
            </div>
          </div>
        </Link>
        <button className="ml-auto flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 transition-colors">
          <MessageCircle size={13} />
          メッセージ
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-zinc-600">
        <span className="flex items-center gap-1">
          <Heart size={12} />
          {listing.likeCount} お気に入り
        </span>
        <span className="flex items-center gap-1">
          <ShoppingBag size={12} />
          {listing.viewCount} 閲覧
        </span>
      </div>

      {/* Buy / Offer buttons */}
      <BuyButton price={listing.price} />

      {/* Related coordinates */}
      {relatedCoords.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <ShoppingBag size={14} />
            {item.brand} のコーデ着用例
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {relatedCoords.map((coord) => (
              <Link
                key={coord.id}
                href={`/coordinate/${coord.id}`}
                className="relative aspect-[3/4] w-full overflow-hidden rounded-xl"
              >
                <Image
                  src={coord.imageUrl}
                  alt={coord.title}
                  fill
                  className="object-cover hover:opacity-80 transition-opacity"
                  sizes="(max-width: 672px) 50vw, 336px"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
