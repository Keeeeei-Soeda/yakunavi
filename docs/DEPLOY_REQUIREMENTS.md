# デプロイに必要な情報・チェックリスト

本番デプロイ（初回セットアップ・更新・LPのみ）の前に確認すべき項目をまとめたドキュメントです。

関連ドキュメント:

- [DEPLOYMENT.md](./DEPLOYMENT.md) — 本番での具体的なコマンド手順
- [DOMAIN_SSL.md](./DOMAIN_SSL.md) — ドメイン・SSL・Nginx
- [SUBDOMAIN_YAKKYOKU_LP.md](./SUBDOMAIN_YAKKYOKU_LP.md) — サブドメインLP（yakkyoku / yakuzaishi）
- [SETUP.md](./SETUP.md) — ローカル開発環境のセットアップ

---

## 1. デプロイの種類

| パターン | 必要なもの |
|----------|------------|
| **既存本番（85.131.247.170）への更新** | SSH鍵、`git pull`、ビルド、PM2再起動。LP変更時は `/var/www/` への `cp` |
| **新規サーバーへの初回デプロイ** | 下記「2〜5」のすべて（インフラ・DB・環境変数・Nginx・SSL・DNS） |
| **LPのみ更新**（`phaemacy_lp.html` など） | `git pull` + `sudo cp` のみ（アプリのビルド不要） |

---

## 2. リポジトリ側で足りない／未整備のもの

### 2.1 環境変数テンプレートがない

`README.md` / `docs/SETUP.md` は `backend/.env.example` を参照していますが、**リポジトリに `.env.example` がありません**（`.env` は `.gitignore` で除外済み）。

本番用に、サーバー上で次を自分で用意する必要があります。

#### バックエンド `backend/.env`（必須・推奨）

| 変数名 | 用途 |
|--------|------|
| `DATABASE_URL` | PostgreSQL接続（必須） |
| `JWT_SECRET` | 認証（本番では強いランダム値が必須） |
| `NODE_ENV` | `production` |
| `PORT` | 既定 `5001` |
| `FRONTEND_URL` | CORS許可オリジン（例: `https://yaku-navi.com`） |
| `RESEND_API_KEY` | メール送信（未設定だとメール機能は動かない） |
| `FROM_EMAIL` / `FROM_NAME` | 送信元 |
| `ADMIN_EMAILS` | お問い合わせ通知先（カンマ区切り） |
| `PAYMENT_REPORT_NOTIFY_EMAIL` | 支払い報告の通知先 |
| `UPLOAD_DIR` | 証明書アップロード先（例: `./uploads/certificates`） |

任意: `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`

`docs/DOMAIN_SSL.md` では `CORS_ORIGIN` も記載されていますが、コード上の CORS は主に `FRONTEND_URL` で制御されています。

#### フロントエンド `frontend/.env.local`（ビルド前に必須）

| 変数名 | 用途 |
|--------|------|
| `NEXT_PUBLIC_API_URL` | 本番は `https://yaku-navi.com/api` |
| `NEXT_PUBLIC_GA_ID` | GA4（未設定時はコード内デフォルト `G-9T7LVD6HVV`） |

### 2.2 LP用画像がリポジトリにない

`LP_page/images/` には `README.txt` のみで、**実画像ファイルは Git に含まれていません**。

デプロイ後も、サーバー上の `LP_page/images/` または `/var/www/yakkyoku/images/`・`/var/www/yakuzaishi/images/` に別途配置が必要です。

**薬局向けLP（`phaemacy_lp.html`）**

- `pain_manager.jpg`
- `process_team.jpg`
- `cta_pharmacist.jpg`
- `banner_campaign.png`（HTMLで参照）

**薬剤師向けLP（`pharmacist_lp.html`）**

- `hero_pharmacist.jpg`
- `solution_team.jpg`
- `reason_01.jpg` 〜 `reason_04.jpg`
- `case_pharmacist_01.jpg`, `case_pharmacist_02.jpg`
- `flow_scene_01.jpg` 〜 `flow_scene_03.jpg`
- `cta_pharmacist.jpg`（薬局LPと共通）

一覧は `LP_page/images/README.txt` を参照。

### 2.3 Prismaマイグレーションが Git 管理外

`.gitignore` に `prisma/migrations/` があり、**マイグレーションSQLはリポジトリに含まれません**。

新規サーバーで `npx prisma migrate deploy` だけではスキーマが揃わない可能性があります。対応案:

- 既存本番DBのダンプを復元する
- マイグレーションを Git 管理に含める（`.gitignore` の見直し）

### 2.4 デプロイ設定の不整合

| 項目 | 内容 |
|------|------|
| `deploy.sh` | パスが `~/yaku_navi` |
| `docs/DEPLOYMENT.md` | パスが `/root/yaku_navi` |
| `IMPLEMENTATION_PLAN.md` | `deployment/` フォルダ（`ecosystem.config.js` 等）を想定しているが**未作成** |
| フロントのポート | `docs/DOMAIN_SSL.md` は 3000、`package.json` / `nginx-yaku-navi.conf` は **3001** |

---

## 3. サーバー・インフラで用意が必要な情報

### 3.1 アクセス情報

| 項目 | 内容 |
|------|------|
| SSH | `ssh_yakunavi.pem`（`.gitignore` 対象。ローカル保管） |
| 接続例 | `ssh -i ssh_yakunavi.pem root@85.131.247.170` |
| Git | 本番サーバーから `git pull` できる認証（Deploy key / PAT 等） |

### 3.2 DNS（ドメイン管理画面）

| ホスト名 | 種別 | 向き先 |
|----------|------|--------|
| `yaku-navi.com` / `www` | A | `85.131.247.170` |
| `yakkyoku.yaku-navi.com` | A | 同上（薬局LP） |
| `yakuzaishi.yaku-navi.com` | A | 同上（薬剤師LP） |

### 3.3 サーバー上のソフトウェア（初回デプロイ時）

- Node.js 20+
- PostgreSQL 14+（DB名・ユーザー・パスワード）
- Nginx（`nginx-yaku-navi.conf` を `/etc/nginx/sites-available/` に配置）
- PM2（プロセス名: `yaku-navi-backend` / `yaku-navi-frontend`）
- Certbot（Let's Encrypt）
- LP用ディレクトリ: `/var/www/yakkyoku`, `/var/www/yakuzaishi`

### 3.4 外部サービス

- **Resend**: APIキー、送信ドメイン認証（`noreply@yaku-navi.com` 等）
- **Google Analytics / Ads**: LPにハードコード済み（変更不要ならそのまま利用可）

### 3.5 運用データ（初回のみ）

- **管理者アカウント**: 本番DBに未作成なら `npm run create:admin`（[ADMIN.md](./ADMIN.md) 参照）
- **PDF用フォント**: `backend/fonts/`（`backend/fonts/DOWNLOAD_INSTRUCTIONS.md` 参照）
- **アップロードディレクトリ**: `backend/uploads/` の権限・永続化

---

## 4. デプロイ手順上「忘れやすい」ポイント

1. **LPは `git pull` だけでは反映されない**  
   Nginx は `/var/www/yakkyoku`・`/var/www/yakuzaishi` を参照するため、コピーが必要:

   ```bash
   sudo cp -r /root/yaku_navi/LP_page/* /var/www/yakkyoku/
   sudo chown -R www-data:www-data /var/www/yakkyoku
   sudo cp -r /root/yaku_navi/LP_page/* /var/www/yakuzaishi/
   sudo chown -R www-data:www-data /var/www/yakuzaishi
   ```

2. **バックエンド変更時は必ず `npm run build`**  
   本番は `dist/` のコンパイル済み JS で動作する。未ビルドだと 404 / 500 の原因になる。

3. **DBスキーマ変更時**  
   `npx prisma migrate deploy` のあと、必要なら `scripts/` のデータ移行スクリプトを実行。

4. **環境変数変更後**  
   `pm2 restart all --update-env` と、フロントエンドの再ビルド。

---

## 5. デプロイ前チェックリスト

- [ ] SSH鍵とサーバーへのログイン
- [ ] `backend/.env` の全項目（特に `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `RESEND_API_KEY`）
- [ ] `frontend/.env.local` の `NEXT_PUBLIC_API_URL`
- [ ] PostgreSQLが起動し、本番DBが存在する
- [ ] DNSがサーバーIPを向いている
- [ ] SSL証明書（メイン + サブドメインLP）
- [ ] Nginx設定反映・`nginx -t` 成功
- [ ] PM2プロセスが登録済み
- [ ] LP画像を所定ディレクトリに配置
- [ ] デプロイ対象ブランチ（通常 `main`）とコミット内容

### デプロイ後の確認（例）

- [ ] `curl http://localhost:5001/health` が 200
- [ ] https://yaku-navi.com が表示される
- [ ] https://yakkyoku.yaku-navi.com/（薬局LP）
- [ ] https://yakuzaishi.yaku-navi.com/（薬剤師LP）
- [ ] 管理者ログイン（[ADMIN.md](./ADMIN.md)）

---

## 6. まとめ

**コードはリポジトリに揃っているが、リポジトリ外で必須なのは主に次の3つです。**

1. **秘密情報** — DB接続、JWT、Resend、管理者メールなどの `.env`
2. **インフラアクセス** — SSH、DNS、（初回なら）Nginx / SSL / PM2 / PostgreSQL のセットアップ
3. **静的アセット** — LP画像、（必要なら）PDFフォント

| 状況 | 最優先で確認すること |
|------|----------------------|
| 既存本番への更新 | SSH + サーバー上の `.env` が既にあるか |
| 初回デプロイ | DB初期化・管理者作成・マイグレーション方針 |
| LPのみ | `git pull` 後の `/var/www/` への `cp` と画像の有無 |

---

**作成日**: 2026年5月22日
