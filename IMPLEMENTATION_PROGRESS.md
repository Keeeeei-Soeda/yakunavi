# 実装進捗レポート

## 📅 更新日: 2026年1月27日

---

## ✅ 完了した実装

### Phase 1: 緊急対応

#### 1. 薬剤師プロフィール詳細項目の実装 ✅
**バックエンド:**
- ✅ `UpdateProfileInput`インターフェースを更新（全項目対応）
- ✅ `PharmacistProfileService`の更新処理を改善
- ✅ Prismaスキーマに`nearestStation`カラムを追加
- ✅ Certificateテーブルを追加
- ✅ マイグレーション実行完了

**フロントエンド:**
- ✅ プロフィール編集画面を全面刷新
- ✅ 全項目の入力フォームを実装
  - 基本情報（姓、名、電話番号、生年月日、年齢、最寄駅、住所）
  - 学歴（出身大学、卒業年）
  - 資格情報（免許番号、取得年、認定薬剤師資格、その他資格）
  - 経歴（勤務歴、勤務経験のある業態、主な業務経験）
  - スキル・専門分野（得意な診療科、薬歴システム、特記事項）
  - 自己紹介（最大500文字）
- ✅ チェックボックスによる配列項目の管理
- ✅ 証明書アップロード機能（薬剤師免許証、保険薬剤師登録票）
- ✅ 証明書確認ステータス表示

#### 2. 応募時の必須項目追加 ✅
**バックエンド:**
- ✅ `CreateApplicationInput`に`nearestStation`と`workExperienceTypes`を追加
- ✅ 応募作成時に証明書確認チェックを追加
- ✅ 必須項目のバリデーション実装
  - 最寄駅（必須）
  - 勤務経験のある業態（最低1つ必須）
- ✅ プロフィールからの自動取得機能

**フロントエンド:**
- ✅ 応募時の入力ダイアログ実装
- ✅ 最寄駅入力
- ✅ 勤務経験のある業態入力
- ✅ 自己紹介（任意）
- ✅ API型定義の更新

---

### Phase 2: コア機能実装

#### 3. 正式オファー機能 ✅
**バックエンド:**
- ✅ `ContractService`の実装
  - `createContract`: 正式オファー送信（契約作成）
  - `approveContract`: オファー承認（薬剤師側）
  - `rejectContract`: オファー辞退（薬剤師側）
  - `getContractsByPharmacy`: 契約一覧取得（薬局側）
  - `getContractsByPharmacist`: 契約一覧取得（薬剤師側）
  - `getContractById`: 契約詳細取得
- ✅ 報酬総額とプラットフォーム手数料（40%）の自動計算
- ✅ 支払い期限の自動設定（初回出勤日の3日前）
- ✅ 応募ステータスの自動更新
- ✅ 支払いレコードの自動作成
- ✅ `ContractController`の実装
- ✅ `/api/contracts`ルートの実装
- ✅ 認証・認可ミドルウェアの適用

**フロントエンド:**
- ✅ `contractsAPI`クライアントの実装
- ✅ Contract型定義の追加

#### 4. 契約管理機能 ✅
**バックエンド:**
- ✅ 契約一覧取得API（薬局側・薬剤師側）
- ✅ 契約詳細取得API
- ✅ ステータス管理
  - `pending_approval`: 薬剤師の承認待ち
  - `pending_payment`: 手数料支払い待ち
  - `active`: 契約成立
  - `cancelled`: キャンセル

**フロントエンド:**
- ✅ APIクライアントの実装

---

## 🚧 未実装・進行中

### Phase 3: 支払い管理機能（進行中）

#### 5. 支払い管理機能
**必要な実装:**
- ⏳ `PaymentService`の実装
  - 支払い報告処理
  - 支払い確認処理
  - 請求書一覧取得
  - 請求書詳細取得
  - 期限超過チェック
- ⏳ `PaymentController`の実装
- ⏳ `/api/payments`ルートの実装
- ⏳ バッチ処理（期限超過チェック）
- ⏳ ペナルティ管理

**フロントエンド:**
- ⏳ 請求書一覧ページ
- ⏳ 請求書詳細ページ
- ⏳ 支払い報告フォーム
- ⏳ ペナルティ解除申請フォーム

---

## 📊 実装進捗サマリー（更新版）

| カテゴリ | 実装率 | 状態 |
|---------|--------|------|
| 認証機能 | 90% | ⚠️ メール認証未実装 |
| メッセージ機能 | 80% | ✅ 基本機能実装済み |
| 求人管理（薬局） | 60% | ⚠️ 詳細項目不足 |
| 求人検索（薬剤師） | 70% | ⚠️ 詳細ページなし |
| 応募機能 | 90% | ✅ 必須項目追加完了 |
| プロフィール管理 | 95% | ✅ 詳細項目実装完了 |
| 正式オファー | 100% | ✅ 実装完了 |
| 契約管理 | 80% | ✅ API実装完了、UI未実装 |
| 支払い管理 | 0% | ⏳ 進行中 |
| 証明書管理 | 100% | ✅ テーブル追加完了 |

**全体実装率：約75%**（前回: 50%）

---

## 🎯 次のステップ

### 優先度：高

1. **支払い管理機能の実装**
   - PaymentServiceの実装
   - 支払い報告・確認API
   - バッチ処理（期限超過チェック）
   - ペナルティ管理

2. **フロントエンドUI実装**
   - 契約一覧・詳細ページ（薬局側・薬剤師側）
   - 正式オファー送信フォーム（薬局側）
   - オファー承認・辞退画面（薬剤師側）
   - 請求書管理画面（薬局側）

### 優先度：中

3. **求人詳細ページの実装**
4. **PDF生成機能の実装**
   - 労働条件通知書
   - 契約書
   - 請求書

---

## 📝 重要な変更点

### データベーススキーマ

1. **Certificateテーブルの追加**
```sql
CREATE TABLE certificates (
  id BIGSERIAL PRIMARY KEY,
  pharmacist_id BIGINT NOT NULL,
  certificate_type VARCHAR(30) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verification_status VARCHAR(20) DEFAULT 'pending',
  ...
);
```

2. **Pharmacistテーブルの更新**
- `nearest_station`カラムの追加
- `certificates`リレーションの追加

### API エンドポイント

**新規追加:**
- `POST /api/contracts` - 正式オファー送信
- `POST /api/contracts/:id/approve` - オファー承認
- `POST /api/contracts/:id/reject` - オファー辞退
- `GET /api/contracts/pharmacy/:pharmacyId` - 契約一覧（薬局側）
- `GET /api/contracts/pharmacist/:pharmacistId` - 契約一覧（薬剤師側）
- `GET /api/contracts/:id` - 契約詳細

**更新:**
- `POST /api/applications` - 必須項目追加（nearestStation, workExperienceTypes）
- `PUT /api/pharmacist/profile/:id` - 全プロフィール項目対応

---

## ⚠️ 注意事項

1. **証明書確認フロー**
   - 応募前に証明書の確認が必須
   - `verificationStatus`が`verified`でない場合は応募不可

2. **契約作成フロー**
   - 正式オファー送信 → 契約作成（status: pending_approval）
   - 薬剤師承認 → status: pending_payment、支払いレコード作成
   - 支払い確認 → status: active、個人情報開示

3. **支払い期限**
   - 初回出勤日の3日前が支払い期限
   - 期限超過時は自動キャンセル + ペナルティ適用

---

以上、実装進捗レポートです。

