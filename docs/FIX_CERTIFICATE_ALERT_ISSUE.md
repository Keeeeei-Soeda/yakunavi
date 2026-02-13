# 🔧 資格証明書アラート表示問題の修正

## 📋 問題の概要

薬剤師側の画面で、資格証明書が承認済みにも関わらずアラートが表示され続ける問題が発生していました。

### 発生箇所
1. **プロフィール管理画面** (`/pharmacist/profile`)
2. **求人詳細画面** (`/pharmacist/jobs/[id]`)

### エラーログ
```
GET https://yaku-navi.com/api/pharmacist-profiles/undefined 404 (Not Found)
GET https://yaku-navi.com/api/pharmacist-profiles/undefined/certificates 500 (Internal Server Error)
```

## 🔍 原因分析

### 問題1: `pharmacistId`が`undefined`になる問題
- `useEffect`の依存配列に`pharmacistId`が含まれておらず、認証情報が取得される前にAPIを呼び出していた
- その結果、`/api/pharmacist-profiles/undefined`という不正なリクエストが発生

### 問題2: アラート表示ロジックの不備
- 承認済み証明書が1つでもあればアラートを非表示にするロジックになっていた
- 実際には、**薬剤師免許証**と**保険薬剤師登録票**の**両方**が承認済みである必要がある
- そのため、片方だけ承認済みの場合でもアラートが表示されない状態になっていた

## ✅ 修正内容

### 1. 求人詳細画面 (`frontend/app/pharmacist/jobs/[id]/page.tsx`)

#### 修正1: `useEffect`の依存配列を修正
```typescript
// 修正前
useEffect(() => {
  fetchJobDetail();
  fetchProfile();
  fetchCertificates();
}, [jobId]);

// 修正後
useEffect(() => {
  fetchJobDetail();
}, [jobId]);

useEffect(() => {
  if (pharmacistId) {
    fetchProfile();
    fetchCertificates();
  }
}, [pharmacistId, fetchProfile, fetchCertificates]);
```

#### 修正2: アラート表示ロジックを修正
```typescript
// 修正前
const isPharmacistVerified = profile?.verificationStatus === 'verified';
const verifiedCerts = certificates.filter(c => c.verificationStatus === 'verified');
const hasVerifiedCertificate = isPharmacistVerified || verifiedCerts.length > 0;

// 修正後
// 両方の証明書（薬剤師免許証と保険薬剤師登録票）が承認済みかチェック
const licenseCert = certificates.find(c => c.certificateType === 'license');
const registrationCert = certificates.find(c => c.certificateType === 'registration');
const hasVerifiedLicense = licenseCert?.verificationStatus === 'verified';
const hasVerifiedRegistration = registrationCert?.verificationStatus === 'verified';
const hasVerifiedCertificate = hasVerifiedLicense && hasVerifiedRegistration;
```

#### 修正3: `useCallback`で関数をメモ化
```typescript
const fetchProfile = useCallback(async () => {
  // ...
}, [pharmacistId]);

const fetchCertificates = useCallback(async () => {
  // ...
}, [pharmacistId]);
```

### 2. プロフィール管理画面 (`frontend/app/pharmacist/profile/page.tsx`)

#### 修正: アラート表示ロジックを修正
```typescript
// 修正前
<div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
  <p className="text-sm text-yellow-800">
    ⚠️ 薬剤師免許証と保険薬剤師登録票をアップロードしてください。
    運営が確認後、求人への応募が可能になります。
  </p>
</div>

// 修正後
{(() => {
  // 両方の証明書（薬剤師免許証と保険薬剤師登録票）が承認済みかチェック
  const licenseCert = certificates.find(c => c.certificateType === 'license');
  const registrationCert = certificates.find(c => c.certificateType === 'registration');
  const hasVerifiedLicense = licenseCert?.verificationStatus === 'verified';
  const hasVerifiedRegistration = registrationCert?.verificationStatus === 'verified';
  const hasBothVerified = hasVerifiedLicense && hasVerifiedRegistration;

  // 両方の証明書が承認済みの場合は警告を非表示
  if (hasBothVerified) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-800">
        ⚠️ 薬剤師免許証と保険薬剤師登録票をアップロードしてください。
        運営が確認後、求人への応募が可能になります。
      </p>
    </div>
  );
})()}
```

## 🚀 デプロイ手順

### 1. ローカルでのコミット・プッシュ

```bash
# 変更をステージング
git add "frontend/app/pharmacist/jobs/[id]/page.tsx" "frontend/app/pharmacist/profile/page.tsx"

# コミット
git commit -m "fix: 資格証明書の承認済み判定ロジックを修正（両方の証明書が承認済みの場合のみアラート非表示）"

# プッシュ
git push origin main
```

### 2. サーバーでのデプロイ

```bash
# SSH接続（SSH鍵を使用）
ssh -i ssh_yakunavi.pem root@85.131.247.170

# デプロイコマンド（一括実行）
cd ~/yaku_navi && \
git pull origin main && \
cd backend && npm install && npm run build && cd .. && \
cd frontend && npm install && npm run build && cd .. && \
pm2 restart yaku-navi-backend && pm2 restart yaku-navi-frontend && \
pm2 status
```

### 3. デプロイ確認

```bash
# PM2ステータス確認
pm2 status

# ヘルスチェック
curl http://localhost:5001/health

# ログ確認
pm2 logs yaku-navi-backend --lines 20
pm2 logs yaku-navi-frontend --lines 20
```

## ✅ 確認事項

デプロイ後、以下を確認してください：

1. **プロフィール管理画面** (`/pharmacist/profile`)
   - ✅ 薬剤師免許証と保険薬剤師登録票の両方が承認済みの場合、アラートが表示されない
   - ✅ 片方のみ承認済み、または未承認の場合、アラートが表示される

2. **求人詳細画面** (`/pharmacist/jobs/[id]`)
   - ✅ 薬剤師免許証と保険薬剤師登録票の両方が承認済みの場合、アラートが表示されない
   - ✅ 片方のみ承認済み、または未承認の場合、アラートが表示される

3. **エラー確認**
   - ✅ `pharmacistId`が`undefined`になるエラーが発生しない
   - ✅ ブラウザのコンソールにエラーが表示されない

## 📝 技術的な詳細

### 証明書の承認ステータス

証明書には以下のステータスがあります：
- `pending`: 未確認（管理者による確認待ち）
- `verified`: 承認済み（管理者による承認完了）
- `rejected`: 差し戻し（管理者による差し戻し）

### 判定ロジック

アラートを非表示にする条件：
```typescript
const hasVerifiedCertificate = 
  hasVerifiedLicense && hasVerifiedRegistration;
```

- `hasVerifiedLicense`: 薬剤師免許証が`verified`である
- `hasVerifiedRegistration`: 保険薬剤師登録票が`verified`である
- **両方**が`true`の場合のみ、アラートを非表示にする

## 🎯 結果

- ✅ `pharmacistId`が`undefined`になる問題を解決
- ✅ アラート表示ロジックを正しく修正（両方の証明書が承認済みの場合のみ非表示）
- ✅ プロフィール管理画面と求人詳細画面の両方で正常に動作
- ✅ デプロイ完了、本番環境で正常に動作確認済み

## 📅 修正日時

- **修正日**: 2026年2月13日
- **コミット**: `2ee79d0`
- **デプロイ日**: 2026年2月13日

