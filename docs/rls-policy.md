# RLS (Row Level Security) ポリシー設計

Supabase の全テーブルで RLS を有効化する。ポリシーは最小権限の原則に従う。

---

## profiles

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT | 全員 | `is_public = true` または認証済み全員 |
| UPDATE | 本人のみ | `auth.uid() = id` |
| INSERT | 本人のみ | `auth.uid() = id`（サインアップ時のみ） |
| DELETE | 禁止 | — |

```sql
-- public read
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

-- owner update
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

## coordinates

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT | 全員 | `is_public = true` |
| INSERT | 認証済み | `auth.uid() = user_id` |
| UPDATE | 本人のみ | `auth.uid() = user_id` |
| DELETE | 本人のみ | `auth.uid() = user_id` |

```sql
CREATE POLICY "coordinates_select" ON coordinates
  FOR SELECT USING (is_public = true);

CREATE POLICY "coordinates_insert" ON coordinates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "coordinates_update" ON coordinates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "coordinates_delete" ON coordinates
  FOR DELETE USING (auth.uid() = user_id);
```

---

## coordinate_items

`coordinates` の公開状態に連動する。

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT | 全員 | 親 coordinate が public |
| INSERT/UPDATE/DELETE | 本人のみ | 親 coordinate の user_id が自分 |

---

## closet_items

完全プライベート。本人のみアクセス可。

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT | 本人のみ | `auth.uid() = user_id` |
| INSERT | 本人のみ | `auth.uid() = user_id` |
| UPDATE | 本人のみ | `auth.uid() = user_id` |
| DELETE | 本人のみ | `auth.uid() = user_id` |

```sql
CREATE POLICY "closet_items_owner" ON closet_items
  FOR ALL USING (auth.uid() = user_id);
```

---

## marketplace_items

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT | 全員 | `status = 'active'` |
| INSERT | 認証済み | `auth.uid() = seller_id` |
| UPDATE | 本人のみ | `auth.uid() = seller_id` |
| DELETE | 本人のみ | `auth.uid() = seller_id` |

---

## likes / saves

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT | 全員 | — |
| INSERT | 認証済み | `auth.uid() = user_id` |
| DELETE | 本人のみ | `auth.uid() = user_id` |

---

## votes

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT | 全員 | — |
| INSERT | 認証済み | `auth.uid() = user_id`（期間内1票制限はアプリ層で制御） |
| DELETE | 本人のみ | `auth.uid() = user_id` |

---

## comments

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT | 全員 | — |
| INSERT | 認証済み | `auth.uid() = user_id` |
| UPDATE | 本人のみ | `auth.uid() = user_id` |
| DELETE | 本人のみ | `auth.uid() = user_id` |

---

## follows

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT | 全員 | — |
| INSERT | 認証済み | `auth.uid() = follower_id` |
| DELETE | 本人のみ | `auth.uid() = follower_id` |

---

## messages / rooms / room_members

ルームメンバーのみアクセス可。

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT (messages) | ルームメンバー | `room_id IN (SELECT room_id FROM room_members WHERE user_id = auth.uid())` |
| INSERT (messages) | ルームメンバー | 同上 |
| SELECT (rooms) | ルームメンバー | `id IN (SELECT room_id FROM room_members WHERE user_id = auth.uid())` |

```sql
CREATE POLICY "messages_room_member" ON messages
  FOR ALL USING (
    room_id IN (
      SELECT room_id FROM room_members WHERE user_id = auth.uid()
    )
  );
```

---

## notifications

受信者本人のみ。

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT | 本人のみ | `auth.uid() = recipient_id` |
| UPDATE | 本人のみ | `auth.uid() = recipient_id`（既読更新） |
| INSERT | サービスロールのみ | RLS バイパス（service_role key 使用） |

```sql
CREATE POLICY "notifications_recipient" ON notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (auth.uid() = recipient_id);
```

---

## offers

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT | 買い手または売り手 | `auth.uid() = buyer_id OR auth.uid() IN (SELECT seller_id FROM marketplace_items WHERE id = marketplace_item_id)` |
| INSERT | 認証済み（買い手） | `auth.uid() = buyer_id` |
| UPDATE | 売り手のみ（承認/拒否） | seller_id チェック |

---

## orders / payments

| 操作 | 対象 | 条件 |
|---|---|---|
| SELECT | 買い手または売り手 | `auth.uid() = buyer_id OR auth.uid() = seller_id` |
| INSERT | サービスロールのみ | Webhook 処理時のみ（service_role key） |
| UPDATE | サービスロールのみ | Webhook 処理時のみ |

---

## rankings / quests / user_quests

| テーブル | SELECT | 書き込み |
|---|---|---|
| rankings | 全員 | Cron ジョブ（service_role） |
| quests | 全員 | service_role のみ |
| user_quests | 本人のみ（`auth.uid() = user_id`） | service_role（進捗更新） |

---

## 注意事項

- `service_role` キーを使う処理（Webhook、Cron）は必ず **サーバーサイド** で実行し、クライアントに公開しない。
- カウンター非正規化（`like_count` 等）は Supabase の **Database Function + Trigger** で更新する。
- RLS を有効化したまま管理者操作が必要な場合は Supabase の **SQL Editor**（service_role 権限）を使用する。
