'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, X, ChevronDown, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { uploadImage } from '@/lib/supabase/storage';
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

interface Props {
  items: ClosetItem[];
}

interface AddForm {
  brand: string;
  name: string;
  category: ItemCategory;
  size: string;
  color: string;
  purchasePrice: string;
}

const emptyForm = (): AddForm => ({
  brand: '',
  name: '',
  category: 'tops',
  size: '',
  color: '',
  purchasePrice: '',
});

export function ClosetClient({ items: initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<ClosetItem[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState<ItemCategory | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AddForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const filtered = activeFilter === 'all'
    ? items
    : items.filter((i) => i.category === activeFilter);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!form.brand || !form.name) {
      setError('ブランドとアイテム名は必須です');
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('ログインが必要です'); setSaving(false); return; }

    let imageUrl = `https://picsum.photos/seed/${Date.now()}/400/400`;
    if (imageFile) {
      const uploaded = await uploadImage('closet', imageFile, user.id);
      if (uploaded) imageUrl = uploaded;
    }

    const { data, error: dbError } = await supabase
      .from('closet_items')
      .insert({
        user_id: user.id,
        brand: form.brand,
        name: form.name,
        category: form.category,
        size: form.size,
        color: form.color,
        image_url: imageUrl,
        purchase_price: form.purchasePrice ? parseInt(form.purchasePrice) : null,
      })
      .select()
      .single();

    if (dbError || !data) {
      setError(dbError?.message ?? '追加に失敗しました');
      setSaving(false);
      return;
    }

    const newItem: ClosetItem = {
      id: data.id,
      userId: data.user_id,
      brand: data.brand ?? '',
      name: data.name ?? '',
      category: (data.category ?? 'other') as ItemCategory,
      size: data.size ?? '',
      color: data.color ?? '',
      purchasePrice: data.purchase_price ?? undefined,
      wearCount: 0,
      isListed: false,
      imageUrl: data.image_url ?? '',
      createdAt: data.created_at,
    };

    setItems((prev) => [newItem, ...prev]);
    setForm(emptyForm());
    setImageFile(null);
    setImagePreview(null);
    setShowModal(false);
    setSaving(false);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Closet</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white"
        >
          <Plus size={12} strokeWidth={2.5} />
          追加
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-5 text-sm">
        <span><span className="font-semibold text-zinc-900">{items.length}</span> <span className="text-zinc-400">items</span></span>
        <span><span className="font-semibold text-zinc-900">{items.filter((i) => i.isListed).length}</span> <span className="text-zinc-400">listed</span></span>
        <span><span className="font-semibold text-zinc-900">{items.reduce((s, i) => s + i.wearCount, 0)}</span> <span className="text-zinc-400">wears</span></span>
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
                ? 'text-zinc-900 border-b border-zinc-900'
                : 'text-zinc-400 hover:text-zinc-600'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-zinc-400 text-sm">アイテムがありません</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="group bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                {item.isListed && (
                  <span className="absolute left-2 top-2 rounded bg-zinc-900 px-1.5 py-0.5 text-xs font-semibold text-white">
                    出品中
                  </span>
                )}
              </div>
              <div className="p-2.5 space-y-0.5">
                <p className="text-xs font-medium text-zinc-700 line-clamp-1">{item.brand}</p>
                <p className="text-xs text-zinc-500 line-clamp-1">{item.name}</p>
                <p className="text-xs text-zinc-400">{item.wearCount}回着用</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-6 space-y-4 sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">アイテムを追加</h2>
              <button onClick={() => { setShowModal(false); setError(null); setForm(emptyForm()); setImageFile(null); setImagePreview(null); }}>
                <X size={20} className="text-zinc-400" />
              </button>
            </div>

            {/* 画像選択 */}
            <div
              onClick={() => imageInputRef.current?.click()}
              className="relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 hover:border-zinc-400 transition-colors"
            >
              {imagePreview ? (
                <Image src={imagePreview} alt="preview" fill className="object-cover rounded-xl" sizes="400px" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  <Camera size={28} strokeWidth={1.5} />
                  <span className="text-xs">タップして画像を選択</span>
                </div>
              )}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                placeholder="ブランド *"
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
              />
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="アイテム名 *"
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
              />
            </div>

            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ItemCategory }))}
                className="w-full appearance-none rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.size}
                onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
                placeholder="サイズ"
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
              />
              <input
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                placeholder="カラー"
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
              />
            </div>

            <input
              type="number"
              value={form.purchasePrice}
              onChange={(e) => setForm((f) => ({ ...f, purchasePrice: e.target.value }))}
              placeholder="購入価格（円）"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={handleAdd}
              disabled={saving}
              className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {saving ? '追加中...' : '追加する'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
