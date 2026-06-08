# StyleStock Quest

ファッションSNS × ランキング × RPGゲーム × クローゼット管理 × フリマを統合した差別化型 Web アプリ。

**コンセプト:** WEAR × Instagram × Archive Stock × メルカリ × RPG

---

## 主要機能

| 機能 | 説明 |
|---|---|
| **コーデ投稿 (SNS)** | コーデ写真・着用アイテムタグ付きで投稿。いいね・保存・ベスト投票 |
| **ランキング** | スコアで週次・月次ランキングを自動集計。ランク（Bronze〜Platinum）が上がる |
| **RPGクエスト** | 「今週3回投稿する」などのクエストをクリアしてポイント獲得 |
| **クローゼット管理** | 所持アイテムを登録・着用回数を管理。マーケットへワンクリック出品 |
| **フリマ (マーケット)** | クローゼットから出品・Stripe で決済。値下げオファー機能付き |
| **メッセージ** | 取引ごとのルームでバイヤー↔セラーがチャット |
| **Push 通知** | いいね・コメント・取引更新などをリアルタイムで通知 |

### スコア計算式

```
score = いいね×3 + 保存×5 + 投票×10 + コメント×2 + 閲覧×0.1 + クエストクリア×100
```

---

## 技術構成

| レイヤー | 採用技術 |
|---|---|
| フロントエンド | Next.js 14 (App Router) + TypeScript (strict) |
| スタイリング | Tailwind CSS、lucide-react |
| バックエンド/DB | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| ORM | Prisma |
| 決済 | Stripe |
| メール | Resend |
| Push 通知 | Web Push API (VAPID) |
| デプロイ | Vercel 推奨 |

---

## セットアップ方法

### 前提

- Node.js 18+
- npm 9+

### 手順

```bash
# 1. リポジトリをクローン
git clone <repo-url>
cd stylestockquest

# 2. 依存パッケージをインストール
npm install

# 3. 環境変数を設定
cp .env.example .env.local
# .env.local を編集して各値を設定

# 4. 開発サーバー起動
npm run dev
```

開発サーバーは http://localhost:3000 で起動します。

---

## mock 運用と本番運用の違い

### mock 運用（現在の状態）

| 項目 | 内容 |
|---|---|
| データ | `src/mock/` 以下の静的 TypeScript データ |
| 認証 | `MOCK_USERS[0]` を固定ユーザーとして使用 |
| 画像 | `picsum.photos` の URL を使用 |
| 決済・Push・メール | UI ボタンのみ（"coming soon" 表示） |
| DB 接続 | 不要（環境変数の設定も不要） |

**モックで開発サーバーを動かすだけなら `.env.local` の設定は不要です。**

### 本番運用

| 項目 | 内容 |
|---|---|
| データ | Supabase PostgreSQL（Prisma 経由） |
| 認証 | Supabase Auth（メール/パスワード） |
| 画像 | Supabase Storage（3バケット） |
| 決済 | Stripe（PaymentIntent + Webhook） |
| Push | Web Push API（VAPID キー必要） |
| メール | Resend |
| データアクセス層 | `src/lib/data/` 以下の関数を mock → Supabase に切り替え |

本番化の詳細手順は [`docs/production-checklist.md`](docs/production-checklist.md) を参照。

---

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動 (http://localhost:3000)
npm run build        # 本番ビルド
npm run typecheck    # TypeScript 型チェック
npm run lint         # ESLint
npm run preview      # 本番ビルドのプレビュー
```

---

## ドキュメント

| ファイル | 内容 |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | AI 開発アシスタント向けガイド |
| [`.env.example`](.env.example) | 環境変数テンプレート |
| [`docs/schema.md`](docs/schema.md) | DB テーブル設計 |
| [`docs/rls-policy.md`](docs/rls-policy.md) | Supabase RLS ポリシー設計 |
| [`docs/production-checklist.md`](docs/production-checklist.md) | 本番リリース前チェックリスト |

---

## ディレクトリ構成

```
src/
  app/(main)/          # 各ページ（App Router）
  components/
    ui/                # 汎用 UI コンポーネント
    feed/              # フィード関連
    layout/            # ナビゲーション
  lib/
    data/              # データアクセス層（mock → DB の切り替えポイント）
    score/             # スコア計算ロジック
  types/               # 型定義（index.ts に集約）
  mock/                # モックデータ
```
