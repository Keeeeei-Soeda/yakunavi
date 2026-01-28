# 💰 支払い承認スクリプト使用ガイド

## 📋 概要

薬局が支払い報告を完了した後、管理者がターミナルから支払いステータスを「承認済み」に変更するためのスクリプトです。

---

## 🚀 使用方法

### 1. 支払いIDを確認

まず、承認したい支払いのIDを確認します。

**方法1: データベースで確認**
```bash
cd backend
npx prisma studio
```

ブラウザで `http://localhost:5555` にアクセスし、`Payment` テーブルを開いて、承認したい支払いのIDを確認します。

**方法2: フロントエンドで確認**
- 薬局側の請求書詳細画面（`/pharmacy/payments/[id]`）のURLからIDを確認
- 例: `http://localhost:3000/pharmacy/payments/1` → 支払いIDは `1`

---

### 2. スクリプトを実行

```bash
cd backend
npm run confirm:payment <paymentId>
```

**例:**
```bash
# 支払いID 1 を承認する場合
npm run confirm:payment 1

# 支払いID 2 を承認する場合
npm run confirm:payment 2
```

---

## ✅ 実行結果

スクリプトが正常に実行されると、以下のように表示されます：

```
🔄 支払いID 1 の承認処理を開始します...

✅ 支払いが正常に承認されました！

📋 更新内容:
   - 支払いID: 1
   - 契約ID: 2
   - 薬局ID: 1
   - ステータス: confirmed（確認済み）

💡 契約ステータスも「active（勤務中）」に更新されました。
```

---

## ⚠️ エラーケース

### エラー1: 支払いが見つからない

```
❌ エラーが発生しました:
   支払い情報が見つかりません

💡 支払いIDが正しいか確認してください。
```

**対処法:** 支払いIDが正しいか確認してください。

---

### エラー2: 支払いが報告されていない

```
❌ エラーが発生しました:
   支払いが報告されていません

💡 支払いステータスが「reported（支払い報告済み）」である必要があります。
   現在のステータスを確認してください。
```

**対処法:** 
1. 薬局側で支払い報告が完了しているか確認
2. 支払いステータスが `reported` になっているか確認

---

## 📊 ステータスの流れ

```
pending（支払い待ち）
    ↓
reported（支払い報告済み）← 薬局が報告
    ↓
confirmed（支払い確認済み）← 管理者が承認（このスクリプト）
```

---

## 🔍 現在のステータスを確認

### Prisma Studioで確認

```bash
cd backend
npx prisma studio
```

ブラウザで `http://localhost:5555` にアクセスし、`Payment` テーブルを開いて確認します。

### SQLで確認

```bash
cd backend
npx prisma db execute --stdin
```

```sql
SELECT id, "paymentStatus", "reportedAt", "confirmedAt" 
FROM "Payment" 
ORDER BY id DESC;
```

---

## 💡 注意事項

- このスクリプトは管理者専用です
- 支払いステータスが `reported` の時のみ実行可能です
- 承認後、契約ステータスも自動的に `active` に更新されます
- 本番環境では、適切な権限管理を行ってください

---

## 🔄 複数の支払いを一括承認

複数の支払いを承認する場合は、以下のようにループで実行できます：

```bash
# 支払いID 1, 2, 3 を順番に承認
for id in 1 2 3; do
  npm run confirm:payment $id
done
```

---

**最終更新**: 2026年1月28日

