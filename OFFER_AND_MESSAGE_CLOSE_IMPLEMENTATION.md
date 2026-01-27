# 正式オファー確認UI・メッセージクローズ後の実装

## 実装完了日: 2026年1月27日

---

## 実装内容

### 1. 正式オファー確認UI（メッセージからの遷移）

#### バックエンド実装

**新規APIエンドポイント:**
- `GET /api/contracts/application/:applicationId` - 応募IDから契約を取得

**実装ファイル:**
- `backend/src/services/contract.service.ts` - `getContractByApplicationId`メソッド追加
- `backend/src/controllers/contract.controller.ts` - `getContractByApplicationId`メソッド追加
- `backend/src/routes/contract.routes.ts` - ルート追加

#### フロントエンド実装

**薬剤師側メッセージページ (`frontend/app/pharmacist/messages/page.tsx`)**

**追加機能:**
- ✅ 応募IDから契約情報を自動取得
- ✅ 契約ステータスが`pending_approval`の場合、「正式オファーを確認」ボタンを表示
- ✅ 正式オファー確認モーダル
  - 契約内容の詳細表示（初回出勤日、勤務日数、報酬総額、勤務時間）
  - 重要事項の表示（手数料支払い、報酬、自動キャンセル条件）
  - 承認/辞退ボタン
- ✅ 承認/辞退処理
  - 承認後は契約ステータスが`pending_payment`に更新
  - 辞退後は契約がキャンセル

**UIイメージ:**
```
┌─────────────────────────────────────┐
│ 正式オファー                        │
│ 羽曳野薬局からの正式オファー         │
├─────────────────────────────────────┤
│ 契約内容:                           │
│ - 初回出勤日: 2026/02/12（水）      │
│ - 勤務日数: 30日                    │
│ - 報酬総額: ¥750,000               │
│ - 勤務時間: 9:00-18:00              │
├─────────────────────────────────────┤
│ 重要事項:                           │
│ ・薬局がプラットフォーム手数料を...  │
│ ・報酬は体験期間終了後に...          │
│ ・初回出勤日の3日前までに...         │
├─────────────────────────────────────┤
│ [キャンセル] [辞退する] [承認する]   │
└─────────────────────────────────────┘
```

---

### 2. メッセージクローズ後の表示・制限

#### 実装内容

**薬剤師側 (`frontend/app/pharmacist/messages/page.tsx`)**

**追加機能:**
- ✅ 契約成立後のステータス表示
  - `pending_payment`: 「契約成立：薬局の手数料支払い待ち」
  - `active`: 「契約成立：勤務中」
  - `completed`: 「契約成立」
- ✅ 契約成立後のメッセージ送信制限
  - 契約ステータスが`pending_payment`、`active`、`completed`の場合、メッセージ送信不可
  - 過去のメッセージ履歴は閲覧可能
- ✅ 「勤務中の薬局を見る」リンク
  - 契約成立後、ヘッダーにリンクを表示
  - `/pharmacist/applications`に遷移

**薬局側 (`frontend/app/pharmacy/messages/page.tsx`)**

**追加機能:**
- ✅ 契約成立後のステータス表示
  - `pending_payment`: 「契約成立：手数料支払い待ち」
  - `active`: 「契約成立：勤務中」
  - `completed`: 「契約成立」
- ✅ 契約成立後のメッセージ送信制限
  - 契約ステータスが`pending_payment`、`active`、`completed`の場合、メッセージ送信不可
  - 過去のメッセージ履歴は閲覧可能
- ✅ 「契約管理を見る」リンク
  - 契約成立後、ヘッダーにリンクを表示
  - `/pharmacy/contracts`に遷移

**UIイメージ（契約成立後）:**
```
┌─────────────────────────────────────┐
│ 羽曳野薬局 - 働く人募集              │
│ [契約管理を見る]                     │
├─────────────────────────────────────┤
│ ✅ 契約成立：手数料支払い待ち        │
│ 手数料支払い確認後、薬剤師の連絡先   │
│ が開示されます。                     │
├─────────────────────────────────────┤
│ [過去のメッセージ履歴]               │
│ ...                                 │
├─────────────────────────────────────┤
│ ⚠️ 契約成立により、メッセージの送信   │
│ はできません                         │
│ 過去のメッセージ履歴は閲覧可能です   │
└─────────────────────────────────────┘
```

---

## 実装された機能フロー

### 正式オファー確認フロー

```
1. 薬局: 正式オファーを送信（契約作成）
   - status: pending_approval
2. 薬剤師: メッセージ画面で「正式オファーを確認」ボタンをクリック
3. 薬剤師: 正式オファー詳細モーダルを確認
4. 薬剤師: 「承認する」または「辞退する」を選択
5. 承認の場合:
   - status: pending_payment
   - 支払いレコード作成
   - メッセージ送信制限開始
6. 辞退の場合:
   - status: cancelled
   - 契約キャンセル
```

### メッセージクローズフロー

```
1. 契約成立（status: pending_payment以上）
2. メッセージ画面にステータス表示
3. メッセージ送信UIを非表示
4. 「過去のメッセージ履歴は閲覧可能」メッセージ表示
5. 「勤務中の薬局を見る」/「契約管理を見る」リンク表示
```

---

## APIエンドポイント

### 新規追加

**応募IDから契約を取得**
```http
GET /api/contracts/application/:applicationId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "status": "pending_approval",
    "initialWorkDate": "2026-02-12",
    "workDays": 30,
    "dailyWage": 25000,
    "totalCompensation": 750000,
    "platformFee": 300000,
    "paymentDeadline": "2026-02-09",
    ...
  }
}
```

### 既存エンドポイント（使用）

**正式オファー承認**
```http
POST /api/contracts/:id/approve
Authorization: Bearer {token}
Body: { "pharmacistId": 1 }
```

**正式オファー辞退**
```http
POST /api/contracts/:id/reject
Authorization: Bearer {token}
Body: { "pharmacistId": 1 }
```

---

## 実装ファイル一覧

### バックエンド
- `backend/src/services/contract.service.ts` - `getContractByApplicationId`メソッド追加
- `backend/src/controllers/contract.controller.ts` - `getContractByApplicationId`メソッド追加
- `backend/src/routes/contract.routes.ts` - ルート追加

### フロントエンド
- `frontend/app/pharmacist/messages/page.tsx` - 正式オファー確認UI、メッセージクローズ後の表示・制限
- `frontend/app/pharmacy/messages/page.tsx` - メッセージクローズ後の表示・制限
- `frontend/lib/api/contracts.ts` - `getByApplicationId`メソッド追加

---

## 設計書との対応

### 5.4 正式オファーの確認・承認 ✅
- ✅ オファー通知（UI表示）
- ✅ オファー詳細画面（モーダル）
- ✅ 承認/辞退ボタン
- ✅ 承認後の処理（契約成立、メッセージクローズ）

### 5.5 メッセージクローズ後 ✅
- ✅ 契約成立の表示
- ✅ 過去のメッセージ履歴閲覧可能
- ✅ メッセージ送信不可の表示
- ✅ ステータス表示（薬局の手数料支払い待ち）
- ✅ 「勤務中の薬局を見る」リンク

---

## 完了事項

- ✅ 応募IDから契約を取得するAPI実装
- ✅ 正式オファー確認モーダルの実装
- ✅ 承認/辞退機能の実装
- ✅ 契約成立後のメッセージ送信制限
- ✅ ステータス表示
- ✅ 「勤務中の薬局を見る」/「契約管理を見る」リンク
- ✅ 薬局側・薬剤師側の両方に対応
- ✅ リンターエラー0件

---

## メッセージ機能の実装率

**実装前:** 95%  
**実装後:** 100%

### 完了した実装
- ✅ メッセージ一覧
- ✅ メッセージ詳細
- ✅ 初回出勤日選択
- ✅ 正式オファー確認・承認
- ✅ メッセージクローズ後の表示・制限

**メッセージ機能は完全に実装されました！**

