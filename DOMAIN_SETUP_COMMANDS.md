# 🚀 ドメイン設定コマンド集（yaku-navi.com）

## 📋 サーバー側で実行するコマンド

### ステップ1: バックエンドの環境変数を更新

```bash
cd ~/yaku_navi/backend
nano .env
```

以下の行を変更：
```env
FRONTEND_URL=https://yaku-navi.com
CORS_ORIGIN=https://yaku-navi.com
```

保存後（Ctrl+O, Enter, Ctrl+X）、再起動：
```bash
pm2 restart backend
```

---

### ステップ2: フロントエンドの環境変数を更新

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
pm2 restart frontend
```

---

### ステップ3: Nginx設定ファイルの更新

```bash
sudo nano /etc/nginx/sites-available/yaku-navi
```

以下の内容に更新（既存の設定を置き換え）：

```nginx
server {
    listen 80;
    server_name yaku-navi.com www.yaku-navi.com;
    
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

問題がなければ再起動：
```bash
sudo systemctl restart nginx
```

---

### ステップ4: SSL証明書の取得

```bash
# Certbotのインストール（未インストールの場合）
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# SSL証明書の取得
sudo certbot --nginx -d yaku-navi.com -d www.yaku-navi.com
```

証明書取得時に：
- メールアドレスを入力
- 利用規約への同意（Y）
- メール配信の希望（オプション）

---

### ステップ5: 動作確認

```bash
# PM2の状態確認
pm2 status

# ログの確認
pm2 logs --lines 50

# Nginxの状態確認
sudo systemctl status nginx

# DNSの確認
nslookup yaku-navi.com
```

---

## 🎯 一括実行コマンド（コピー&ペースト用）

```bash
# バックエンドの環境変数を更新
cd ~/yaku_navi/backend && \
echo "FRONTEND_URL=https://yaku-navi.com" >> .env && \
echo "CORS_ORIGIN=https://yaku-navi.com" >> .env && \
pm2 restart backend

# フロントエンドの環境変数を更新
cd ~/yaku_navi/frontend && \
echo "NEXT_PUBLIC_API_URL=https://yaku-navi.com/api" > .env.local && \
npm run build && \
pm2 restart frontend

# Nginx設定の確認
sudo nginx -t && sudo systemctl restart nginx
```

**注意**: 上記のコマンドは`.env`ファイルに追記します。既存の設定を上書きしたい場合は、手動で編集してください。

---

## 🔍 トラブルシューティング

### DNSが解決されない場合

```bash
# DNSの確認
nslookup yaku-navi.com
dig yaku-navi.com

# 解決されない場合、DNSプロバイダーの設定を確認
# Aレコード: yaku-navi.com → 85.131.247.170
# Aレコード: www.yaku-navi.com → 85.131.247.170
```

### SSL証明書の取得に失敗する場合

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

### APIリクエストが失敗する場合

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

---

## ✅ 完了後の確認

1. `https://yaku-navi.com` にアクセス
2. LPページが表示されることを確認
3. ログイン・登録機能が動作することを確認
4. ブラウザの開発者ツールでAPIリクエストが正常に動作することを確認

---

**ドメイン**: yaku-navi.com
**IPアドレス**: 85.131.247.170

