# DB スキーマ設計

StyleStock Quest のテーブル設計。ORM は Prisma、DB は Supabase (PostgreSQL)。

---

## users

Supabase Auth が管理する認証ユーザー。`auth.users` を参照する形で拡張テーブルを持つ。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | Supabase Auth の user.id と一致 |
| email | text | メールアドレス（一意） |
| created_at | timestamptz | 作成日時 |

---

## profiles

ユーザーの公開プロフィール情報。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK, FK → users.id) | ユーザーID |
| username | text | ユーザー名（一意） |
| display_name | text | 表示名 |
| avatar_url | text | アバター画像URL（Storage） |
| bio | text | 自己紹介文 |
| rank | text | 現在のランク（Bronze/Silver/Gold/Platinum） |
| rank_points | int | ランクポイント累計 |
| follower_count | int | フォロワー数（非正規化） |
| following_count | int | フォロー数（非正規化） |
| is_push_enabled | bool | Push通知の有効フラグ |
| push_subscription | jsonb | Web Push サブスクリプション情報 |
| updated_at | timestamptz | 更新日時 |

---

## coordinates

コーデ投稿。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | 投稿ID |
| user_id | uuid (FK → users.id) | 投稿者 |
| image_url | text | コーデ画像URL（Storage） |
| title | text | タイトル |
| description | text | 説明文 |
| tags | text[] | タグ一覧 |
| like_count | int | いいね数（非正規化） |
| save_count | int | 保存数（非正規化） |
| vote_count | int | ベスト投票数（非正規化） |
| comment_count | int | コメント数（非正規化） |
| view_count | int | 閲覧数 |
| score | float | スコア（スコア計算式で算出） |
| is_public | bool | 公開フラグ |
| created_at | timestamptz | 投稿日時 |
| updated_at | timestamptz | 更新日時 |

---

## coordinate_items

コーデに紐づくアイテム（着用アイテムタグ）。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| coordinate_id | uuid (FK → coordinates.id) | コーデID |
| brand | text | ブランド名 |
| name | text | アイテム名 |
| category | text | カテゴリ（tops/bottoms/shoes/etc.） |
| size | text | サイズ |
| color | text | カラー |
| for_sale | bool | 販売中フラグ |
| sale_price | int | 販売価格（円） |
| closet_item_id | uuid (FK → closet_items.id, nullable) | クローゼットアイテムとの紐付け |

---

## closet_items

ユーザーのクローゼット管理。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| user_id | uuid (FK → users.id) | 所有者 |
| brand | text | ブランド名 |
| name | text | アイテム名 |
| category | text | カテゴリ |
| size | text | サイズ |
| color | text | カラー |
| image_url | text | 画像URL |
| purchase_price | int | 購入価格 |
| purchase_date | date | 購入日 |
| wear_count | int | 着用回数 |
| is_listed | bool | マーケット出品中フラグ |
| created_at | timestamptz | 登録日時 |

---

## marketplace_items

フリマ出品アイテム。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | 出品ID |
| seller_id | uuid (FK → users.id) | 出品者 |
| closet_item_id | uuid (FK → closet_items.id, nullable) | クローゼット連携 |
| title | text | タイトル |
| description | text | 説明文 |
| price | int | 価格（円） |
| condition | text | 状態（new/like_new/good/fair/poor） |
| size | text | サイズ |
| brand | text | ブランド |
| category | text | カテゴリ |
| images | text[] | 商品画像URL一覧 |
| status | text | ステータス（active/sold/cancelled） |
| created_at | timestamptz | 出品日時 |
| updated_at | timestamptz | 更新日時 |

---

## likes

コーデへのいいね。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| user_id | uuid (FK → users.id) | いいねしたユーザー |
| coordinate_id | uuid (FK → coordinates.id) | 対象コーデ |
| created_at | timestamptz | 日時 |

`(user_id, coordinate_id)` にユニーク制約。

---

## saves

コーデの保存（ブックマーク）。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| user_id | uuid (FK → users.id) | 保存したユーザー |
| coordinate_id | uuid (FK → coordinates.id) | 対象コーデ |
| created_at | timestamptz | 日時 |

`(user_id, coordinate_id)` にユニーク制約。

---

## votes

コーデへのベスト投票（週1回など制限あり）。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| user_id | uuid (FK → users.id) | 投票したユーザー |
| coordinate_id | uuid (FK → coordinates.id) | 対象コーデ |
| period | text | 投票期間キー（例: `2025-W23`） |
| created_at | timestamptz | 日時 |

`(user_id, period)` にユニーク制約（1期間1票）。

---

## comments

コーデへのコメント。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| user_id | uuid (FK → users.id) | 投稿者 |
| coordinate_id | uuid (FK → coordinates.id) | 対象コーデ |
| body | text | コメント本文 |
| created_at | timestamptz | 投稿日時 |
| updated_at | timestamptz | 更新日時 |

---

## follows

フォロー関係。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| follower_id | uuid (FK → users.id) | フォローした側 |
| following_id | uuid (FK → users.id) | フォローされた側 |
| created_at | timestamptz | フォロー日時 |

`(follower_id, following_id)` にユニーク制約。

---

## rankings

週次・月次ランキングの集計結果（Cronで生成）。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| user_id | uuid (FK → users.id) | ユーザー |
| rank | int | 順位 |
| score | float | 集計スコア |
| period | text | 集計期間キー（例: `2025-W23`） |
| category | text | カテゴリ（overall/tops/bottoms/etc.） |
| created_at | timestamptz | 集計日時 |

---

## quests

クエストマスタ。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | クエストID |
| title | text | クエスト名 |
| description | text | 説明 |
| type | text | 種別（daily/weekly/special） |
| target | int | 達成目標数 |
| reward_points | int | 達成時付与ポイント |
| is_active | bool | 有効フラグ |

---

## user_quests

ユーザーごとのクエスト進捗。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| user_id | uuid (FK → users.id) | ユーザー |
| quest_id | uuid (FK → quests.id) | クエスト |
| progress | int | 現在の進捗数 |
| completed | bool | 達成フラグ |
| completed_at | timestamptz | 達成日時 |
| period | text | 対象期間キー（daily/weeklyの場合） |

---

## notifications

ユーザーへの通知。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| recipient_id | uuid (FK → users.id) | 受信者 |
| sender_id | uuid (FK → users.id, nullable) | 送信者 |
| type | text | 通知種別（like/comment/follow/sale/system） |
| entity_type | text | 対象エンティティ種別 |
| entity_id | uuid | 対象エンティティID |
| message | text | 通知メッセージ |
| is_read | bool | 既読フラグ |
| created_at | timestamptz | 作成日時 |

---

## messages

ダイレクトメッセージ（取引・チャット）。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| room_id | uuid (FK → rooms.id) | ルームID |
| sender_id | uuid (FK → users.id) | 送信者 |
| body | text | メッセージ本文 |
| is_read | bool | 既読フラグ |
| created_at | timestamptz | 送信日時 |

---

## rooms

メッセージルーム。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ルームID |
| type | text | 種別（trade/general） |
| marketplace_item_id | uuid (FK → marketplace_items.id, nullable) | 取引対象アイテム |
| created_at | timestamptz | 作成日時 |
| last_message_at | timestamptz | 最終メッセージ日時 |

---

## room_members

ルーム参加者。

| カラム | 型 | 説明 |
|---|---|---|
| room_id | uuid (FK → rooms.id) | ルームID |
| user_id | uuid (FK → users.id) | ユーザー |
| joined_at | timestamptz | 参加日時 |

PK は `(room_id, user_id)`。

---

## offers

購入オファー（値下げ交渉）。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| marketplace_item_id | uuid (FK → marketplace_items.id) | 対象アイテム |
| buyer_id | uuid (FK → users.id) | 購入希望者 |
| offer_price | int | 提示価格 |
| status | text | ステータス（pending/accepted/rejected/expired） |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

---

## orders

決済済みの注文。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | 注文ID |
| marketplace_item_id | uuid (FK → marketplace_items.id) | 購入アイテム |
| buyer_id | uuid (FK → users.id) | 購入者 |
| seller_id | uuid (FK → users.id) | 販売者 |
| amount | int | 決済金額（円） |
| status | text | ステータス（pending/paid/shipped/completed/cancelled） |
| stripe_payment_intent_id | text | Stripe PaymentIntent ID |
| created_at | timestamptz | 注文日時 |
| updated_at | timestamptz | 更新日時 |

---

## payments

Stripe 決済レコード。

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | ID |
| order_id | uuid (FK → orders.id) | 注文ID |
| stripe_payment_intent_id | text | Stripe PaymentIntent ID（一意） |
| amount | int | 金額（円） |
| status | text | ステータス（succeeded/failed/refunded） |
| stripe_event_id | text | Webhook イベントID（冪等性確保用） |
| created_at | timestamptz | 作成日時 |

---

## スコア計算式

```
score = likes×3 + saves×5 + votes×10 + comments×2 + views×0.1 + questClears×100
```
