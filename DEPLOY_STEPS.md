# Xserver VPS デプロイ実行手順

## 📋 現在の状態
- ✅ シリアルコンソールにログイン済み（rootユーザー）
- ✅ Ubuntu 25.04が動作中
- ⚠️ システムの再起動が必要（後で実行）

## 🚀 実行手順（順番に実行してください）

### ステップ1: システムの状態確認

```bash
# Node.jsのバージョン確認
node --version

# npmのバージョン確認
npm --version

# PostgreSQLの状態確認
psql --version

# Gitの確認
git --version
```

### ステップ2: 必要なソフトウェアのインストール

#### 2.1 システムの更新（再起動が必要な場合は後で実行）

```bash
# システム更新（時間がかかる場合があります）
apt update && apt upgrade -y
```

#### 2.2 Node.js 20.xのインストール

```bash
# Node.js 20.xのリポジトリを追加
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Node.jsをインストール
apt-get install -y nodejs

# バージョン確認
node --version
npm --version
```

#### 2.3 PostgreSQLのインストール

```bash
# PostgreSQLのインストール
apt install postgresql postgresql-contrib -y

# PostgreSQLサービスの起動
systemctl start postgresql
systemctl enable postgresql

# バージョン確認
psql --version
```

#### 2.4 PM2のインストール（プロセス管理）

```bash
# PM2をグローバルにインストール
npm install -g pm2

# PM2の自動起動設定
pm2 startup
# 表示されたコマンドを実行してください
```

#### 2.5 Nginxのインストール（リバースプロキシ）

```bash
# Nginxのインストール
apt install nginx -y

# Nginxサービスの起動
systemctl start nginx
systemctl enable nginx

# 状態確認
systemctl status nginx
```

#### 2.6 Gitのインストール（未インストールの場合）

```bash
# Gitのインストール
apt install git -y

# バージョン確認
git --version
```

### ステップ3: データベースのセットアップ

```bash
# PostgreSQLにログイン
sudo -u postgres psql
```

PostgreSQL内で以下を実行：

```sql
-- データベースの作成
CREATE DATABASE pharmacy_db;

-- ユーザーの作成（パスワードは強力なものに変更してください）
CREATE USER pharmacy_user WITH PASSWORD 'your_secure_password_here';

-- 権限の付与
GRANT ALL PRIVILEGES ON DATABASE pharmacy_db TO pharmacy_user;

-- PostgreSQLを終了
\q
```

### ステップ4: プロジェクトファイルの取得

```bash
# ホームディレクトリに移動
cd ~

# プロジェクトディレクトリを作成
mkdir -p yaku_navi
cd yaku_navi

# GitHubからクローン
git clone https://github.com/Keeeeei-Soeda/yakunavi.git .

# ファイルが正しく取得できたか確認
ls -la
```

### ステップ5: バックエンドのセットアップ

```bash
# バックエンドディレクトリに移動
cd ~/yaku_navi/backend

# 依存関係のインストール
npm install --production

# .envファイルを作成
nano .env
```

`.env`ファイルの内容（IPアドレスを使用する場合）：

```env
DATABASE_URL="postgresql://pharmacy_user:your_secure_password_here@localhost:5432/pharmacy_db?schema=public"
JWT_SECRET=your-very-secure-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-very-secure-refresh-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
PORT=5001
NODE_ENV=production
FRONTEND_URL=http://85.131.247.170:3000
RESEND_API_KEY=
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**注意**: ドメインを取得した場合は、`FRONTEND_URL`を`https://your-domain.com`に変更してください。

保存方法（nanoエディタ）：
- `Ctrl + O` で保存
- `Enter` で確認
- `Ctrl + X` で終了

```bash
# Prismaクライアントの生成
npm run prisma:generate

# データベースマイグレーション
npx prisma migrate deploy

# TypeScriptのビルド
npm run build

# PM2でバックエンドを起動
pm2 start dist/index.js --name "yaku-navi-backend"

# 状態確認
pm2 status
pm2 logs yaku-navi-backend
```

### ステップ6: フロントエンドのセットアップ

```bash
# フロントエンドディレクトリに移動
cd ~/yaku_navi/frontend

# 依存関係のインストール
npm install

# .env.localファイルを作成
nano .env.local
```

`.env.local`ファイルの内容（IPアドレスを使用する場合）：

```env
NEXT_PUBLIC_API_URL=http://85.131.247.170:5001/api
```

**注意**: ドメインを取得した場合は、`NEXT_PUBLIC_API_URL`を`https://your-domain.com/api`に変更してください。

保存方法：
- `Ctrl + O` で保存
- `Enter` で確認
- `Ctrl + X` で終了

```bash
# フロントエンドのビルド（時間がかかります）
npm run build

# PM2でフロントエンドを起動
pm2 start npm --name "yaku-navi-frontend" -- start

# 状態確認
pm2 status
pm2 logs yaku-navi-frontend
```

### ステップ7: Nginxの設定

```bash
# Nginx設定ファイルを作成
nano /etc/nginx/sites-available/yaku-navi
```

以下の内容を追加（IPアドレスを使用する場合）：

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

    client_max_body_size 10M;
}
```

保存方法：
- `Ctrl + O` で保存
- `Enter` で確認
- `Ctrl + X` で終了

```bash
# シンボリックリンクの作成
ln -s /etc/nginx/sites-available/yaku-navi /etc/nginx/sites-enabled/

# デフォルトの設定を無効化（オプション）
rm /etc/nginx/sites-enabled/default

# Nginx設定のテスト
nginx -t

# Nginxの再起動
systemctl restart nginx

# 状態確認
systemctl status nginx
```

### ステップ8: SSL証明書の設定（Let's Encrypt）

**注意**: このステップはドメインを取得した後に実行してください。IPアドレスのみの場合はスキップできます。

```bash
# Certbotのインストール
apt install certbot python3-certbot-nginx -y

# SSL証明書の取得（ドメインを実際の値に変更）
certbot --nginx -d your-domain.com -d www.your-domain.com

# 自動更新のテスト
certbot renew --dry-run
```

### ステップ9: ファイアウォールの設定

```bash
# UFWのインストール（未インストールの場合）
apt install ufw -y

# ファイアウォールの設定
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# 状態確認
ufw status
```

### ステップ10: 動作確認

```bash
# PM2の状態確認
pm2 status

# ログの確認
pm2 logs yaku-navi-backend
pm2 logs yaku-navi-frontend

# バックエンドのヘルスチェック
curl http://localhost:5001/health

# フロントエンドの確認
curl http://localhost:3000
```

### ステップ11: システムの再起動（必要に応じて）

```bash
# 再起動
reboot
```

再起動後、PM2で自動起動されることを確認：

```bash
pm2 status
```

## 🌐 ドメイン取得後の変更手順

ドメインを取得したら、以下のファイルを更新してください：

### 1. バックエンド `.env`ファイル

```bash
cd ~/yaku_navi/backend
nano .env
```

以下の行を変更：
```env
# 変更前
FRONTEND_URL=http://85.131.247.170:3000

# 変更後
FRONTEND_URL=https://your-domain.com
```

### 2. フロントエンド `.env.local`ファイル

```bash
cd ~/yaku_navi/frontend
nano .env.local
```

以下の行を変更：
```env
# 変更前
NEXT_PUBLIC_API_URL=http://85.131.247.170:5001/api

# 変更後
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### 3. Nginx設定ファイル

```bash
nano /etc/nginx/sites-available/yaku-navi
```

以下の行を変更：
```nginx
# 変更前
server_name 85.131.247.170 _;

# 変更後
server_name your-domain.com www.your-domain.com;
```

設定を反映：
```bash
nginx -t
systemctl restart nginx
```

### 4. アプリケーションの再起動

```bash
# バックエンドの再起動
pm2 restart yaku-navi-backend

# フロントエンドの再起動
pm2 restart yaku-navi-frontend
```

### 5. SSL証明書の取得

ステップ8の手順に従って、Let's EncryptでSSL証明書を取得してください。

## ⚠️ 注意事項

1. **パスワード**: データベースパスワードとJWT_SECRETは必ず強力なものに変更してください
2. **IPアドレス**: 初期設定ではIPアドレス（85.131.247.170）を使用します。ドメイン取得後は上記の手順で変更してください
3. **環境変数**: `.env`と`.env.local`は本番環境用の値に設定してください
4. **再起動**: システムの再起動が必要な場合は、すべてのセットアップ完了後に実行してください
5. **SSL証明書**: ドメインを取得したら、必ずSSL証明書を設定してHTTPS化してください

## 🔄 更新手順（コードを更新する場合）

```bash
cd ~/yaku_navi

# Gitから最新を取得
git pull origin main

# バックエンド更新
cd backend
npm install --production
npm run build
pm2 restart yaku-navi-backend

# フロントエンド更新
cd ../frontend
npm install
npm run build
pm2 restart yaku-navi-frontend
```

