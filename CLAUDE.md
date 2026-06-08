# StyleStock Quest — CLAUDE.md

## プロジェクト概要
ファッションSNS × ランキング × RPGゲーム × クローゼット管理 × フリマを統合した差別化型Webアプリ。
コンセプト: WEAR × Instagram × Archive Stock × メルカリ × RPG

## 技術スタック
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- lucide-react（アイコン）
- 将来: Prisma + Supabase + Stripe に移行しやすい構造

## 絶対ルール
1. npm run build と npm run typecheck が常に通る状態を維持
2. 既存の動作を壊さないこと
3. 一度に1機能ずつ実装すること
4. mock dataは src/mock/ に集約
5. データアクセスは src/lib/data/ に抽象化（将来DB切り替えポイント）

## ディレクトリ構成
src/
  app/(main)/          # 各ページ
    page.tsx           # Home/Feed
    coordinate/[id]/   # コーデ詳細
    post/              # 投稿
    closet/            # クローゼット
    marketplace/       # マーケット
    marketplace/[id]/  # アイテム詳細
    ranking/           # ランキング
    quest/             # クエスト
    profile/[id]/      # プロフィール
    notifications/     # 通知
    messages/          # メッセージ
    settings/          # 設定
    admin/             # 管理画面
  components/
    ui/                # 汎用コンポーネント
    feed/              # Feed関連
    layout/            # ナビゲーション
  lib/
    data/              # データアクセス層
    score/             # スコア計算
  types/               # 型定義（index.ts に集約）
  mock/                # モックデータ

## 型定義（主要なもの）
- User: id, username, displayName, avatar, rank, rankPoints
- CoordinatePost: id, userId, imageUrl, title, items, likeCount, saveCount, voteCount, score
- WornItem: id, brand, name, category, size, color, forSale, salePrice
- ClosetItem: id, brand, name, category, wearCount, isListed
- MarketplaceListing: id, sellerId, item, price, condition, status
- RankingEntry: userId, rank, score, period, category
- ScoreBreakdown: likes, saves, votes, comments, views, total
- Quest: id, title, type, progress, target, completed

## スコア計算
total = likes×3 + saves×5 + votes×10 + comments×2 + views×0.1 + questClears×100

## UIデザイン方針
- ダークモード対応（dark: prefix使用）
- モバイルファースト
- カラー: ブラック基調 + ゴールドアクセント(#F5A623)
- アイコン: lucide-react

## P0実装方針
- DBなし、src/mock/ のデータで動作
- 認証はモックユーザー固定（MOCK_USERS[0]）
- 画像は picsum.photos のURLを使用
- Stripe/Push/EmailはUIボタンのみ（"coming soon"表示）
