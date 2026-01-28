# 🔒 Nginx設定とSSL証明書の設定手順

## ✅ 現在の状況

- ✅ HTTPアクセスは正常（`curl -I http://yaku-navi.com` が200 OKを返す）
- ✅ DNSは正常に解決されている
- ⚠️ Nginx設定ファイルに構文エラーがある可能性
- ⚠️ HTTPS（SSL証明書）がまだ設定されていない

---

## 🔧 ステップ1: Nginx設定ファイルの構文エラーを修正

```bash
# 設定ファイルを確認
sudo cat /etc/nginx/sites-available/yaku-navi

# 構文エラーを修正（server_nameの後にセミコロンを追加）
sudo sed -i 's/server_name yaku-navi.com www.yaku-navi.com$/server_name yaku-navi.com www.yaku-navi.com;/' /etc/nginx/sites-available/yaku-navi

# 設定をテスト
sudo nginx -t

# 問題がなければ再読み込み
sudo systemctl reload nginx
```

---

## 🔒 ステップ2: SSL証明書の取得（Let's Encrypt）

### 2.1 Certbotのインストール

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 2.2 SSL証明書の取得

```bash
sudo certbot --nginx -d yaku-navi.com -d www.yaku-navi.com
```

証明書取得時に以下を入力：
- メールアドレス: あなたのメールアドレス
- 利用規約への同意: `Y`
- メール配信の希望: `N`（または`Y`）

Certbotが自動的にNginx設定を更新します。

---

## 🔍 ステップ3: 動作確認

### 3.1 HTTPアクセスの確認

```bash
curl -I http://yaku-navi.com
```

**期待される結果:**
```
HTTP/1.1 301 Moved Permanently
Location: https://yaku-navi.com/
```

（HTTPSにリダイレクトされる）

### 3.2 HTTPSアクセスの確認

```bash
curl -I https://yaku-navi.com
```

**期待される結果:**
```
HTTP/2 200
```

### 3.3 ブラウザでの確認

- `https://yaku-navi.com` にアクセス
- ブラウザのアドレスバーに鍵マークが表示されることを確認
- LPページが表示されることを確認

---

## 🔧 トラブルシューティング

### 問題1: Certbotが失敗する

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

### 問題2: ブラウザからアクセスできない

**確認事項:**

1. **DNS伝播の確認**
   ```bash
   nslookup yaku-navi.com
   dig yaku-navi.com
   ```
   結果に`85.131.247.170`が表示されることを確認

2. **ファイアウォールの確認**
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **Nginxのログを確認**
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

### 問題3: 502 Bad Gatewayエラー

```bash
# PM2のプロセスが起動しているか確認
pm2 status

# バックエンド・フロントエンドが起動しているか確認
pm2 logs --lines 50

# ポートが開いているか確認
netstat -tlnp | grep :3000
netstat -tlnp | grep :5001
```

---

## 📋 完全な設定手順（一括実行）

```bash
# 1. Nginx設定ファイルの構文エラーを修正
sudo sed -i 's/server_name yaku-navi.com www.yaku-navi.com$/server_name yaku-navi.com www.yaku-navi.com;/' /etc/nginx/sites-available/yaku-navi

# 2. 設定をテスト
sudo nginx -t

# 3. Nginxを再読み込み
sudo systemctl reload nginx

# 4. Certbotのインストール
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# 5. SSL証明書の取得
sudo certbot --nginx -d yaku-navi.com -d www.yaku-navi.com

# 6. 動作確認
curl -I https://yaku-navi.com
```

---

## ✅ 完了後の確認

- [ ] Nginx設定ファイルの構文エラーが修正された
- [ ] SSL証明書が取得された
- [ ] HTTPSでアクセスできる
- [ ] HTTPからHTTPSにリダイレクトされる
- [ ] ブラウザで鍵マークが表示される
- [ ] LPページが正常に表示される

---

**最終更新**: 2026年1月28日
**ドメイン**: yaku-navi.com

