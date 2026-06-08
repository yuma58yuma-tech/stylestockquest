// =====================
// Enums / Literals
// =====================

export type Rank = 'S' | 'A' | 'B' | 'C' | 'D';

export type RankTier =
  | 'Beginner'
  | 'Rookie'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master'
  | 'Legend'
  | 'ArchiveKing';

export type VoteType =
  | 'BestFit'
  | 'Cool'
  | 'Unique'
  | 'Clean'
  | 'Street'
  | 'Vintage'
  | 'ExpensiveLooking'
  | 'GoodColor'
  | 'WantToBuy';

export type XPEventKind =
  | 'post'
  | 'like_received'
  | 'save_received'
  | 'vote_received'
  | 'comment_received'
  | 'ranking_award'
  | 'item_sold'
  | 'quest_completed';

export interface XPEvent {
  kind: XPEventKind;
  /** 倍率など追加パラメータ（省略時は1） */
  multiplier?: number;
}

export type ItemCategory =
  | 'tops'
  | 'bottoms'
  | 'outerwear'
  | 'shoes'
  | 'bag'
  | 'accessory'
  | 'hat'
  | 'other';

export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export type ListingStatus = 'active' | 'sold' | 'reserved' | 'cancelled';

export type RankingCategory = 'overall' | 'likes' | 'saves' | 'votes' | 'newcomer';

export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'alltime';

export type QuestType = 'daily' | 'weekly';

// =====================
// Core Models
// =====================

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  rank: Rank;
  rankPoints: number;
  followersCount: number;
  followingCount: number;
  postCount: number;
  createdAt: string;
}

export interface WornItem {
  id: string;
  brand: string;
  name: string;
  category: ItemCategory;
  size: string;
  color: string;
  forSale: boolean;
  salePrice?: number;
}

export interface CoordinatePost {
  id: string;
  userId: string;
  imageUrl: string;
  title: string;
  description: string;
  tags: string[];
  items: WornItem[];
  likeCount: number;
  saveCount: number;
  voteCount: number;
  commentCount: number;
  viewCount: number;
  score: number;
  createdAt: string;
}

export interface ClosetItem {
  id: string;
  userId: string;
  brand: string;
  name: string;
  category: ItemCategory;
  size: string;
  color: string;
  purchasePrice?: number;
  wearCount: number;
  isListed: boolean;
  imageUrl: string;
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  item: ClosetItem;
  price: number;
  condition: ItemCondition;
  description: string;
  status: ListingStatus;
  viewCount: number;
  likeCount: number;
  createdAt: string;
}

export interface RankingEntry {
  userId: string;
  rank: number;
  score: number;
  period: RankingPeriod;
  category: RankingCategory;
  rankChange: number; // positive = up, negative = down, 0 = same
}

export interface ScoreBreakdown {
  likes: number;
  saves: number;
  votes: number;
  comments: number;
  views: number;
  questClears: number;
  total: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  progress: number;
  target: number;
  completed: boolean;
  rewardPoints: number;
  expiresAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'save' | 'vote' | 'follow' | 'comment' | 'sale' | 'rank_up' | 'quest';
  fromUserId?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
}

// =====================
// Computed / UI Types
// =====================

export interface CoordinatePostWithUser extends CoordinatePost {
  user: User;
}

export interface RankingEntryWithUser extends RankingEntry {
  user: User;
}

export interface MarketplaceListingWithSeller extends MarketplaceListing {
  seller: User;
}
