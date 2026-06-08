import { MOCK_USERS } from '@/mock/users';
import { MOCK_COORDINATES } from '@/mock/coordinates';
import { MOCK_MARKETPLACE_LISTINGS } from '@/mock/marketplace';
import { MOCK_CLOSET_ITEMS } from '@/mock/closet';
import { getRankingData } from '@/mock/ranking';
import { MOCK_QUESTS } from '@/mock/quests';
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

// ---- Users ----

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function getUsers(): User[] {
  return MOCK_USERS;
}

// ---- Coordinates ----

export function getCoordinates(limit?: number): CoordinatePostWithUser[] {
  const sorted = [...MOCK_COORDINATES].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sliced = limit ? sorted.slice(0, limit) : sorted;
  return sliced.map(attachUser);
}

export function getCoordinateById(id: string): CoordinatePostWithUser | undefined {
  const post = MOCK_COORDINATES.find((c) => c.id === id);
  if (!post) return undefined;
  return attachUser(post);
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
