import type { RankTier } from '@/types';

const TIER_STYLES: Record<RankTier, { bg: string; text: string; border: string }> = {
  Beginner:      { bg: 'bg-zinc-800',         text: 'text-zinc-400',   border: 'border-zinc-600' },
  Rookie:        { bg: 'bg-zinc-700',         text: 'text-zinc-200',   border: 'border-zinc-500' },
  Bronze:        { bg: 'bg-amber-900/40',     text: 'text-amber-600',  border: 'border-amber-700' },
  Silver:        { bg: 'bg-slate-700/40',     text: 'text-slate-300',  border: 'border-slate-400' },
  Gold:          { bg: 'bg-yellow-900/40',    text: 'text-yellow-400', border: 'border-yellow-500' },
  Platinum:      { bg: 'bg-cyan-900/40',      text: 'text-cyan-300',   border: 'border-cyan-500' },
  Diamond:       { bg: 'bg-sky-900/40',       text: 'text-sky-300',    border: 'border-sky-400' },
  Master:        { bg: 'bg-purple-900/40',    text: 'text-purple-300', border: 'border-purple-500' },
  Legend:        { bg: 'bg-rose-900/40',      text: 'text-rose-300',   border: 'border-rose-500' },
  ArchiveKing:   { bg: 'bg-[#F5A623]/10',     text: 'text-[#F5A623]',  border: 'border-[#F5A623]' },
};

interface Props {
  tier: RankTier;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export default function RankBadge({ tier, size = 'md' }: Props) {
  const { bg, text, border } = TIER_STYLES[tier];
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border font-bold tracking-wide',
        bg,
        text,
        border,
        SIZE_CLASSES[size],
      ].join(' ')}
    >
      {tier}
    </span>
  );
}
