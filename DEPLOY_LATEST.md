# 🚀 最新版デプロイ手順

## 📋 デプロイ内容

以下の機能が追加・修正されました：

1. **採用済み薬剤師のプロフィールページ**
   - メールアドレス・電話番号の表示
   - 詳細情報のモーダル表示

2. **メッセージ画面の匿名化機能**
   - 手数料支払い前は「応募者A」「応募者B」などで表示
   - 支払い確認後は実名表示

3. **支払い報告後の自動遷移**
   - 支払い報告完了後、自動的に請求書管理画面に遷移

4. **薬剤師ログアウト後の遷移先修正**
   - `/auth/login` → `/pharmacist/login` に変更

5. **支払いステータス承認スクリプト**
   - `npm run confirm:payment <paymentId>` で承認可能

6. **エラーハンドリング追加**
   - `error.tsx` と `not-found.tsx` を追加

---

## 🔧 デプロイ手順

### 1. サーバーにSSH接続

```bash
ssh root@x85-131-247-170
```

### 2. プロジェクトディレクトリに移動

```bash
cd ~/yaku_navi
```

### 3. 最新のコードを取得

```bash
git pull origin main
```

### 4. バックエンドの更新

```bash
cd backend
npm install
npm run build
```

### 5. フロントエンドの更新

```bash
cd ../frontend
npm install
npm run build
```

### 6. PM2でアプリケーションを再起動

```bash
# バックエンドを再起動
pm2 restart yaku-navi-backend

# フロントエンドを再起動
pm2 restart yaku-navi-frontend

# ステータス確認
pm2 status
```

### 7. ログ確認

```bash
# バックエンドのログ
pm2 logs yaku-navi-backend --lines 50

# フロントエンドのログ
pm2 logs yaku-navi-frontend --lines 50
```

---

## ✅ デプロイ後の確認

### 1. バックエンドの確認

```bash
curl http://localhost:5001/health
```

### 2. フロントエンドの確認

ブラウザで以下にアクセス：
- `https://yaku-navi.com`
- `https://yaku-navi.com/pharmacy/dashboard`
- `https://yaku-navi.com/pharmacist/dashboard`

### 3. 機能確認

- [ ] 採用済み薬剤師のプロフィールページが表示される
- [ ] メッセージ画面で匿名化が機能している
- [ ] 支払い報告後に自動遷移する
- [ ] 薬剤師ログアウト後に `/pharmacist/login` に遷移する
- [ ] エラーページが正しく表示される

---

## 🔄 ロールバック手順（必要に応じて）

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

- デプロイ前にデータベースのバックアップを推奨
- 本番環境では `NODE_ENV=production` が設定されていることを確認
- 環境変数（`.env`）が正しく設定されていることを確認

---

**最終更新**: 2026年1月28日

