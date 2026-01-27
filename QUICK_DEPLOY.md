# Xserver VPS クイックデプロイガイド

## 🚀 シリアルコンソールを使った最短手順

### 1. ファイルのアップロード準備

#### オプションA: Gitを使用（推奨）

```bash
# ローカルでGitリポジトリにコミット
cd /Users/soedakei/yaku_navi
git add .
git commit -m "Deploy to production"
git push origin main
```

#### オプションB: tar.gzで圧縮

```bash
cd /Users/soedakei/yaku_navi
tar -czf yaku_navi.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.env' \
  --exclude='.git' \
  --exclude='.DS_Store' \
  .
```

### 2. Xserver VPSへの接続

Xserver VPSのコントロールパネルから：
1. **シリアルコンソール**を開く
2. または**SSH接続**を使用

### 3. サーバーでの初期セットアップ（初回のみ）

```bash
# システム更新
sudo apt update && sudo apt upgrade -y

# Node.js 20.xのインストール
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQLのインストール
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PM2のインストール
sudo npm install -g pm2
pm2 startup

# Nginxのインストール
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. データベースのセットアップ

```bash
# PostgreSQLにログイン
sudo -u postgres psql
```

PostgreSQL内で実行：

```sql
CREATE DATABASE pharmacy_db;
CREATE USER pharmacy_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pharmacy_db TO pharmacy_user;
\q
```

### 5. プロジェクトファイルの配置

#### Gitを使用する場合

```bash
mkdir -p ~/yaku_navi
cd ~/yaku_navi
git clone https://your-repository-url.git .
```

#### tar.gzを使用する場合

1. SFTPクライアント（FileZillaなど）で`yaku_navi.tar.gz`をアップロード
2. シリアルコンソールで展開：

```bash
cd ~
tar -xzf yaku_navi.tar.gz -C yaku_navi
cd yaku_navi
```

### 6. バックエンドのセットアップ

```bash
cd ~/yaku_navi/backend

# 依存関係のインストール
npm install --production

# .envファイルを作成
nano .env
```

`.env`の内容：

```env
DATABASE_URL="postgresql://pharmacy_user:your_secure_password@localhost:5432/pharmacy_db?schema=public"
JWT_SECRET=your-very-secure-secret-key
JWT_REFRESH_SECRET=your-very-secure-refresh-secret-key
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
RESEND_API_KEY=your-resend-api-key
```

```bash
# Prismaのセットアップ
npm run prisma:generate
npx prisma migrate deploy

# ビルド
npm run build

# PM2で起動
pm2 start dist/index.js --name "yaku-navi-backend"
```

### 7. フロントエンドのセットアップ

```bash
cd ~/yaku_navi/frontend

# 依存関係のインストール
npm install

# .env.localファイルを作成
nano .env.local
```

`.env.local`の内容：

```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

```bash
# ビルド
npm run build

# PM2で起動
pm2 start npm --name "yaku-navi-frontend" -- start
```

### 8. Nginxの設定

```bash
sudo nano /etc/nginx/sites-available/yaku-navi
```

以下を追加：

```nginx
upstream backend {
    server localhost:5001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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

```bash
# シンボリックリンクの作成
sudo ln -s /etc/nginx/sites-available/yaku-navi /etc/nginx/sites-enabled/

# 設定のテスト
sudo nginx -t

# Nginxの再起動
sudo systemctl restart nginx
```

### 9. SSL証明書の設定

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 10. 動作確認

```bash
# PM2の状態確認
pm2 status

# ログ確認
pm2 logs yaku-navi-backend
pm2 logs yaku-navi-frontend
```

ブラウザで `https://your-domain.com` にアクセスして確認

## 🔄 更新手順

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

## 📝 重要な注意事項

1. **環境変数**: `.env`と`.env.local`は本番環境用の値に必ず変更してください
2. **パスワード**: データベースパスワードとJWT_SECRETは強力なものに設定してください
3. **ドメイン**: `your-domain.com`を実際のドメイン名に置き換えてください
4. **バックアップ**: 定期的にデータベースのバックアップを取ってください

