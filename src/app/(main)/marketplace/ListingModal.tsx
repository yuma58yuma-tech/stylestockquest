'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Camera, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
import type { ItemCategory } from '@/types';

const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: 'tops', label: 'トップス' }, { value: 'bottoms', label: 'ボトムス' },
  { value: 'outerwear', label: 'アウター' }, { value: 'shoes', label: 'シューズ' },
  { value: 'bag', label: 'バッグ' }, { value: 'accessory', label: 'アクセサリー' },
  { value: 'hat', label: 'ハット' }, { value: 'other', label: 'その他' },
];

const CONDITIONS = [
  { value: 'new', label: '新品' }, { value: 'like_new', label: '未使用に近い' },
  { value: 'good', label: '良い' }, { value: 'fair', label: 'やや傷あり' },
  { value: 'poor', label: '傷・汚れあり' },
];

interface Props {
  onClose: () => void;
  onListed: () => void;
}

export function ListingModal({ onClose, onListed }: Props) {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ItemCategory>('tops');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState('good');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title || !price) { setError('タイトルと価格は必須です'); return; }
    setSaving(true); setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('ログインが必要です'); setSaving(false); return; }

    let imageUrl = `https://picsum.photos/seed/${Date.now()}/400/400`;
    if (imageFile) {
      const uploaded = await uploadImage('closet', imageFile, user.id);
      if (uploaded) imageUrl = uploaded;
    }

    const { error: dbError } = await supabase.from('marketplace_items').insert({
      seller_id: user.id,
      title,
      brand,
      category,
      size,
      condition,
      price: parseInt(price),
      description,
      images: [imageUrl],
      status: 'active',
    });

    if (dbError) { setError(dbError.message); setSaving(false); return; }

    onListed();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-y-auto rounded-t-2xl bg-zinc-950 p-6 space-y-4 sm:rounded-2xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">アイテムを出品</h2>
          <button onClick={onClose}><X size={20} className="text-zinc-400" /></button>
        </div>

        {/* 画像 */}
        <div onClick={() => imageRef.current?.click()}
          className="relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900 hover:border-zinc-500 transition-colors">
          {imagePreview ? (
            <Image src={imagePreview} alt="preview" fill className="object-cover rounded-xl" sizes="400px" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-500">
              <Camera size={28} strokeWidth={1.5} />
              <span className="text-xs">商品写真を選択</span>
            </div>
          )}
        </div>
        <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="タイトル *"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none" />

        <div className="grid grid-cols-2 gap-3">
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="ブランド"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none" />
          <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="サイズ"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <select value={category} onChange={(e) => setCategory(e.target.value as ItemCategory)}
              className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          </div>
          <div className="relative">
            <select value={condition} onChange={(e) => setCondition(e.target.value)}
              className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none">
              {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="価格 *" min={0}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none" />
          <span className="flex-shrink-0 text-sm text-zinc-400">円</span>
        </div>

        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="商品説明" rows={3}
          className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none" />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button onClick={handleSubmit} disabled={saving}
          className="w-full rounded-xl py-3 text-sm font-bold text-black disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: '#F5A623' }}>
          {saving ? '出品中...' : '出品する'}
        </button>
      </div>
    </div>
  );
}
