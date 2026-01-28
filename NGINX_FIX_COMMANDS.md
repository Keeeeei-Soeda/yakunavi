# 🔧 Nginx設定ファイルの修正コマンド

## ⚠️ 問題

Nginx設定ファイルに構文エラーがあります：

```
directive "server_name" is not terminated by ";"
```

13行目の`server_name`の後にセミコロン（`;`）が欠けています。

---

## 🔧 修正手順

### ステップ1: 設定ファイルを編集

```bash
sudo nano /etc/nginx/sites-available/yaku-navi
```

### ステップ2: 13行目を修正

**修正前:**
```nginx
server_name yaku-navi.com www.yaku-navi.com
```

**修正後:**
```nginx
server_name yaku-navi.com www.yaku-navi.com;
```

### ステップ3: 保存して終了

- `Ctrl + O` で保存
- `Enter` で確認
- `Ctrl + X` で終了

### ステップ4: 設定をテスト

```bash
sudo nginx -t
```

**期待される結果:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### ステップ5: Nginxを再読み込み

```bash
sudo systemctl reload nginx
```

または

```bash
sudo systemctl restart nginx
```

---

## ✅ 完全な修正後の設定ファイル

```nginx
upstream backend {
    server localhost:5001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name yaku-navi.com www.yaku-navi.com;

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

---

## 🎯 一括実行コマンド（修正後）

```bash
# 設定ファイルを修正（sedコマンドで自動修正）
sudo sed -i 's/server_name yaku-navi.com www.yaku-navi.com$/server_name yaku-navi.com www.yaku-navi.com;/' /etc/nginx/sites-available/yaku-navi

# 設定をテスト
sudo nginx -t

# Nginxを再読み込み
sudo systemctl reload nginx

# 状態を確認
sudo systemctl status nginx
```

---

## 🔍 動作確認

### 1. Nginxの状態確認

```bash
sudo systemctl status nginx
```

### 2. HTTPアクセステスト

```bash
curl -I http://yaku-navi.com
```

**期待される結果:**
```
HTTP/1.1 200 OK
```

### 3. ブラウザでの確認

- `http://yaku-navi.com` にアクセス
- LPページが表示されることを確認

---

## 🔒 SSL証明書の設定（次のステップ）

HTTPは動作しているので、次はHTTPSを設定します：

```bash
# Certbotのインストール（未インストールの場合）
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# SSL証明書の取得
sudo certbot --nginx -d yaku-navi.com -d www.yaku-navi.com
```

---

## 📝 注意事項

1. **UFW**: `ufw status`が`inactive`になっていますが、問題ありません（サーバー側のファイアウォール設定による）
2. **DNS**: `curl -I http://yaku-navi.com`が200 OKを返しているので、DNSは正常に解決されています
3. **HTTPS**: 現在はHTTPのみ。SSL証明書を取得するとHTTPSが有効になります

---

**修正日**: 2026年1月28日

