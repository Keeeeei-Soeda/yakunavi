# 🔧 フロントエンドビルドエラー修正

## 問題

```
Module not found: Can't resolve 'framer-motion'
```

`framer-motion`がインストールされていないため、ビルドに失敗しています。

---

## 解決方法

### ステップ1: 依存関係をインストール

```bash
cd ~/yaku_navi/frontend
npm install
```

これで、`package.json`に記載されているすべての依存関係（`framer-motion`を含む）がインストールされます。

---

### ステップ2: ビルド

```bash
npm run build
```

---

### ステップ3: PM2で再起動

```bash
# プロセス名を確認
pm2 list

# 正しいプロセス名で再起動（通常は yaku-navi-frontend）
pm2 restart yaku-navi-frontend

# または、すべてのプロセスを再起動
pm2 restart all
```

---

## 一括実行コマンド

```bash
cd ~/yaku_navi/frontend
npm install
npm run build
pm2 restart yaku-navi-frontend
pm2 logs yaku-navi-frontend --lines 50
```

---

## 確認事項

- [ ] `npm install`が正常に完了
- [ ] `npm run build`が正常に完了
- [ ] PM2でフロントエンドが起動している
- [ ] ログにエラーがない

