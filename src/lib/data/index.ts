import { MOCK_USERS } from '@/mock/users';
import { MOCK_COORDINATES } from '@/mock/coordinates';
import { MOCK_MARKETPLACE_LISTINGS } from '@/mock/marketplace';
import { MOCK_CLOSET_ITEMS } from '@/mock/closet';
import { getRankingData } from '@/mock/ranking';
import { MOCK_QUESTS } from '@/mock/quests';
import { createClient } from '@/lib/supabase/client';
import type {
  User,
  CoordinatePost,
  CoordinatePostWithUser,
  ClosetItem,
  MarketplaceListing,
  MarketplaceListingWithSeller,
  RankingEntry,
  RankingEntryWithUser,
  RankingCategory,
  RankingPeriod,
  Quest,
  ScoreBreakdown,
  ItemCategory,
} from '@/types';

// ---- DB row → アプリ型 マッピング ----

type DbCoordinate = {
  id: string;
  user_id: string;
  image_url: string | null;
  title: string | null;
  description: string | null;
  tags: string[] | null;
  like_count: number;
  save_count: number;
  vote_count: number;
  comment_count: number;
  view_count: number;
  score: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    rank: string;
    rank_points: number;
    follower_count: number;
    following_count: number;
  } | null;
  coordinate_items: {
    id: string;
    brand: string | null;
    name: string | null;
    category: string | null;
    size: string | null;
    color: string | null;
    for_sale: boolean;
    sale_price: number | null;
  }[];
};

function dbCoordToPost(row: DbCoordinate): CoordinatePostWithUser {
  const profile = row.profiles;
  const user: User = {
    id: row.user_id,
    username: profile?.username ?? 'unknown',
    displayName: profile?.display_name ?? profile?.username ?? 'unknown',
    avatar: profile?.avatar_url ?? 'https://picsum.photos/seed/default/200',
    bio: '',
    rank: 'B',
    rankPoints: profile?.rank_points ?? 0,
    followersCount: profile?.follower_count ?? 0,
    followingCount: profile?.following_count ?? 0,
    postCount: 0,
    createdAt: row.created_at,
  };

  const post: CoordinatePost = {
    id: row.id,
    userId: row.user_id,
    imageUrl: row.image_url ?? '',
    title: row.title ?? '',
    description: row.description ?? '',
    tags: row.tags ?? [],
    items: (row.coordinate_items ?? []).map((item) => ({
      id: item.id,
      brand: item.brand ?? '',
      name: item.name ?? '',
      category: (item.category ?? 'other') as CoordinatePost['items'][number]['category'],
      size: item.size ?? '',
      color: item.color ?? '',
      forSale: item.for_sale,
      salePrice: item.sale_price ?? undefined,
    })),
    likeCount: row.like_count,
    saveCount: row.save_count,
    voteCount: row.vote_count,
    commentCount: row.comment_count,
    viewCount: row.view_count,
    score: row.score,
    createdAt: row.created_at,
  };

  return { ...post, user };
}

// ---- Users ----

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function getUsers(): User[] {
  return MOCK_USERS;
}

// ---- Coordinates (DB) ----

const COORDINATE_QUERY = `
  id, user_id, image_url, title, description, tags,
  like_count, save_count, vote_count, comment_count, view_count, score,
  is_public, created_at, updated_at,
  profiles ( username, display_name, avatar_url, rank, rank_points, follower_count, following_count ),
  coordinate_items ( id, brand, name, category, size, color, for_sale, sale_price )
` as const;

export async function getCoordinates(limit?: number): Promise<CoordinatePostWithUser[]> {
  const supabase = createClient();
  let query = supabase
    .from('coordinates')
    .select(COORDINATE_QUERY)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    // DBにデータがなければモックにフォールバック
    const sorted = [...MOCK_COORDINATES].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const sliced = limit ? sorted.slice(0, limit) : sorted;
    return sliced.map(attachUser);
  }

  return (data as unknown as DbCoordinate[]).map(dbCoordToPost);
}

export async function getCoordinateById(id: string): Promise<CoordinatePostWithUser | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('coordinates')
    .select(COORDINATE_QUERY)
    .eq('id', id)
    .single();

  if (error || !data) {
    const post = MOCK_COORDINATES.find((c) => c.id === id);
    if (!post) return undefined;
    return attachUser(post);
  }

  return dbCoordToPost(data as unknown as DbCoordinate);
}

export function getCoordinatesByUser(userId: string): CoordinatePostWithUser[] {
  return MOCK_COORDINATES.filter((c) => c.userId === userId).map(attachUser);
}

// ---- Closet ----

export function getClosetItems(userId = 'user_01', category?: ItemCategory): ClosetItem[] {
  const items = MOCK_CLOSET_ITEMS.filter((c) => c.userId === userId);
  if (category) return items.filter((c) => c.category === category);
  return items;
}

// ---- Marketplace ----

export function getMarketplaceListings(limit?: number): MarketplaceListingWithSeller[] {
  const active = MOCK_MARKETPLACE_LISTINGS.filter((l) => l.status === 'active');
  const sliced = limit ? active.slice(0, limit) : active;
  return sliced.map(attachSeller);
}

export function getMarketplaceListingById(id: string): MarketplaceListingWithSeller | undefined {
  const listing = MOCK_MARKETPLACE_LISTINGS.find((l) => l.id === id);
  if (!listing) return undefined;
  return attachSeller(listing);
}

export function getMarketplaceListingsBySeller(sellerId: string): MarketplaceListingWithSeller[] {
  return MOCK_MARKETPLACE_LISTINGS.filter((l) => l.sellerId === sellerId).map(attachSeller);
}

// ---- Ranking ----

export function getRanking(
  category: RankingCategory,
  period: RankingPeriod
): RankingEntryWithUser[] {
  const entries = getRankingData(category, period);
  return entries.map((entry) => {
    const user = getUserById(entry.userId);
    if (!user) throw new Error(`User not found: ${entry.userId}`);
    return { ...entry, user };
  });
}

// ---- Quests ----

export function getQuests(): Quest[] {
  return MOCK_QUESTS;
}

export function getQuestsByType(type: Quest['type']): Quest[] {
  return MOCK_QUESTS.filter((q) => q.type === type);
}

// ---- Score ----

export function calcScore(breakdown: Omit<ScoreBreakdown, 'total'>): ScoreBreakdown {
  const total =
    breakdown.likes * 3 +
    breakdown.saves * 5 +
    breakdown.votes * 10 +
    breakdown.comments * 2 +
    breakdown.views * 0.1 +
    breakdown.questClears * 100;
  return { ...breakdown, total };
}

export function getScoreBreakdown(post: CoordinatePost): ScoreBreakdown {
  return calcScore({
    likes: post.likeCount,
    saves: post.saveCount,
    votes: post.voteCount,
    comments: post.commentCount,
    views: post.viewCount,
    questClears: 0,
  });
}

// ---- Helpers ----

function attachUser(post: CoordinatePost): CoordinatePostWithUser {
  const user = getUserById(post.userId);
  if (!user) throw new Error(`User not found: ${post.userId}`);
  return { ...post, user };
}

function attachSeller(listing: MarketplaceListing): MarketplaceListingWithSeller {
  const seller = getUserById(listing.sellerId);
  if (!seller) throw new Error(`Seller not found: ${listing.sellerId}`);
  return { ...listing, seller };
}
