# セットアップガイド

## クイックスタート

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd yaku_navi
```

### 2. PostgreSQLのセットアップ

#### macOSの場合

```bash
# Homebrewでインストール
brew install postgresql@14

# PostgreSQLを起動
brew services start postgresql@14

# データベースを作成
createdb pharmacy_db
```

#### Linuxの場合

```bash
# PostgreSQLのインストール
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQLを起動
sudo systemctl start postgresql
sudo systemctl enable postgresql

# ユーザーとデータベースを作成
sudo -u postgres psql
postgres=# CREATE DATABASE pharmacy_db;
postgres=# CREATE USER pharmacy_user WITH PASSWORD 'your_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE pharmacy_db TO pharmacy_user;
postgres=# \q
```

### 3. バックエンドのセットアップ

```bash
cd backend

# 依存関係のインストール
npm install

# 環境変数の設定
cat > .env << EOF
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

DATABASE_URL="postgresql://pharmacy_user:your_password@localhost:5432/pharmacy_db?schema=public"

JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=薬局管理システム

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

CORS_ORIGIN=http://localhost:3000
EOF

# Prismaのセットアップ
npx prisma generate
npx prisma migrate dev --name init

# 開発サーバーの起動
npm run dev
```

バックエンドが `http://localhost:5000` で起動します。

### 4. フロントエンドのセットアップ

新しいターミナルウィンドウで：

```bash
cd frontend

# 依存関係のインストール
npm install

# 環境変数の設定（オプション）
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF

# 開発サーバーの起動
npm run dev
```

フロントエンドが `http://localhost:3000` で起動します。

## 動作確認

### バックエンドAPI

```bash
# ヘルスチェック
curl http://localhost:5000/health

# レスポンス例:
# {"status":"ok","message":"Yaku Navi Backend API is running","timestamp":"2024-01-27T..."}
```

### フロントエンド

ブラウザで以下のURLにアクセス：

- トップページ: http://localhost:3000
- 薬局ダッシュボード: http://localhost:3000/pharmacy/dashboard
- 薬剤師ダッシュボード: http://localhost:3000/pharmacist/dashboard

## トラブルシューティング

### ポート競合エラー

ポート5000または3000が既に使用されている場合：

```bash
# バックエンドのポート変更
cd backend
# .envファイルのPORT=5000を別のポート番号に変更

# フロントエンドのポート変更
cd frontend
PORT=3001 npm run dev
```

### データベース接続エラー

```bash
# PostgreSQLが起動しているか確認
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# データベースが存在するか確認
psql -U postgres -c "\l" | grep pharmacy_db
```

### Prismaマイグレーションエラー

```bash
cd backend

# Prismaクライアントの再生成
npx prisma generate

# データベースをリセット（警告: すべてのデータが削除されます）
npx prisma migrate reset

# 新しいマイグレーションを作成
npx prisma migrate dev --name init
```

## 本番環境へのデプロイ

### 環境変数の設定

本番環境では以下の環境変数を適切に設定してください：

- `NODE_ENV=production`
- `DATABASE_URL` - 本番データベースのURL
- `JWT_SECRET` - 強力なランダム文字列
- `RESEND_API_KEY` - Resendの本番APIキー
- `FRONTEND_URL` - フロントエンドの本番URL
- `CORS_ORIGIN` - 許可するオリジン

### ビルド

```bash
# バックエンド
cd backend
npm run build
npm start

# フロントエンド
cd frontend
npm run build
npm start
```

### xserver VPSへのデプロイ

詳細は `IMPLEMENTATION_PLAN.md` を参照してください。

## 開発時のTips

### Prisma Studio（データベースGUI）

```bash
cd backend
npx prisma studio
```

ブラウザで http://localhost:5555 が開きます。

### ログの確認

```bash
# バックエンドログ
cd backend
npm run dev

# PM2を使用している場合
pm2 logs backend
```

### データベースのシード

テストデータを投入する場合：

```bash
cd backend
npm run prisma:seed
```

## 次のステップ

1. 認証機能の実装
2. 求人投稿機能の実装
3. 求人検索機能の実装（都道府県・日給フィルター）
4. メッセージング機能の実装
5. 契約管理機能の実装

詳細な実装計画は `IMPLEMENTATION_PLAN.md` を参照してください。

