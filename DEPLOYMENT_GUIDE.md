# Xserver VPS デプロイ手順書

## 📋 前提条件

- Xserver VPSのアカウントとサーバー情報
- SSH接続情報（IPアドレス、ユーザー名、パスワードまたはSSH鍵）
- ドメイン名（オプション、SSL証明書用）

## 🚀 デプロイ手順

### ステップ1: ローカル環境での準備

#### 1.1 プロジェクトの圧縮（オプション）

Gitを使用しない場合、プロジェクトを圧縮してアップロードできます：

```bash
# プロジェクトルートで実行
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

#### 1.2 Gitを使用する場合（推奨）

```bash
# Gitリポジトリにコミット
git add .
git commit -m "Deploy to production"
git push origin main
```

### ステップ2: Xserver VPSへの接続

#### 2.1 シリアルコンソールまたはSSH接続

Xserver VPSのコントロールパネルから：
1. **シリアルコンソール**にアクセス
2. または**SSH接続**を使用

```bash
# SSH接続例
ssh username@your-server-ip
# または
ssh -p 22 username@your-server-ip
```

### ステップ3: サーバー環境のセットアップ

#### 3.1 システムの更新

```bash
# Ubuntu/Debianの場合
sudo apt update && sudo apt upgrade -y

# CentOS/RHELの場合
sudo yum update -y
```

#### 3.2 Node.jsのインストール

```bash
# Node.js 20.xをインストール（推奨）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# バージョン確認
node --version
npm --version
```

#### 3.3 PostgreSQLのインストール

```bash
# PostgreSQLのインストール
sudo apt install postgresql postgresql-contrib -y

# PostgreSQLサービスの起動
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQLにログイン
sudo -u postgres psql
```

#### 3.4 データベースの作成

PostgreSQL内で実行：

```sql
-- データベースとユーザーの作成
CREATE DATABASE pharmacy_db;
CREATE USER pharmacy_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE pharmacy_db TO pharmacy_user;

-- 接続確認
\c pharmacy_db

-- 終了
\q
```

#### 3.5 PM2のインストール（プロセス管理）

```bash
# PM2をグローバルにインストール
sudo npm install -g pm2

# PM2の自動起動設定
pm2 startup
# 表示されたコマンドを実行（例: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u username --hp /home/username）
```

#### 3.6 Nginxのインストール（リバースプロキシ）

```bash
# Nginxのインストール
sudo apt install nginx -y

# Nginxサービスの起動
sudo systemctl start nginx
sudo systemctl enable nginx
```

### ステップ4: プロジェクトファイルのアップロード

#### 4.1 プロジェクトディレクトリの作成

```bash
# プロジェクト用ディレクトリを作成
mkdir -p ~/yaku_navi
cd ~/yaku_navi
```

#### 4.2 ファイルのアップロード方法

**方法A: Gitを使用（推奨）**

```bash
# Gitをインストール（未インストールの場合）
sudo apt install git -y

# リポジトリをクローン
git clone https://your-repository-url.git .

# または既存のリポジトリをプル
git pull origin main
```

**方法B: SCPを使用**

ローカルマシンから実行：

```bash
# 圧縮ファイルをアップロード
scp yaku_navi.tar.gz username@your-server-ip:~/yaku_navi/

# SSH接続後、サーバー側で展開
cd ~/yaku_navi
tar -xzf yaku_navi.tar.gz
```

**方法C: SFTPを使用**

FileZillaなどのSFTPクライアントを使用してファイルをアップロード

### ステップ5: バックエンドのセットアップ

#### 5.1 バックエンドディレクトリに移動

```bash
cd ~/yaku_navi/backend
```

#### 5.2 依存関係のインストール

```bash
npm install --production
```

#### 5.3 環境変数ファイルの作成

```bash
# .envファイルを作成
nano .env
```

以下の内容を設定：

```env
# データベース接続
DATABASE_URL="postgresql://pharmacy_user:your_secure_password@localhost:5432/pharmacy_db?schema=public"

# JWT設定
JWT_SECRET=your-very-secure-secret-key-here
JWT_REFRESH_SECRET=your-very-secure-refresh-secret-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# サーバー設定
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# メール設定（Resend）
RESEND_API_KEY=your-resend-api-key

# ファイルアップロード
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

#### 5.4 Prismaのセットアップ

```bash
# Prismaクライアントの生成
npm run prisma:generate

# データベースマイグレーション
npx prisma migrate deploy

# シードデータの投入（オプション）
npm run prisma:seed
```

#### 5.5 バックエンドのビルド

```bash
# TypeScriptのビルド
npm run build
```

#### 5.6 バックエンドの起動（PM2）

```bash
# PM2でバックエンドを起動
cd ~/yaku_navi/backend
pm2 start dist/index.js --name "yaku-navi-backend" --interpreter node

# PM2の状態確認
pm2 status

# PM2のログ確認
pm2 logs yaku-navi-backend
```

### ステップ6: フロントエンドのセットアップ

#### 6.1 フロントエンドディレクトリに移動

```bash
cd ~/yaku_navi/frontend
```

#### 6.2 依存関係のインストール

```bash
npm install
```

#### 6.3 環境変数ファイルの作成

```bash
# .env.localファイルを作成
nano .env.local
```

以下の内容を設定：

```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

#### 6.4 フロントエンドのビルド

```bash
# 本番用ビルド
npm run build
```

#### 6.5 フロントエンドの起動（PM2）

```bash
# PM2でフロントエンドを起動
cd ~/yaku_navi/frontend
pm2 start npm --name "yaku-navi-frontend" -- start

# PM2の状態確認
pm2 status
```

### ステップ7: Nginxの設定

#### 7.1 Nginx設定ファイルの作成

```bash
sudo nano /etc/nginx/sites-available/yaku-navi
```

以下の設定を追加：

```nginx
# バックエンドAPI（ポート5001）
upstream backend {
    server localhost:5001;
}

# フロントエンド（ポート3000）
upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # フロントエンド
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

    # バックエンドAPI
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ファイルアップロードサイズ制限
    client_max_body_size 10M;
}
```

#### 7.2 シンボリックリンクの作成

```bash
sudo ln -s /etc/nginx/sites-available/yaku-navi /etc/nginx/sites-enabled/
```

#### 7.3 Nginx設定のテスト

```bash
# 設定ファイルの構文チェック
sudo nginx -t
```

#### 7.4 Nginxの再起動

```bash
sudo systemctl restart nginx
```

### ステップ8: SSL証明書の設定（Let's Encrypt）

#### 8.1 Certbotのインストール

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 8.2 SSL証明書の取得

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### 8.3 自動更新の確認

```bash
# 自動更新のテスト
sudo certbot renew --dry-run
```

### ステップ9: ファイアウォールの設定

#### 9.1 UFWの設定

```bash
# UFWを有効化
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 状態確認
sudo ufw status
```

### ステップ10: 動作確認

#### 10.1 サービス状態の確認

```bash
# PM2の状態確認
pm2 status

# Nginxの状態確認
sudo systemctl status nginx

# PostgreSQLの状態確認
sudo systemctl status postgresql
```

#### 10.2 ログの確認

```bash
# バックエンドのログ
pm2 logs yaku-navi-backend

# フロントエンドのログ
pm2 logs yaku-navi-frontend

# Nginxのログ
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

#### 10.3 ブラウザでアクセス

- フロントエンド: `https://your-domain.com`
- バックエンドAPI: `https://your-domain.com/api/health`

## 🔧 よくある問題と対処法

### 問題1: PM2が起動しない

```bash
# PM2の再インストール
sudo npm install -g pm2 --force

# プロセスの削除と再起動
pm2 delete all
pm2 start dist/index.js --name "yaku-navi-backend"
```

### 問題2: ポートが既に使用されている

```bash
# ポートの使用状況を確認
sudo lsof -i :5001
sudo lsof -i :3000

# プロセスを終了
sudo kill -9 <PID>
```

### 問題3: データベース接続エラー

```bash
# PostgreSQLの接続確認
sudo -u postgres psql -c "SELECT version();"

# データベースの存在確認
sudo -u postgres psql -l
```

### 問題4: 権限エラー

```bash
# ファイルの権限を修正
sudo chown -R $USER:$USER ~/yaku_navi
chmod -R 755 ~/yaku_navi
```

## 📝 更新手順

### コードの更新

```bash
# Gitから最新のコードを取得
cd ~/yaku_navi
git pull origin main

# バックエンドの更新
cd backend
npm install --production
npm run build
pm2 restart yaku-navi-backend

# フロントエンドの更新
cd ../frontend
npm install
npm run build
pm2 restart yaku-navi-frontend
```

## 🔒 セキュリティチェックリスト

- [ ] `.env`ファイルが適切に保護されている
- [ ] データベースパスワードが強力である
- [ ] JWT_SECRETが強力である
- [ ] SSL証明書が有効である
- [ ] ファイアウォールが適切に設定されている
- [ ] 不要なポートが閉じられている
- [ ] 定期的なバックアップが設定されている

## 📞 サポート

問題が発生した場合は、ログを確認してエラーメッセージを記録してください。

