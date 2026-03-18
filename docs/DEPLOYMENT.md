# 🚀 デプロイガイド

## 📋 目次

1. [今後のデプロイ手順（推奨フロー）](#今後のデプロイ手順推奨フロー)
2. [本番サーバー上での作業](#本番サーバー上での作業)
3. [デプロイコマンド集](#デプロイコマンド集)
4. [トラブルシューティング](#トラブルシューティング)
5. [ロールバック手順](#ロールバック手順)

---

## 今後のデプロイ手順（推奨フロー）

### 前提

- 本番サーバー: `85.131.247.170`（yaku-navi.com）
- SSH: 鍵ファイル `ssh_yakunavi.pem` を使用
- バックエンドは **TypeScript をコンパイルした `dist/`** で動作するため、**ソース変更のたびに `npm run build` が必須**

---

### Step 1: ローカルでコミット・プッシュ

```bash
cd /path/to/yaku_navi
git add .
git commit -m "feat: 変更内容の説明"
git push origin main
```

---

### Step 2: 本番サーバーに SSH 接続

```bash
ssh -i ssh_yakunavi.pem root@85.131.247.170
```

（または `~/.ssh/config` で Host を設定している場合: `ssh yaku-navi`）

---

### Step 3: 本番で最新コードを取得

```bash
cd /root/yaku_navi
git pull origin main
```

---

### Step 4: バックエンドの更新（必須）

**重要**: バックエンドの TypeScript を変更した場合は、必ず `npm run build` を実行する。  
未実行だと `dist/` が古いままになり、新ルートが 404 になったり BigInt などで 500 が出る。

```bash
cd /root/yaku_navi/backend
npm install
npx prisma generate
npx prisma migrate deploy   # DB スキーマ変更がある場合のみ
# データ移行スクリプトが必要な場合のみ:
# npx ts-node scripts/xxxx.ts
npm run build
cd ..
```

---

### Step 5: フロントエンドの更新

```bash
cd /root/yaku_navi/frontend
npm install
npm run build
cd ..
```

---

### Step 6: PM2 で再起動

```bash
pm2 restart all
pm2 status
```

---

### Step 7: 動作確認

```bash
# ヘルスチェック
curl -s http://localhost:5001/health

# エラーログ確認（直近）
pm2 logs yaku-navi-backend --lines 30 --nostream
```

ブラウザで https://yaku-navi.com を開き、該当機能を確認する。

---

## 本番サーバー上での作業

上記 Step 2 以降を、本番サーバーにログインしたうえで次のように一括実行することもできる。

```bash
cd /root/yaku_navi
git pull origin main

cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
cd ..

cd frontend
npm install
npm run build
cd ..

pm2 restart all
pm2 status
```

---

## デプロイコマンド集

### 一括実行コマンド（本番サーバー上でコピー&ペースト用）

```bash
cd /root/yaku_navi && \
git pull origin main && \
cd backend && npm install && npx prisma generate && npx prisma migrate deploy && npm run build && cd .. && \
cd frontend && npm install && npm run build && cd .. && \
pm2 restart all && \
pm2 status && \
pm2 logs --lines 20 --nostream
```

### PM2コマンド

```bash
# すべてのプロセスを再起動
pm2 restart all

# 個別に再起動
pm2 restart yaku-navi-backend
pm2 restart yaku-navi-frontend

# ステータス確認
pm2 status

# ログ確認
pm2 logs --lines 50
pm2 logs --err --lines 100
```

---

## トラブルシューティング

### 問題1: `npm install`でエラーが発生する場合

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### 問題2: フロントエンドの `npm run build` でエラーが発生する場合

```bash
cd frontend
rm -rf .next
npm run build
```

### 問題2b: バックエンドの `npm run build` でエラーが発生する場合

```bash
cd backend
rm -rf dist
npm run build
```

### 問題3: PM2のプロセスが見つからない場合

```bash
# PM2のプロセス一覧を確認
pm2 list

# プロセスが存在しない場合は、新規に起動
cd ~/yaku_navi/backend
pm2 start npm --name "yaku-navi-backend" -- start
cd ../frontend
pm2 start npm --name "yaku-navi-frontend" -- start
pm2 save
```

### 問題4: ポートが既に使用されている場合

```bash
# ポート5001（バックエンド）を確認
lsof -i :5001

# ポート3001（フロントエンド・本番では next start -p 3001 で起動）を確認
lsof -i :3001

# プロセスを終了
kill -9 <PID>
```

---

## デプロイ後の確認

### 1. バックエンドの確認

```bash
curl http://localhost:5001/health
```

### 2. フロントエンドの確認

ブラウザで以下にアクセス：
- `https://yaku-navi.com`
- `https://yaku-navi.com/pharmacy/dashboard`
- `https://yaku-navi.com/pharmacist/dashboard`

### 3. 機能確認チェックリスト

- [ ] 採用済み薬剤師のプロフィールページが表示される
- [ ] メッセージ画面で匿名化が機能している
- [ ] 支払い報告後に自動遷移する
- [ ] 薬剤師ログアウト後に `/pharmacist/login` に遷移する
- [ ] エラーページが正しく表示される

### 4. サブドメインLP（yakkyoku.yaku-navi.com）

薬局向けLPは **https://yakkyoku.yaku-navi.com/** で公開。初回デプロイ・Nginx 反映手順は [SUBDOMAIN_YAKKYOKU_LP.md](./SUBDOMAIN_YAKKYOKU_LP.md) を参照。画像は `LP_page/images/` に指定ファイル名で後からアップロード可能。

---

## ロールバック手順

```bash
cd ~/yaku_navi
git log --oneline -10  # 以前のコミットを確認
git checkout <previous-commit-hash>
cd backend && npm run build
cd ../frontend && npm run build
pm2 restart yaku-navi-backend
pm2 restart yaku-navi-frontend
```

---

## 📝 注意事項

- **バックエンド**: 本番は `dist/` のコンパイル済み JS で動作します。TypeScript やルート・サービスを変更したら必ず `npm run build` を実行してください。未実行だと 404（新ルート未反映）や 500（BigInt シリアライズ等）の原因になります。
- **DB スキーマ変更時**: `prisma migrate deploy` のあと、必要に応じて `scripts/` のデータ移行スクリプトを実行してください（例: `npx ts-node scripts/migrate-to-branches.ts`）。
- デプロイ前にデータベースのバックアップを推奨
- 本番環境では `NODE_ENV=production` が設定されていることを確認
- 環境変数（`.env`）が正しく設定されていることを確認
- ビルド時間: `npm run build` は数分かかる場合があります
- メモリ使用量: ビルド中はメモリを多く使用する可能性があります
- ダウンタイム: PM2の再起動中は一時的にアプリケーションが利用できなくなる可能性があります

---

**最終更新**: 2026年3月17日

