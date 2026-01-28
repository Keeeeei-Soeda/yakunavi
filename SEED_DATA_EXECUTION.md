# 🌱 シードデータ実行手順

## 📋 概要

ローカル環境でテスト用のダミーデータを作成します。

---

## 🚀 実行方法

### 1. データベースの準備

```bash
cd backend
```

### 2. シードデータの実行

```bash
npm run prisma:seed
```

または

```bash
npx ts-node prisma/seed.ts
```

---

## ✅ 実行後の確認

### データベースの確認

```bash
# Prisma Studioで確認
npx prisma studio
```

ブラウザで `http://localhost:5555` にアクセスして、以下のテーブルを確認：
- `users` - ユーザーアカウント
- `pharmacies` - 薬局情報
- `pharmacists` - 薬剤師情報（プロフィール充実）
- `certificates` - 資格証明書
- `job_postings` - 求人データ
- `applications` - 応募データ

---

## 📝 作成されるアカウント

### 薬局アカウント（3件）

| メール | パスワード | 薬局名 | 所在地 |
|--------|-----------|--------|--------|
| pharmacy1@test.com | password123 | 羽曳野薬局 | 大阪府羽曳野市 |
| pharmacy2@test.com | password123 | テスト薬局 新宿店 | 東京都新宿区 |
| pharmacy3@test.com | password123 | サンプル薬局 渋谷店 | 東京都渋谷区 |

### 薬剤師アカウント（5件）

| メール | パスワード | 氏名 | 資格証明書 | プロフィール |
|--------|-----------|------|-----------|------------|
| pharmacist1@test.com | password123 | 田中 一郎 | ✅ 確認済み | 充実 |
| pharmacist2@test.com | password123 | 鈴木 美咲 | ⏳ 確認中 | 充実 |
| pharmacist3@test.com | password123 | 佐藤 健太 | ✅ 確認済み | 充実 |
| pharmacist4@test.com | password123 | 山本 さくら | ✅ 確認済み | 充実 |
| pharmacist5@test.com | password123 | 中村 大輔 | ✅ 確認済み | 充実 |

---

## 🔍 テストシナリオ

### 薬局側のテスト

1. **pharmacy1@test.com** でログイン
   - 応募管理画面で薬剤師1と薬剤師3の応募を確認
   - 応募者詳細画面でプロフィールを確認（手数料支払い前は名前非表示）
   - メッセージ画面で匿名化を確認（「応募者A」「応募者B」など）

2. **pharmacy2@test.com** でログイン
   - 応募管理画面で薬剤師4の応募を確認
   - 求人作成・編集機能をテスト

### 薬剤師側のテスト

1. **pharmacist1@test.com** でログイン
   - プロフィールが充実していることを確認
   - 求人検索・応募機能をテスト
   - 応募済み求人を確認

2. **pharmacist3@test.com** でログイン
   - 在宅医療の経験が記載されていることを確認
   - 求人に応募してフローをテスト

---

## ⚠️ 注意事項

- シードデータを実行すると、既存のデータがすべて削除されます
- 本番環境では実行しないでください
- パスワードはすべて `password123` です（テスト用）

---

## 🔄 データの再作成

データを再作成する場合は、再度シードコマンドを実行してください：

```bash
cd backend
npm run prisma:seed
```

---

**最終更新**: 2026年1月28日

