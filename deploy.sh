#!/bin/bash

# デプロイスクリプト
# サーバー上で実行してください

echo "🚀 デプロイを開始します..."

# プロジェクトディレクトリに移動
cd ~/yaku_navi

# 最新のコードを取得
echo "📥 最新のコードを取得中..."
git pull origin main

# バックエンドの更新
echo "🔧 バックエンドを更新中..."
cd backend
npm install
npm run build
cd ..

# フロントエンドの更新
echo "🎨 フロントエンドを更新中..."
cd frontend
npm install
npm run build
cd ..

# PM2でアプリケーションを再起動
echo "🔄 アプリケーションを再起動中..."
pm2 restart yaku-navi-backend
pm2 restart yaku-navi-frontend

# ステータス確認
echo "📊 ステータス確認..."
pm2 status

# ログ確認
echo "📋 ログ確認（最新50行）..."
pm2 logs --lines 50

echo "✅ デプロイが完了しました！"

