# 🚀 現在のデプロイ手順（2026年1月28日）

## ✅ GitHubへのプッシュ完了

以下の変更がGitHubにプッシュされました：
- 請求書詳細ページのサイドバー非表示機能
- ブラウザ印刷機能によるPDF保存
- PDFダウンロード機能の改善
- 日本語フォントの追加
- その他の機能改善

**コミット**: `34838c3`
**ブランチ**: `main`

---

## 📋 サーバー側でのデプロイ手順

### ステップ1: サーバーにSSH接続

```bash
# Xserver VPSのシリアルコンソールまたはSSH接続を使用
ssh root@85.131.247.170
# または
# Xserver VPSのコントロールパネルからシリアルコンソールにアクセス
```

### ステップ2: アプリケーションディレクトリに移動

```bash
# プロジェクトディレクトリに移動（実際のパスに合わせて調整）
cd /var/www/yaku_navi
# または
cd ~/yaku_navi
```

### ステップ3: 最新のコードを取得

```bash
# 現在の変更を確認（必要に応じて）
git status

# 最新のコードを取得
git pull origin main
```

### ステップ4: バックエンドの依存関係を更新

```bash
cd backend

# 依存関係の更新（package.jsonに変更がある場合）
npm install

# フォントファイルの確認
ls -la fonts/
# NotoSansJP-VariableFont_wght.ttf が存在することを確認
```

### ステップ5: フロントエンドの依存関係を更新

```bash
cd ../frontend

# 依存関係の更新（package.jsonに変更がある場合）
npm install
```

### ステップ6: フロントエンドのビルド

```bash
# Next.jsアプリケーションのビルド
npm run build
```

### ステップ7: PM2でアプリケーションを再起動

```bash
# 現在のPM2プロセスを確認
pm2 list

# バックエンドを再起動
cd ../backend
pm2 restart backend
# または
pm2 restart all

# フロントエンドを再起動（Next.jsの場合）
cd ../frontend
pm2 restart frontend
# または
pm2 restart all

# PM2の状態を確認
pm2 status

# ログを確認
pm2 logs
```

### ステップ8: 動作確認

```bash
# バックエンドのログを確認
pm2 logs backend --lines 50

# フロントエンドのログを確認
pm2 logs frontend --lines 50

# エラーがないか確認
pm2 logs --err
```

---

## 🔍 トラブルシューティング

### 問題1: `git pull`でエラーが発生する場合

```bash
# ローカルの変更を確認
git status

# ローカルの変更を一時的に保存
git stash

# 再度pull
git pull origin main

# 保存した変更を復元（必要に応じて）
git stash pop
```

### 問題2: 依存関係のインストールでエラーが発生する場合

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### 問題3: ビルドエラーが発生する場合

```bash
# キャッシュをクリア
rm -rf .next
npm run build
```

### 問題4: PM2でアプリケーションが起動しない場合

```bash
# PM2のプロセスを削除して再起動
pm2 delete all
cd backend && pm2 start npm --name "backend" -- start
cd ../frontend && pm2 start npm --name "frontend" -- start
pm2 save
```

### 問題5: フォントファイルが見つからない場合

```bash
# フォントファイルの存在確認
cd backend
ls -la fonts/NotoSansJP-VariableFont_wght.ttf

# 存在しない場合は、GitHubから再取得
git pull origin main
```

---

## 📝 デプロイ後の確認項目

### バックエンドの確認

- [ ] APIが正常に動作しているか
- [ ] PDF生成機能が正常に動作しているか
- [ ] 日本語フォントが正しく読み込まれているか
- [ ] エラーログに問題がないか

### フロントエンドの確認

- [ ] 請求書詳細ページが正常に表示されるか
- [ ] サイドバーが非表示になっているか
- [ ] 印刷ボタンが正常に動作するか
- [ ] PDFダウンロードが正常に動作するか

### 機能の確認

- [ ] 請求書詳細ページ（`/pharmacy/payments/[id]`）でサイドバーが非表示
- [ ] 印刷ボタンをクリックしてPDF保存ができる
- [ ] PDFに日本語が正しく表示される
- [ ] 薬局からの初回出勤日提案が1回のみに制限されている
- [ ] 薬剤師の応募取り下げ機能が削除されている

---

## 🎯 クイックデプロイコマンド（まとめて実行）

```bash
# サーバーに接続後、以下を実行
cd /var/www/yaku_navi  # または実際のパス
git pull origin main
cd backend && npm install && cd ..
cd frontend && npm install && npm run build && cd ..
pm2 restart all
pm2 logs --lines 50
```

---

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. PM2のログ: `pm2 logs`
2. Nginxのログ: `tail -f /var/log/nginx/error.log`
3. システムログ: `journalctl -u pm2-root -n 50`

---

**最終更新**: 2026年1月28日
**デプロイ対象**: 請求書詳細ページの改善とPDF印刷機能

