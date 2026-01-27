# Xserver VPS デプロイログ

## 📋 デプロイ概要

- **サーバー**: Xserver VPS
- **OS**: Ubuntu 25.04
- **IPアドレス**: 85.131.247.170
- **ホスト名**: x85-131-247-170.static.xvps.ne.jp
- **デプロイ日時**: 2026年1月27日

## 🚀 実行した手順

### ステップ1: システムの状態確認

```bash
node --version    # 結果: コマンドが見つからない
npm --version     # 結果: コマンドが見つからない
psql --version    # 結果: コマンドが見つからない
git --version     # 結果: git version 2.48.1 ✅
```

**結果**: Gitのみインストール済み。Node.js、npm、PostgreSQLは未インストール。

---

### ステップ2: システムの更新

```bash
apt update && apt upgrade -y
```

**結果**: 
- 62.6 MBのパッケージを取得
- システム更新完了
- ⚠️ カーネルアップグレードが保留（6.14.0-15-generic → 6.14.0-37-generic）
- ⚠️ システムの再起動が必要（後で実行予定）

---

### ステップ3: Node.js 20.xのインストール

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

**結果**:
- Node.js 20.20.0 インストール完了 ✅
- npm 10.8.2 インストール完了 ✅

**警告**:
- npm 11.8.0へのアップデートが利用可能（後で対応可能）

---

### ステップ4: PostgreSQLのインストール

```bash
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql
```

**結果**:
- PostgreSQL 17.7 (Ubuntu 17.7-0ubuntu0.25.04.1) インストール完了 ✅
- サービス起動・自動起動設定完了 ✅

---

### ステップ5: PM2のインストール

```bash
npm install -g pm2
pm2 startup
```

**結果**:
- PM2 インストール完了 ✅
- 自動起動設定完了 ✅
- systemdサービスファイル作成: `/etc/systemd/system/pm2-root.service`

**出力**:
```
[PM2] Init System found: systemd
[PM2] Writing init configuration in /etc/systemd/system/pm2-root.service
[PM2] Making script booting at startup...
[PM2] [v] Command successfully executed.
```

---

### ステップ6: Nginxのインストール

```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

**結果**:
- Nginx 1.26.3-2ubuntu1.2 インストール完了 ✅
- サービス起動・自動起動設定完了 ✅

**状態確認**:
```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: active (running) since Tue 2026-01-27 23:03:30 JST
```

---

### ステップ7: データベースのセットアップ

#### 7.1 データベースとユーザーの作成

```bash
sudo -u postgres psql
```

PostgreSQL内で実行:
```sql
CREATE DATABASE pharmacy_db;
CREATE USER pharmacy_user WITH PASSWORD 'Yakunavi168';
GRANT ALL PRIVILEGES ON DATABASE pharmacy_db TO pharmacy_user;
\q
```

**結果**:
- データベース `pharmacy_db` 作成完了 ✅
- ユーザー `pharmacy_user` 作成完了 ✅
- 権限付与完了 ✅

#### 7.2 スキーマ権限の付与（エラー対応）

**発生したエラー**:
```
Error: ERROR: permission denied for schema public
```

**原因**: PostgreSQL 15以降では、`public`スキーマに対する権限がデフォルトで制限されている。

**解決方法**:
```bash
sudo -u postgres psql
\c pharmacy_db
ALTER SCHEMA public OWNER TO pharmacy_user;
GRANT ALL ON SCHEMA public TO pharmacy_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pharmacy_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pharmacy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pharmacy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pharmacy_user;
\q
```

**結果**: 権限付与完了 ✅

---

### ステップ8: プロジェクトファイルの取得

```bash
cd ~
mkdir -p yaku_navi
cd yaku_navi
git clone https://github.com/Keeeeei-Soeda/yakunavi.git .
```

**結果**:
- GitHubからプロジェクトクローン完了 ✅
- 228オブジェクト、22.17 MiB取得
- `.dockerignore`ファイルも含まれていることを確認 ✅

**取得されたファイル**:
- `backend/` - バックエンドディレクトリ
- `frontend/` - フロントエンドディレクトリ
- `.dockerignore` - Docker設定ファイル
- `DEPLOY_STEPS.md` - デプロイ手順書
- その他ドキュメントファイル

---

### ステップ9: バックエンドのセットアップ

#### 9.1 依存関係のインストール

```bash
cd ~/yaku_navi/backend
npm install --production
```

**結果**:
- 264パッケージインストール完了 ✅
- インストール時間: 約10秒

**警告**:
- 非推奨パッケージの警告（後で対応可能）:
  - `rimraf@3.0.2`
  - `npmlog@5.0.1`
  - `multer@1.4.5-lts.2`
  - `inflight@1.0.6`
  - `are-we-there-yet@2.0.0`
  - `gauge@3.0.2`
  - `glob@7.2.3`
  - `tar@6.2.1`
  - `jpeg-exif@1.1.4`

**脆弱性**:
- 3件の高重要度脆弱性が検出（後で対応可能）

#### 9.2 .envファイルの作成

```bash
nano .env
```

**設定内容**:
```env
DATABASE_URL="postgresql://pharmacy_user:Yakunavi168@localhost:5432/pharmacy_db?schema=public"
JWT_SECRET=Yakunavi2024ProductionSecretKeyChangeThisToRandomString32CharsMin
JWT_REFRESH_SECRET=Yakunavi2024RefreshSecretKeyChangeThisToRandomString32CharsMin
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
PORT=5001
NODE_ENV=production
FRONTEND_URL=http://85.131.247.170:3000
RESEND_API_KEY=
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**結果**: `.env`ファイル作成完了 ✅

**注意事項**:
- IPアドレス（85.131.247.170）を使用
- ドメイン取得後は`FRONTEND_URL`を`https://your-domain.com`に変更予定

#### 9.3 Prismaクライアントの生成

```bash
npm run prisma:generate
```

**結果**:
- Prisma Client (v5.22.0) 生成完了 ✅
- 生成時間: 526ms

**出力**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 526ms
```

#### 9.4 データベースマイグレーション

**初回実行（エラー発生）**:
```bash
npx prisma migrate deploy
```

**エラー内容**:
```
No migration found in prisma/migrations
Error: ERROR: permission denied for schema public
```

**原因**: 
1. `.gitignore`に`prisma/migrations/`が含まれているため、マイグレーションファイルがGitHubに含まれていない
2. PostgreSQLの`public`スキーマに対する権限不足（既に解決済み）

**解決方法**: スキーマを直接データベースに適用

```bash
npx prisma db push
```

**結果**:
- データベースがスキーマと同期完了 ✅
- 処理時間: 318ms
- Prisma Client再生成: 443ms

**出力**:
```
🚀  Your database is now in sync with your Prisma schema. Done in 318ms
✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 443ms
```

---

### ステップ10: バックエンドのビルドと起動

#### 10.1 開発依存関係のインストール

**初回実行（エラー発生）**:
```bash
cd ~/yaku_navi/backend
npm install --production
npm run build
```

**エラー内容**:
```
sh: 1: tsc: not found
```

**原因**: `--production`フラグを使用したため、TypeScriptなどの開発依存関係がインストールされていない。

**解決方法**:
```bash
npm install
npm run build
```

**結果**:
- TypeScriptを含む開発依存関係インストール完了 ✅
- ビルド完了 ✅

#### 10.2 PM2でバックエンドを起動

```bash
pm2 start dist/index.js --name "yaku-navi-backend"
pm2 status
pm2 logs yaku-navi-backend --lines 30
```

**結果**:
- バックエンド起動完了 ✅
- ポート5001でリッスン中 ✅

**出力**:
```
🚀 Server is running on port 5001
📝 API URL: http://localhost:5001
🏥 Health check: http://localhost:5001/health
```

---

### ステップ11: フロントエンドのセットアップ

#### 11.1 依存関係のインストール

```bash
cd ~/yaku_navi/frontend
npm install
```

**結果**:
- 依存関係インストール完了 ✅

#### 11.2 .env.localファイルの作成

```bash
nano .env.local
```

**設定内容**:
```env
NEXT_PUBLIC_API_URL=http://85.131.247.170/api
```

**結果**: `.env.local`ファイル作成完了 ✅

#### 11.3 ビルド

```bash
npm run build
```

**結果**:
- ビルド完了 ✅
- 26ページ生成完了 ✅

**出力**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (26/26)
✓ Collecting build traces
✓ Finalizing page optimization
```

#### 11.4 PM2でフロントエンドを起動

```bash
pm2 start npm --name "yaku-navi-frontend" -- start
pm2 save
```

**結果**:
- フロントエンド起動完了 ✅
- ポート3000でリッスン中 ✅
- PM2設定保存完了 ✅

**出力**:
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
✓ Starting...
✓ Ready in 542ms
```

---

### ステップ12: Nginx設定

#### 12.1 Nginx設定ファイルの作成

```bash
sudo nano /etc/nginx/sites-available/yaku-navi
```

**設定内容**:
```nginx
upstream backend {
    server localhost:5001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name 85.131.247.170 _;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://backend/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 10M;
}
```

**結果**: Nginx設定ファイル作成完了 ✅

#### 12.2 Nginx設定の有効化

```bash
sudo ln -s /etc/nginx/sites-available/yaku-navi /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || echo "Default config already removed"
sudo nginx -t
sudo systemctl restart nginx
```

**結果**:
- 設定ファイル有効化完了 ✅
- 設定テスト成功 ✅
- Nginx再起動完了 ✅

#### 12.3 ヘルスチェック

```bash
curl http://localhost/health
curl http://localhost:5001/health
```

**結果**:
- `/health`エンドポイント正常動作 ✅
- バックエンド直接アクセス正常動作 ✅

**出力**:
```
{"success":true,"message":"Server is running","timestamp":"2026-01-27T15:25:26.847Z"}
```

---

## ⚠️ 発生したエラーと解決方法

### エラー1: PostgreSQLスキーマ権限エラー

**エラーメッセージ**:
```
Error: ERROR: permission denied for schema public
```

**原因**: PostgreSQL 15以降では、`public`スキーマに対する権限がデフォルトで制限されている。

**解決方法**:
```sql
ALTER SCHEMA public OWNER TO pharmacy_user;
GRANT ALL ON SCHEMA public TO pharmacy_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pharmacy_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pharmacy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pharmacy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pharmacy_user;
```

**結果**: 解決 ✅

---

### エラー2: マイグレーションファイルが見つからない

**エラーメッセージ**:
```
No migration found in prisma/migrations
```

**原因**: `.gitignore`に`prisma/migrations/`が含まれているため、マイグレーションファイルがGitHubに含まれていない。

**解決方法**: `prisma db push`を使用してスキーマを直接データベースに適用。

**結果**: 解決 ✅

**今後の改善**:
- `.gitignore`から`prisma/migrations/`を除外し、マイグレーションファイルをGitに含める
- または、マイグレーションファイルを別途管理する

---

### エラー3: TypeScriptコンパイルエラー（バックエンド）

**エラーメッセージ**:
```
error TS7030: Not all code paths return a value.
error TS2783: 'id' is specified more than once
```

**原因**: 
- `document.controller.ts`で`res.download()`の後に`return`が不足
- オブジェクトスプレッドで`id`プロパティが重複

**解決方法**:
- `res.download()`の前に`return`を追加
- オブジェクトスプレッドの順序を修正

**結果**: 解決 ✅

---

### エラー4: TypeScriptコンパイルエラー（フロントエンド）

**エラーメッセージ**:
```
Property 'title' is missing in type '{ children: Element; }' but required in type 'PharmacistLayoutProps'.
Property 'workDays' does not exist on type 'JobPosting'.
Property 'preferredWorkHours' does not exist on type 'JobPosting'.
```

**原因**: 
- `PharmacistLayout`コンポーネントに`title`プロパティが必須
- スキーマのプロパティ名が不一致（`workDays` → `desiredWorkDays`, `preferredWorkHours` → `desiredWorkHours`）

**解決方法**:
- すべての`PharmacistLayout`に`title`プロパティを追加
- プロパティ名をスキーマに合わせて修正

**結果**: 解決 ✅

---

### エラー5: Nginxヘルスチェックエラー

**エラーメッセージ**:
```
curl http://localhost/api/health
{"success":false,"error":"Route not found"}
```

**原因**: 
- バックエンドのヘルスチェックエンドポイントは`/health`（`/api/health`ではない）
- Nginx設定に`/health`専用のlocationブロックが不足

**解決方法**:
- Nginx設定に`location /health`ブロックを追加
- `location /api`ブロックを修正（rewriteを削除）

**結果**: 解決 ✅

---

## 📊 現在の状態

### インストール済みソフトウェア

| ソフトウェア | バージョン | 状態 |
|------------|----------|------|
| Node.js | 20.20.0 | ✅ インストール済み |
| npm | 10.8.2 | ✅ インストール済み |
| PostgreSQL | 17.7 | ✅ インストール済み・起動中 |
| PM2 | Latest | ✅ インストール済み・自動起動設定済み |
| Nginx | 1.26.3 | ✅ インストール済み・起動中 |
| Git | 2.48.1 | ✅ インストール済み |

### データベース

- **データベース名**: `pharmacy_db`
- **ユーザー**: `pharmacy_user`
- **スキーマ**: `public`
- **状態**: スキーマ適用完了 ✅

### バックエンド

- **ディレクトリ**: `~/yaku_navi/backend`
- **依存関係**: 264パッケージインストール済み ✅
- **Prisma Client**: v5.22.0 生成済み ✅
- **データベース**: スキーマ同期完了 ✅
- **.envファイル**: 作成完了 ✅
- **ビルド**: 完了 ✅
- **起動**: PM2で起動中（ポート5001）✅

### フロントエンド

- **ディレクトリ**: `~/yaku_navi/frontend`
- **依存関係**: インストール済み ✅
- **.env.localファイル**: 作成完了 ✅
- **ビルド**: 完了 ✅
- **起動**: PM2で起動中（ポート3000）✅

### Nginx

- **設定ファイル**: `/etc/nginx/sites-available/yaku-navi` ✅
- **リバースプロキシ**: 設定完了 ✅
- **状態**: 起動中 ✅

---

## ✅ デプロイメント完了

すべてのサービスが正常に起動し、デプロイメントが完了しました。

### 現在の状態

- ✅ **バックエンド**: PM2で起動中（ポート5001）
- ✅ **フロントエンド**: PM2で起動中（ポート3000）
- ✅ **Nginx**: リバースプロキシとして動作中（ポート80）
- ✅ **PostgreSQL**: データベース稼働中
- ✅ **ヘルスチェック**: `/health`エンドポイント正常動作

### アクセス方法

- **フロントエンド**: `http://85.131.247.170`
- **薬局ログイン**: `http://85.131.247.170/pharmacy/login`
- **薬剤師ログイン**: `http://85.131.247.170/pharmacist/login`
- **ヘルスチェック**: `http://85.131.247.170/health`

## 🔄 今後の改善項目

### セキュリティ

1. **SSL証明書の取得**（Let's Encrypt推奨）
   - ドメイン取得後、HTTPS化を実施
   - Nginx設定にSSL証明書を追加

2. **JWT_SECRETの強化**
   - より強力なランダム文字列に変更
   - 環境変数の管理を強化

3. **脆弱性の対応**
   - 3件の高重要度脆弱性を修正
   - 定期的なセキュリティアップデート

### パフォーマンス

1. **非推奨パッケージの更新**
   - `rimraf@3.0.2` → 最新版
   - `multer@1.4.5-lts.2` → 最新版
   - その他の非推奨パッケージ

2. **データベース最適化**
   - インデックスの追加
   - クエリの最適化

### 運用

1. **マイグレーションファイルの管理**
   - `.gitignore`から`prisma/migrations/`を除外
   - マイグレーションファイルをGitに含める

2. **ログ管理**
   - PM2ログのローテーション設定
   - エラーログの監視設定

3. **バックアップ**
   - データベースの定期バックアップ
   - ファイルアップロードのバックアップ

---

## 📝 注意事項

1. **カーネルアップグレード**: システムの再起動が必要（すべてのセットアップ完了後に実行）
2. **脆弱性**: 3件の高重要度脆弱性が検出（後で対応）
3. **非推奨パッケージ**: 複数の非推奨パッケージが使用中（後で対応）
4. **マイグレーションファイル**: `.gitignore`から除外し、Gitに含める必要がある
5. **ドメイン**: 現在はIPアドレスを使用。ドメイン取得後は設定を変更する必要がある
6. **JWT_SECRET**: 本番環境では、より強力なランダム文字列に変更することを推奨

---

## 🔗 参考リンク

- **GitHubリポジトリ**: https://github.com/Keeeeei-Soeda/yakunavi.git
- **デプロイ手順書**: `DEPLOY_STEPS.md`
- **デプロイガイド**: `DEPLOYMENT_GUIDE.md`

---

## 📅 更新履歴

- **2026-01-27**: 初回デプロイログ作成
  - システムセットアップ完了
  - データベースセットアップ完了
  - バックエンドセットアップ（途中まで）

- **2026-01-28**: デプロイメント完了
  - バックエンドビルド・起動完了
  - フロントエンドビルド・起動完了
  - Nginx設定完了
  - ヘルスチェック正常動作確認
  - すべてのサービス稼働中

