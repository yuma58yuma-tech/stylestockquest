import { MOCK_COORDINATES } from '@/mock/coordinates';
import { MOCK_MARKETPLACE_LISTINGS } from '@/mock/marketplace';
import { MOCK_QUESTS } from '@/mock/quests';
import { MOCK_USERS } from '@/mock/users';
import type { ScoreBreakdown } from '@/types';

// 1日あたりのスコア上限（チート対策）
const DAILY_SCORE_CAP = 500;

// 他人からの評価の重み（全体の70%）
const PEER_WEIGHTS = {
  vote: 20,
  save: 10,
  like: 5,
  comment: 3,
  purchase: 50,
};

// 自分のアクティビティの重み（全体の30%）
const ACTIVITY_WEIGHTS = {
  loginDay: 2,
  listing: 5,
  review: 10,  // 平均評価 × 10
  post: 3,
  quest: 15,
};

function getMockDataForUser(userId: string) {
  const user = MOCK_USERS.find((u) => u.id === userId);
  const posts = MOCK_COORDINATES.filter((c) => c.userId === userId);
  const listings = MOCK_MARKETPLACE_LISTINGS.filter((l) => l.sellerId === userId);
  const quests = MOCK_QUESTS.filter((q) => q.completed);

  const votes = posts.reduce((s, p) => s + p.voteCount, 0);
  const saves = posts.reduce((s, p) => s + p.saveCount, 0);
  const likes = posts.reduce((s, p) => s + p.likeCount, 0);
  const comments = posts.reduce((s, p) => s + p.commentCount, 0);
  const purchases = listings.filter((l) => l.status === 'sold').length;

  // ログイン継続日数: createdAt からの経過月数×4 で近似（モックなのでDB計算の代替）
  const createdAt = user?.createdAt ? new Date(user.createdAt) : new Date();
  const now = new Date('2026-06-08');
  const monthsActive = Math.max(
    0,
    (now.getFullYear() - createdAt.getFullYear()) * 12 +
      (now.getMonth() - createdAt.getMonth())
  );
  const loginDays = monthsActive * 20; // 月20日ログインを仮定

  // レビュー評価平均: モックでは postCount をベースに 3.5〜4.5 の仮値
  const reviewAvg = posts.length > 0 ? 4.0 : 0;

  return {
    votes,
    saves,
    likes,
    comments,
    purchases,
    loginDays,
    listings: listings.length,
    reviews: reviewAvg,
    posts: posts.length,
    quests: quests.length,
  };
}

export function calcUserScore(userId: string): number {
  const d = getMockDataForUser(userId);

  const rawPeer =
    d.votes * PEER_WEIGHTS.vote +
    d.saves * PEER_WEIGHTS.save +
    d.likes * PEER_WEIGHTS.like +
    d.comments * PEER_WEIGHTS.comment +
    d.purchases * PEER_WEIGHTS.purchase;

  const rawActivity =
    d.loginDays * ACTIVITY_WEIGHTS.loginDay +
    d.listings * ACTIVITY_WEIGHTS.listing +
    d.reviews * ACTIVITY_WEIGHTS.review +
    d.posts * ACTIVITY_WEIGHTS.post +
    d.quests * ACTIVITY_WEIGHTS.quest;

  // 1日スコア上限を適用（ここではalltime想定のため日数で割って上限チェック）
  const cappedPeer = Math.min(rawPeer, DAILY_SCORE_CAP * 365);
  const cappedActivity = Math.min(rawActivity, DAILY_SCORE_CAP * 365);

  return Math.round(cappedPeer * 0.7 + cappedActivity * 0.3);
}

export function getScoreBreakdown(userId: string): ScoreBreakdown {
  const d = getMockDataForUser(userId);

  const rawPeer =
    d.votes * PEER_WEIGHTS.vote +
    d.saves * PEER_WEIGHTS.save +
    d.likes * PEER_WEIGHTS.like +
    d.comments * PEER_WEIGHTS.comment +
    d.purchases * PEER_WEIGHTS.purchase;

  const rawActivity =
    d.loginDays * ACTIVITY_WEIGHTS.loginDay +
    d.listings * ACTIVITY_WEIGHTS.listing +
    d.reviews * ACTIVITY_WEIGHTS.review +
    d.posts * ACTIVITY_WEIGHTS.post +
    d.quests * ACTIVITY_WEIGHTS.quest;

  const cap = DAILY_SCORE_CAP * 365;
  const peerScore = Math.round(Math.min(rawPeer, cap) * 0.7);
  const activityScore = Math.round(Math.min(rawActivity, cap) * 0.3);

  return {
    peerScore,
    activityScore,
    total: peerScore + activityScore,
    breakdown: {
      votes: d.votes,
      saves: d.saves,
      likes: d.likes,
      comments: d.comments,
      purchases: d.purchases,
      loginDays: d.loginDays,
      listings: d.listings,
      reviews: d.reviews,
      posts: d.posts,
      quests: d.quests,
    },
  };
}
