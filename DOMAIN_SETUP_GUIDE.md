# 🌐 ドメイン設定ガイド（yaku-navi.com）

## 📋 概要

IPアドレス（85.131.247.170）から`yaku-navi.com`へのドメイン変更手順です。

---

## ✅ 前提条件

- DNSサーバーの設定が完了している
- ドメイン`yaku-navi.com`がサーバーのIPアドレス（85.131.247.170）を指している
- サーバーにSSH接続が可能

---

## 🔧 設定手順

### ステップ1: バックエンドの環境変数を更新

```bash
# サーバーにSSH接続
ssh root@85.131.247.170

# バックエンドディレクトリに移動
cd ~/yaku_navi/backend

# .envファイルを編集
nano .env
```

以下の設定を確認・更新：

```env
# 変更前
FRONTEND_URL=http://85.131.247.170:3000
CORS_ORIGIN=http://85.131.247.170:3000

# 変更後
FRONTEND_URL=https://yaku-navi.com
CORS_ORIGIN=https://yaku-navi.com
```

保存後、バックエンドを再起動：

```bash
pm2 restart backend
# または
pm2 restart yaku-navi-backend
```

---

### ステップ2: フロントエンドの環境変数を更新

```bash
# フロントエンドディレクトリに移動
cd ~/yaku_navi/frontend

# .env.localファイルを作成または編集
nano .env.local
```

以下の設定を追加：

```env
NEXT_PUBLIC_API_URL=https://yaku-navi.com/api
```

保存後、フロントエンドを再ビルド・再起動：

```bash
npm run build
pm2 restart frontend
# または
pm2 restart yaku-navi-frontend
```

---

### ステップ3: Nginx設定ファイルの更新

```bash
# Nginx設定ファイルを編集
sudo nano /etc/nginx/sites-available/yaku-navi
```

以下の設定を確認・更新：

```nginx
server {
    listen 80;
    server_name yaku-navi.com www.yaku-navi.com;
    
    # HTTPからHTTPSにリダイレクト（SSL設定後）
    # return 301 https://$server_name$request_uri;
    
    # フロントエンド
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

設定をテスト：

```bash
sudo nginx -t
```

問題がなければ、Nginxを再起動：

```bash
sudo systemctl restart nginx
```

---

### ステップ4: SSL証明書の取得（Let's Encrypt）

```bash
# Certbotのインストール（未インストールの場合）
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# SSL証明書の取得
sudo certbot --nginx -d yaku-navi.com -d www.yaku-navi.com
```

証明書取得時に以下を入力：
- メールアドレス
- 利用規約への同意（Y）
- メール配信の希望（オプション）

Certbotが自動的にNginx設定を更新します。

---

### ステップ5: Nginx設定のSSL対応（自動更新される場合もあります）

Certbotが自動更新しない場合、手動で設定：

```bash
sudo nano /etc/nginx/sites-available/yaku-navi
```

```nginx
server {
    listen 80;
    server_name yaku-navi.com www.yaku-navi.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yaku-navi.com www.yaku-navi.com;
    
    ssl_certificate /etc/letsencrypt/live/yaku-navi.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yaku-navi.com/privkey.pem;
    
    # SSL設定（推奨）
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # フロントエンド
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

設定をテストして再起動：

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

### ステップ6: 自動更新の設定

Let's Encryptの証明書は90日で期限切れになるため、自動更新を設定：

```bash
# 自動更新のテスト
sudo certbot renew --dry-run

# 自動更新が有効になっていることを確認
sudo systemctl status certbot.timer
```

---

### ステップ7: 動作確認

#### 1. DNSの確認

```bash
# ドメインが正しく解決されるか確認
nslookup yaku-navi.com
dig yaku-navi.com
```

#### 2. HTTP/HTTPSの確認

```bash
# HTTPリクエスト（HTTPSにリダイレクトされることを確認）
curl -I http://yaku-navi.com

# HTTPSリクエスト
curl -I https://yaku-navi.com
```

#### 3. ブラウザでの確認

- `https://yaku-navi.com` にアクセス
- LPページが表示されることを確認
- ログイン・登録機能が動作することを確認
- APIリクエストが正常に動作することを確認

#### 4. PM2の状態確認

```bash
pm2 status
pm2 logs --lines 50
```

---

## 🔍 トラブルシューティング

### 問題1: DNSが解決されない

```bash
# DNSの確認
nslookup yaku-navi.com
dig yaku-navi.com

# 解決されない場合、DNS設定を確認
# DNSプロバイダーの設定画面でAレコードを確認
```

### 問題2: SSL証明書の取得に失敗

```bash
# ポート80が開いているか確認
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Nginxが起動しているか確認
sudo systemctl status nginx

# Certbotのログを確認
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### 問題3: APIリクエストが失敗する

```bash
# バックエンドのログを確認
pm2 logs backend

# CORS設定を確認
cd ~/yaku_navi/backend
cat .env | grep CORS

# フロントエンドの環境変数を確認
cd ~/yaku_navi/frontend
cat .env.local
```

### 問題4: 502 Bad Gatewayエラー

```bash
# PM2のプロセスが起動しているか確認
pm2 status

# バックエンド・フロントエンドが起動しているか確認
pm2 logs

# Nginxのエラーログを確認
sudo tail -f /var/log/nginx/error.log
```

---

## 📝 設定ファイルのサマリー

### バックエンド `.env`

```env
FRONTEND_URL=https://yaku-navi.com
CORS_ORIGIN=https://yaku-navi.com
```

### フロントエンド `.env.local`

```env
NEXT_PUBLIC_API_URL=https://yaku-navi.com/api
```

### Nginx設定

```nginx
server_name yaku-navi.com www.yaku-navi.com;
```

---

## ✅ チェックリスト

- [ ] DNS設定が完了している
- [ ] バックエンドの`.env`を更新
- [ ] フロントエンドの`.env.local`を更新
- [ ] Nginx設定を更新
- [ ] SSL証明書を取得
- [ ] Nginxを再起動
- [ ] PM2でアプリケーションを再起動
- [ ] ブラウザで動作確認
- [ ] APIリクエストが正常に動作することを確認

---

## 🎯 完了後の確認

1. **HTTPSアクセス**: `https://yaku-navi.com` でアクセス可能
2. **LPページ表示**: トップページが正常に表示される
3. **ログイン機能**: ログイン・登録が正常に動作する
4. **API通信**: フロントエンドからバックエンドへのAPIリクエストが正常に動作する
5. **SSL証明書**: ブラウザでSSL証明書が有効であることを確認

---

**最終更新**: 2026年1月28日
**ドメイン**: yaku-navi.com

