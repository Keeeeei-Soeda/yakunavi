# 🌱 シードデータガイド

## 📋 目次

1. [シードデータの実行](#シードデータの実行)
2. [作成されるデータ](#作成されるデータ)
3. [プロフィール更新スクリプト](#プロフィール更新スクリプト)
4. [テストアカウント](#テストアカウント)

---

## シードデータの実行

### ローカル環境での実行

```bash
cd backend
npm run prisma:seed
```

または

```bash
cd backend
npx ts-node prisma/seed.ts
```

### 実行後の確認

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

## 作成されるデータ

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

### 求人データ（5件）

- 各薬局が1-2件の求人を投稿
- ステータス: `published`（公開中）

### 応募データ（3件）

- 薬剤師1と薬剤師3が求人に応募
- ステータス: `applied`（応募済み）

---

## プロフィール更新スクリプト

### 薬剤師プロフィールの更新

既存の薬剤師アカウントのプロフィールを充実させる場合：

```bash
cd backend
npm run update:profiles
```

このスクリプトは以下のアカウントのプロフィールを更新します：
- `pharmacist1@test.com`
- `pharmacist2@test.com`

### 更新される内容

- 基本情報（年齢、出身大学、卒業年など）
- 資格情報（認定薬剤師資格、その他の資格）
- 経歴（勤務経験年数、業態、主な業務経験）
- スキル・専門分野（得意な診療科、薬歴システム）
- 自己紹介・アピールポイント
- 資格証明書の作成

---

## テストアカウント

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

## テストアカウント一覧（詳細）

シード実行後、以下のアカウントでログインできます。パスワードはすべて **password123** です。

### 薬局アカウント（代表例）

| メール | パスワード | 薬局名 | 代表者 | 所在地 |
|--------|-----------|--------|--------|--------|
| pharmacy1@test.com | password123 | 羽曳野薬局 / テスト薬局 新宿店 | 山田 太郎 | 東京都新宿区 |
| pharmacy2@test.com | password123 | テスト薬局 新宿店 | - | 東京都新宿区 |
| pharmacy3@test.com | password123 | サンプル薬局 渋谷店 | 佐藤 花子 | 東京都渋谷区 |

### 薬剤師アカウント（代表例）

| メール | パスワード | 氏名 | 証明書 | 備考 |
|--------|-----------|------|--------|------|
| pharmacist1@test.com | password123 | 田中 一郎 | ✅ 確認済み | プロフィール充実、応募テスト向け |
| pharmacist2@test.com | password123 | 鈴木 美咲 | ⏳ 確認中 | 応募時に警告表示あり |
| pharmacist3@test.com | password123 | 佐藤 健太 | ✅ 確認済み | 在宅医療経験あり |

その他の薬剤師・薬局はシードで自動作成されます。詳細は `prisma/seed.ts` を参照してください。

---

## アカウント確認方法

### Prisma Studio（推奨）

```bash
cd backend
npx prisma studio
```

ブラウザで http://localhost:5555 を開き、`users`・`pharmacists`・`pharmacies` テーブルで確認できます。

### コマンドで確認する場合

プロジェクトルートで以下を実行（要 `ts-node`）:

```bash
cd backend
npx ts-node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const pharmacists = await prisma.pharmacist.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  console.log('=== 薬剤師一覧 ===');
  pharmacists.forEach((p) => console.log(p.id, p.lastName + ' ' + p.firstName, p.user.email));
  const pharmacies = await prisma.pharmacy.findMany({
    include: { user: { select: { email: true } } },
  });
  console.log('=== 薬局一覧 ===');
  pharmacies.forEach((p) => console.log(p.id, p.pharmacyName || p.companyName, p.user.email));
  await prisma.\$disconnect();
})();
"
```

統計のみ確認する場合は `npm run stats` などが利用可能な場合があります（backend/package.json の scripts を確認）。

---

## ダミーアカウントの追加（既存データを残す）

既存データを削除せず、追加で薬局・薬剤師アカウントを作成する場合:

```bash
cd backend
npx ts-node scripts/add-dummy-accounts.ts
```

- **薬局**: 10件（pharmacy.dummy1@test.com ～ pharmacy.dummy10@test.com）
- **薬剤師**: 10件（pharmacist.dummy1@test.com ～ pharmacist.dummy10@test.com）
- パスワードはすべて **password123**
- 本番で実行する場合は、必ずテスト用であることを確認してください

---

## 注意事項

- シードデータ（`npm run prisma:seed`）を実行すると、既存のデータがすべて削除されます
- 本番環境ではシードを実行しないでください
- パスワードはすべて `password123` です（テスト用）

---

## データの再作成

データを再作成する場合は、再度シードコマンドを実行してください：

```bash
cd backend
npm run prisma:seed
```

---

**最終更新**: 2026年3月

