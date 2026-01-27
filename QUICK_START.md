# クイックスタートガイド

## ✅ バックエンドサーバー（起動済み）

```bash
cd backend
npm run dev
```

**状態**: ✅ 起動中 - `http://localhost:5001`

## 🚀 フロントエンドサーバーの起動

新しいターミナルウィンドウで以下を実行：

```bash
cd frontend
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

## 📍 確認できるページ

起動後、以下のURLでダッシュボードを確認できます：

- **トップページ**: http://localhost:3000
- **薬局ダッシュボード**: http://localhost:3000/pharmacy/dashboard
- **薬剤師ダッシュボード**: http://localhost:3000/pharmacist/dashboard

## 🔍 API動作確認

バックエンドAPIは以下のエンドポイントで確認できます：

- **ヘルスチェック**: http://localhost:5001/health
- **API情報**: http://localhost:5001/api
- **薬局統計**: http://localhost:5001/api/pharmacy/dashboard/1/stats
- **薬剤師統計**: http://localhost:5001/api/pharmacist/dashboard/1/stats

## ⚠️ 注意事項

- 現在は開発環境モードで、認証がスキップされています
- データベースにデータがない場合、ダッシュボードは空の状態で表示されます（これは正常です）
- データを追加する場合は、Prisma Studioを使用するか、シードスクリプトを作成してください

