# 🔍 バックエンド環境変数チェック

## ⚠️ 修正が必要な点

### 1. DATABASE_URL（構文エラー）

**現在:**
```env
DATABASE_URL="postgresql://pharmacy_user:Yakunavi168@localhost:5432/pharmacy_db>
```

**問題点:**
- 最後に`>`が余分にある
- 閉じ引用符`"`が欠けている

**修正後:**
```env
DATABASE_URL="postgresql://pharmacy_user:Yakunavi168@localhost:5432/pharmacy_db?schema=public"
```

---

### 2. JWT_SECRET（セキュリティ）

**現在:**
```env
JWT_SECRET=Yakunavi2024ProductionSecretKeyChangeThisToRandomString32CharsMin
```

**問題点:**
- 長さは十分ですが、よりランダムな文字列が推奨されます

**推奨（オプション）:**
```bash
# ランダムな32文字以上の文字列を生成
openssl rand -base64 32
```

**現在の設定でも動作しますが、より安全にすることを推奨します。**

---

### 3. JWT_REFRESH_SECRET（セキュリティ）

**現在:**
```env
JWT_REFRESH_SECRET=Yakunavi2024RefreshSecretKeyChangeThisToRandomString32CharsM>
```

**問題点:**
- 最後に`>`が余分にある（おそらくコピペ時のエラー）

**修正後:**
```env
JWT_REFRESH_SECRET=Yakunavi2024RefreshSecretKeyChangeThisToRandomString32CharsMin
```

または、より安全なランダム文字列：
```bash
openssl rand -base64 32
```

---

### 4. RESEND_API_KEY（メール送信）

**現在:**
```env
RESEND_API_KEY=
```

**問題点:**
- 空の場合、メール送信機能が動作しません

**対応:**
- メール送信機能を使用しない場合は、このままでOK
- メール送信機能を使用する場合は、ResendのAPIキーを設定してください

---

## ✅ 修正後の完全な設定

```env
DATABASE_URL="postgresql://pharmacy_user:Yakunavi168@localhost:5432/pharmacy_db?schema=public"
JWT_SECRET=Yakunavi2024ProductionSecretKeyChangeThisToRandomString32CharsMin
JWT_REFRESH_SECRET=Yakunavi2024RefreshSecretKeyChangeThisToRandomString32CharsMin
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://yaku-navi.com
RESEND_API_KEY=
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=https://yaku-navi.com
```

---

## 🔒 セキュリティ強化版（推奨）

より安全な設定：

```env
DATABASE_URL="postgresql://pharmacy_user:Yakunavi168@localhost:5432/pharmacy_db?schema=public"
JWT_SECRET=<openssl rand -base64 32 で生成した値>
JWT_REFRESH_SECRET=<openssl rand -base64 32 で生成した値>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://yaku-navi.com
RESEND_API_KEY=
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=https://yaku-navi.com
```

---

## 📝 チェックリスト

- [ ] DATABASE_URLの構文エラーを修正
- [ ] JWT_REFRESH_SECRETの構文エラーを修正
- [ ] JWT_SECRETとJWT_REFRESH_SECRETをランダム文字列に変更（オプション、推奨）
- [ ] RESEND_API_KEYを設定（メール送信機能を使用する場合）

---

## 🚀 設定後の確認

```bash
# バックエンドを再起動
cd ~/yaku_navi/backend
pm2 restart backend

# ログを確認
pm2 logs backend --lines 50

# エラーがないか確認
# データベース接続エラーが出ないか確認
# JWT関連のエラーが出ないか確認
```

