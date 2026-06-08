# 本番リリース前チェックリスト

## 1. Supabase 設定

- [ ] プロジェクトを本番用に新規作成（または既存プロジェクトを確認）
- [ ] `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を本番値に差し替え
- [ ] `SUPABASE_SERVICE_ROLE_KEY` を安全に管理（サーバーサイドのみ）
- [ ] Auth > Email 設定：確認メールの有効/無効を要件に合わせて設定
- [ ] Auth > Site URL を本番ドメインに設定
- [ ] Auth > Redirect URLs に本番ドメインを追加
- [ ] Auth > Rate Limiting を確認・調整

## 2. Prisma Migration

- [ ] `schema.prisma` が最新の設計と一致しているか確認
- [ ] `npx prisma migrate deploy` で本番 DB にマイグレーション適用
- [ ] `npx prisma db seed` でマスタデータ（クエストマスタ等）を投入
- [ ] マイグレーション後の DB をローカルで `npx prisma studio` で確認

## 3. Supabase Storage バケット

- [ ] `coordinates` バケットを作成（Public）
- [ ] `items` バケットを作成（Public）
- [ ] `avatars` バケットを作成（Public）
- [ ] 各バケットのファイルサイズ上限とMIMEタイプ制限を設定
- [ ] `STORAGE_BUCKET_COORDINATES` / `STORAGE_BUCKET_ITEMS` / `STORAGE_BUCKET_AVATARS` を `.env.local` に設定

## 4. RLS 設定

- [ ] 全テーブルで RLS を有効化（`ALTER TABLE xxx ENABLE ROW LEVEL SECURITY;`）
- [ ] `docs/rls-policy.md` のポリシーを SQL で適用
- [ ] 各ポリシーを Supabase SQL Editor でテスト（匿名ユーザー・認証済みユーザー・別ユーザーで確認）
- [ ] カウンター更新用 Trigger / Function を作成（likes → like_count 等）

## 5. 認証 (Supabase Auth)

- [ ] メール/パスワード認証を有効化
- [ ] （オプション）Google / Apple OAuth プロバイダーの設定
- [ ] サインアップ後に `profiles` テーブルへ自動挿入する Trigger を作成
- [ ] JWT expiry とリフレッシュトークンの設定を確認

## 6. Web Push (VAPID)

- [ ] `npx web-push generate-vapid-keys` で VAPID キーペアを生成
- [ ] `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` を設定
- [ ] `NEXT_PUBLIC_APP_URL` のオリジンが VAPID_SUBJECT と一致していることを確認
- [ ] Service Worker (`public/sw.js`) が正しくデプロイされているか確認

## 7. Stripe 決済

- [ ] Stripe アカウントを本番モードに切り替え
- [ ] `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` を本番キーに設定
- [ ] Webhook エンドポイント（`/api/webhooks/stripe`）を Stripe ダッシュボードに登録
- [ ] `STRIPE_WEBHOOK_SECRET` を取得・設定
- [ ] テスト決済で購入フロー（offer → order → payment）を通しで確認

## 8. メール送信 (Resend)

- [ ] Resend でドメイン認証（DNS レコード設定）を完了
- [ ] `RESEND_API_KEY` を設定
- [ ] 送信元メールアドレスを確認済みドメインのものに設定
- [ ] 通知メール・取引完了メールの送信テストを実施

## 9. Cron ジョブ

- [ ] `CRON_SECRET` に強力なランダム文字列を設定
- [ ] ランキング集計 Cron（`/api/cron/ranking`）を Vercel Cron または外部サービスで設定
- [ ] クエスト進捗リセット Cron を設定（daily/weekly）
- [ ] Cron エンドポイントへの不正アクセスを `CRON_SECRET` で保護していることを確認

## 10. ビルド・品質確認

- [ ] `npm run typecheck` がエラーなく通る
- [ ] `npm run build` が成功する
- [ ] `npm audit` でクリティカルな脆弱性がないことを確認
- [ ] `npm audit fix` で修正可能なものは修正

## 11. 環境変数の最終確認

- [ ] `.env.example` と実際の `.env.local`（本番環境変数）が乖離していないか確認
- [ ] クライアントに公開すべきでない変数（`SERVICE_ROLE_KEY`、`STRIPE_SECRET_KEY` 等）が `NEXT_PUBLIC_` プレフィックスになっていないことを確認
- [ ] Vercel / Railway / Fly.io 等のデプロイ先に全環境変数を設定

## 12. デプロイ後の動作確認

- [ ] サインアップ → プロフィール作成の一連フローを確認
- [ ] コーデ投稿・いいね・保存の動作確認
- [ ] マーケットの出品・購入フローを確認
- [ ] Push 通知の受信確認
- [ ] ランキングページの表示確認
- [ ] 管理画面のアクセス制御確認（一般ユーザーがアクセスできないこと）
