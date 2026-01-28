# 🌐 ドメイン・SSL設定ガイド

## 📋 目次

1. [ドメイン設定](#ドメイン設定)
2. [SSL証明書の設定](#ssl証明書の設定)
3. [Nginx設定](#nginx設定)
4. [トラブルシューティング](#トラブルシューティング)

---

## ドメイン設定

### 環境変数の更新

#### バックエンドの環境変数

```bash
cd ~/yaku_navi/backend
nano .env
```

以下の行を変更：
```env
FRONTEND_URL=https://yaku-navi.com
CORS_ORIGIN=https://yaku-navi.com
```

保存後、再起動：
```bash
pm2 restart yaku-navi-backend
```

#### フロントエンドの環境変数

```bash
cd ~/yaku_navi/frontend
nano .env.local
```

以下の内容を追加：
```env
NEXT_PUBLIC_API_URL=https://yaku-navi.com/api
```

保存後、再ビルド・再起動：
```bash
npm run build
pm2 restart yaku-navi-frontend
```

---

## SSL証明書の設定

### Certbotのインストール

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### SSL証明書の取得

```bash
sudo certbot --nginx -d yaku-navi.com -d www.yaku-navi.com
```

### 証明書の自動更新

```bash
# 自動更新のテスト
sudo certbot renew --dry-run

# 自動更新が有効になっていることを確認
sudo systemctl status certbot.timer
```

---

## Nginx設定

### 設定ファイルの場所

```bash
/etc/nginx/sites-available/yaku-navi
/etc/nginx/sites-enabled/yaku-navi
```

### 基本設定

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yaku-navi.com www.yaku-navi.com;

    # SSL証明書が設定されている場合は、HTTPからHTTPSにリダイレクト
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yaku-navi.com www.yaku-navi.com;

    # SSL証明書のパス
    ssl_certificate /etc/letsencrypt/live/yaku-navi.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yaku-navi.com/privkey.pem;

    # SSL設定
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # フロントエンド（Next.js）
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # バックエンドAPI
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 設定の適用

```bash
# 設定ファイルの構文チェック
sudo nginx -t

# Nginxを再起動
sudo systemctl restart nginx

# ステータス確認
sudo systemctl status nginx
```

---

## トラブルシューティング

### 問題1: ドメインにアクセスできない

```bash
# DNS設定を確認
nslookup yaku-navi.com

# Nginxのステータスを確認
sudo systemctl status nginx

# ポート80/443が開いているか確認
sudo netstat -tlnp | grep -E ':(80|443)'
```

### 問題2: SSL証明書のエラー

```bash
# 証明書の有効期限を確認
sudo certbot certificates

# 証明書を手動で更新
sudo certbot renew

# Nginxを再起動
sudo systemctl restart nginx
```

### 問題3: Nginxの設定エラー

```bash
# 設定ファイルの構文チェック
sudo nginx -t

# エラーログを確認
sudo tail -f /var/log/nginx/error.log
```

### 問題4: 502 Bad Gatewayエラー

```bash
# バックエンドとフロントエンドが起動しているか確認
pm2 status

# ポートが正しくリッスンしているか確認
netstat -tlnp | grep -E ':(3000|5001)'
```

---

## 確認コマンド

### DNS設定の確認

```bash
# Aレコードの確認
dig yaku-navi.com +short

# すべてのDNSレコードを確認
dig yaku-navi.com ANY
```

### SSL証明書の確認

```bash
# 証明書の詳細を確認
openssl s_client -connect yaku-navi.com:443 -servername yaku-navi.com
```

### 接続テスト

```bash
# HTTP接続テスト
curl -I http://yaku-navi.com

# HTTPS接続テスト
curl -I https://yaku-navi.com
```

---

**最終更新**: 2026年1月28日

