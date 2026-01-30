# 労働条件通知書機能のデプロイ手順

## デプロイ内容

- 薬剤師側に労働条件通知書表示ページを追加
- 契約詳細ページから労働条件通知書へのリンクを追加
- 薬局側の請求書画面からPDFダウンロードボタンを削除
- 薬剤師側の契約書類からinvoiceを除外
- 印刷機能を統一（印刷/PDF保存ボタンのみ）

## サーバー側でのデプロイ手順

```bash
# 1. プロジェクトディレクトリに移動
cd ~/yaku_navi

# 2. 最新のコードを取得
git pull origin main

# 3. バックエンドの更新
# 注意: 今回の変更ではバックエンドのコード変更はありませんが、
# 依存関係の更新や念のため、ビルドを実行することを推奨します
cd backend
npm install
npm run build
cd ..

# 4. フロントエンドの更新
cd frontend
npm install
npm run build
cd ..

# 5. PM2でアプリケーションを再起動
cd ~/yaku_navi
pm2 restart yaku-navi-backend
pm2 restart yaku-navi-frontend

# 6. ステータス確認
pm2 status

# 7. ログ確認（エラーがないか確認）
pm2 logs yaku-navi-backend --lines 50
pm2 logs yaku-navi-frontend --lines 50
```

### 一括実行コマンド（コピー&ペースト用）

```bash
cd ~/yaku_navi && \
git pull origin main && \
cd backend && npm install && npm run build && cd .. && \
cd frontend && npm install && npm run build && cd .. && \
pm2 restart yaku-navi-backend && pm2 restart yaku-navi-frontend && \
pm2 status
```

## 確認事項

デプロイ後、以下を確認してください：

1. ✅ 薬剤師側の契約詳細ページに「労働条件通知書を表示」ボタンが表示される
2. ✅ 労働条件通知書ページが正常に表示される（`/pharmacist/contracts/[id]/labor-conditions`）
3. ✅ 印刷機能が正常に動作する（ブラウザの印刷ダイアログが開く）
4. ✅ 薬局側の請求書画面から「PDFダウンロード」ボタンが削除されている
5. ✅ 薬局側の請求書画面で「印刷 / PDF保存」ボタンのみが表示される
6. ✅ 薬剤師側の契約書類セクションにinvoiceが表示されない

## 変更ファイル

- `frontend/app/pharmacist/contracts/[id]/labor-conditions/page.tsx` (新規)
- `frontend/app/pharmacist/contracts/[id]/page.tsx` (修正)
- `frontend/app/pharmacy/payments/[id]/page.tsx` (修正)
- `frontend/components/pharmacist/Layout.tsx` (修正)
- `frontend/app/globals.css` (修正)

