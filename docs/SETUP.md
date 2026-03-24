# セットアップ・起動ガイド

開発環境のセットアップと、バックエンド・フロントエンドの起動手順をまとめています。

---

## クイックスタート（すでにセットアップ済みの場合）

### 1. バックエンドの起動

```bash
cd backend
npm run dev
```

バックエンドは **http://localhost:5001** で起動します。

### 2. フロントエンドの起動

別のターミナルで：

```bash
cd frontend
npm run dev
```

フロントエンドは **http://localhost:3000** で起動します。

### 3. 確認できるページ

- **トップページ**: http://localhost:3000
- **薬局ダッシュボード**: http://localhost:3000/pharmacy/dashboard
- **薬剤師ダッシュボード**: http://localhost:3000/pharmacist/dashboard

### 4. API動作確認

- **ヘルスチェック**: http://localhost:5001/health

---

## 初回セットアップ（クローン直後）

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd yaku_navi
```

### 2. PostgreSQLのセットアップ

#### macOSの場合

```bash
brew install postgresql@14
brew services start postgresql@14
createdb pharmacy_db
```

#### Linuxの場合

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql -c "CREATE DATABASE pharmacy_db;"
# 必要に応じて CREATE USER / GRANT
```

### 3. バックエンドのセットアップ

```bash
cd backend
npm install
# .env を作成（backend/.env.example を参考に DATABASE_URL, JWT_SECRET 等を設定）
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

バックエンドのポートは `.env` の `PORT` で変更可能です（既定は 5001）。

### 4. フロントエンドのセットアップ

別ターミナルで：

```bash
cd frontend
npm install
# 必要なら .env.local に NEXT_PUBLIC_API_URL=http://localhost:5001/api を設定
npm run dev
```

---

## 動作確認

- バックエンド: `curl http://localhost:5001/health` で `{"status":"ok",...}` が返ること
- フロントエンド: ブラウザで http://localhost:3000 が開くこと
- データがない場合はダッシュボードが空で表示されるのは正常です。テストデータは `docs/SEED_DATA.md` を参照してください。

---

## トラブルシューティング

### ポート競合

- バックエンド: `backend/.env` の `PORT` を変更
- フロントエンド: `PORT=3001 npm run dev` で別ポート起動

### データベース接続エラー

- PostgreSQL が起動しているか確認（`brew services list` または `systemctl status postgresql`）
- `DATABASE_URL` のホスト・DB名・ユーザー・パスワードを確認

### Prisma

```bash
cd backend
npx prisma generate
# 必要に応じて npx prisma migrate reset（データ削除されるため注意）
```

---

## 本番環境

本番デプロイ手順は **docs/DEPLOYMENT.md** を参照してください。
