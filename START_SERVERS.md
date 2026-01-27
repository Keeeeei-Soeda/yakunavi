# サーバー起動手順

## 1. バックエンドサーバーの起動

```bash
cd backend

# .envファイルのDATABASE_URLを確認・更新
# DATABASE_URL="postgresql://soedakei@localhost:5432/pharmacy_db?schema=public"

# 開発サーバーを起動
npm run dev
```

バックエンドは `http://localhost:5000` で起動します。

## 2. フロントエンドサーバーの起動

新しいターミナルウィンドウで：

```bash
cd frontend

# 開発サーバーを起動
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

## 3. 動作確認

ブラウザで以下のURLにアクセス：

- トップページ: http://localhost:3000
- 薬局ダッシュボード: http://localhost:3000/pharmacy/dashboard
- 薬剤師ダッシュボード: http://localhost:3000/pharmacist/dashboard

## 注意事項

- 現在は開発環境モードで、認証がスキップされています
- データベースにデータがない場合、ダッシュボードは空の状態で表示されます
- テストデータを投入する場合は、Prisma Studioを使用するか、シードスクリプトを作成してください

