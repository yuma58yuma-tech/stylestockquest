'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, X, Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemCategory } from '@/types';

const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: 'tops', label: 'トップス' },
  { value: 'bottoms', label: 'ボトムス' },
  { value: 'outerwear', label: 'アウター' },
  { value: 'shoes', label: 'シューズ' },
  { value: 'bag', label: 'バッグ' },
  { value: 'accessory', label: 'アクセサリー' },
  { value: 'hat', label: 'ハット' },
  { value: 'other', label: 'その他' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: '公開' },
  { value: 'followers', label: 'フォロワーのみ' },
  { value: 'private', label: '非公開' },
];

interface ItemForm {
  brand: string;
  name: string;
  category: ItemCategory;
  size: string;
  color: string;
  forSale: boolean;
  salePrice: string;
}

const emptyItem = (): ItemForm => ({
  brand: '',
  name: '',
  category: 'tops',
  size: '',
  color: '',
  forSale: false,
  salePrice: '',
});

export default function PostPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [items, setItems] = useState<ItemForm[]>([emptyItem()]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const updateItem = (idx: number, patch: Partial<ItemForm>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-xl font-bold text-white">コーデを投稿</h1>

      {/* Image upload */}
      <div>
        {preview ? (
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
            <Image src={preview} alt="preview" fill className="object-cover" sizes="672px" />
            <button
              onClick={() => setPreview(null)}
              className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-700 text-zinc-500 hover:border-zinc-500 transition-colors"
          >
            <Camera size={40} strokeWidth={1.5} />
            <span className="text-sm">タップして画像を選択</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="コーデのタイトルを入力"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#F5A623] focus:outline-none"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400">説明文</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="コーデについて説明してください"
          rows={3}
          className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#F5A623] focus:outline-none"
        />
      </div>

      {/* Hashtags */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400">ハッシュタグ（スペース区切り）</label>
        <input
          type="text"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="minimal street vintage"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#F5A623] focus:outline-none"
        />
      </div>

      {/* Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300">着用アイテム</h2>
          <button
            onClick={() => setItems((p) => [...p, emptyItem()])}
            className="flex items-center gap-1 text-xs text-[#F5A623]"
          >
            <Plus size={14} />
            追加
          </button>
        </div>

        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">アイテム {idx + 1}</span>
              {items.length > 1 && (
                <button onClick={() => removeItem(idx)} className="text-zinc-600 hover:text-zinc-400">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={item.brand}
                onChange={(e) => updateItem(idx, { brand: e.target.value })}
                placeholder="ブランド"
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#F5A623] focus:outline-none"
              />
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(idx, { name: e.target.value })}
                placeholder="アイテム名"
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#F5A623] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <select
                  value={item.category}
                  onChange={(e) => updateItem(idx, { category: e.target.value as ItemCategory })}
                  className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-[#F5A623] focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500" />
              </div>
              <input
                type="text"
                value={item.size}
                onChange={(e) => updateItem(idx, { size: e.target.value })}
                placeholder="サイズ"
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#F5A623] focus:outline-none"
              />
              <input
                type="text"
                value={item.color}
                onChange={(e) => updateItem(idx, { color: e.target.value })}
                placeholder="カラー"
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#F5A623] focus:outline-none"
              />
            </div>

            {/* For sale toggle */}
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.forSale}
                  onClick={() => updateItem(idx, { forSale: !item.forSale })}
                  className={cn(
                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    item.forSale ? 'bg-[#F5A623]' : 'bg-zinc-700'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                      item.forSale ? 'translate-x-4' : 'translate-x-1'
                    )}
                  />
                </button>
                <span className="text-sm text-zinc-400">このアイテムを販売する</span>
              </label>
              {item.forSale && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.salePrice}
                    onChange={(e) => updateItem(idx, { salePrice: e.target.value })}
                    placeholder="販売価格"
                    min={0}
                    className="w-full rounded-lg border border-[#F5A623]/50 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#F5A623] focus:outline-none"
                  />
                  <span className="flex-shrink-0 text-sm text-zinc-500">円</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Visibility */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400">公開範囲</label>
        <div className="flex gap-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setVisibility(opt.value)}
              className={cn(
                'flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors',
                visibility === opt.value
                  ? 'border-[#F5A623] text-[#F5A623]'
                  : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        className="w-full rounded-xl py-4 text-base font-bold text-black transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#F5A623' }}
      >
        投稿する
      </button>
    </div>
  );
}
