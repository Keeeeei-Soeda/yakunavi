# 薬局管理システム：全体フロー図・データフロー図

## 1. 全体フロー（エンドツーエンド）

```
【薬局側】                     【システム】                   【薬剤師側】

1. アカウント作成
├─ 基本情報入力                  users テーブル               
├─ メール認証            ────→   pharmacies テーブル          
└─ ログイン可能                                              

                                                            2. アカウント作成
                                                            ├─ 基本情報入力
                                                            ├─ メール認証
                                                            └─ ログイン可能

                                                            3. 資格証明書アップロード
                                                            ├─ 薬剤師免許証PDF
                                                            ├─ 保険薬剤師登録票PDF
                                                            └─ 運営確認待ち
                                                                    │
                                                                    ↓
                                                            【運営による確認】
                                                            ├─ 証明書の真正性確認
                                                            └─ 承認/差し戻し
                                                                    │
                                                                    ↓
                                                            ✅ 応募可能に

4. 求人投稿
├─ 求人情報入力
│  ├─ タイトル
│  ├─ 詳細
│  ├─ 勤務地
│  ├─ 日給（20,000円以上）
│  ├─ 勤務日数（15〜90日）
│  ├─ 勤務開始可能期間
│  └─ 募集期限
├─ 確認画面                     job_postings テーブル         5. 求人検索
└─ 公開                         status: 'active'       ────→  ├─ 地域・条件で検索
                                                            ├─ 求人詳細確認
                                                            │  ├─ 日給確認
                                                            │  ├─ 勤務日数確認
                                                            │  └─ 薬局情報確認
                                                            └─ 応募

                                                            6. 応募
                                                            ├─ 最寄駅入力 *
                                                            ├─ 勤務経験選択 *
                                                            ├─ 自己紹介（任意）
                                                            └─ 応募完了
                                                                    │
                                                                    ↓
                                applications テーブル
                                status: 'pending'
                                    │
                                    ↓
7. 応募確認                    ←─────────────────────────  通知：応募完了
├─ 応募者一覧確認
├─ プロフィール閲覧
│  └─ 個人情報は非表示
└─ オファー判断

8. 初回出勤日候補提示
├─ 候補日3つ選択                 messages テーブル            9. 候補日から選択
│  └─ 2週間後以降の日付          message_type:        ────→  ├─ 1つの候補日を選択
└─ 送信                         'initial_date_proposal'      └─ 送信
                                        │
                                        ↓
                                messages テーブル
                                message_type:
                                'initial_date_selection'
                                        │
                                        ↓
10. 正式オファー送信         ←─────────────────────────  通知：初回出勤日選択完了
├─ 契約内容確認
│  ├─ 初回出勤日
│  ├─ 勤務日数
│  ├─ 日給
│  ├─ 報酬総額
│  └─ 手数料（40%）
├─ 重要事項表示                  messages テーブル            11. オファー確認
└─ 送信                         message_type:        ────→  ├─ 契約内容確認
                                'formal_offer'               ├─ 承認/辞退選択
                                        │                    └─ 承認
                                        ↓                            │
                                applications テーブル                  ↓
                                status: 'offered'            messages テーブル
                                        │                    message_type:
                                        ↓                    'offer_response'
                                contracts テーブル                      │
                                status: 'pending_approval'              ↓
                                        │
                                        ↓
12. 契約成立                ←─────────────────────────  通知：オファー承認
├─ 労働条件通知書自動発行        contracts テーブル           ├─ 労働条件通知書DL可能
│  └─ PDF生成                   status: 'pending_payment'    └─ 薬局の手数料支払い待ち
├─ 請求書自動発行                     │
│  ├─ PDF生成                         ↓
│  ├─ メール送信              documents テーブル
│  └─ システム通知            ├─ 労働条件通知書
├─ メッセージクローズ         ├─ 請求書
└─ 手数料支払い待ち           └─ type: 'labor_conditions', 'invoice'
                                    │
                                    ↓
                             payments テーブル
                             status: 'pending'

13. 手数料支払い
├─ 請求書DL
├─ 振込
├─ 支払い報告                   payments テーブル
│  ├─ 振込日入力               status: 'reported'
│  └─ 振込名義人入力                  │
└─ 運営確認待ち                      ↓
                                    
                            【運営による確認】
                            ├─ 入金確認
                            └─ 承認
                                    │
                                    ↓
                             payments テーブル
                             status: 'confirmed'
                                    │
                                    ↓
                             contracts テーブル
                             status: 'active'
                                    │
                                    ↓
14. 個人情報開示         ←─────────────────────────  通知：手数料支払い確認
├─ 薬剤師の連絡先表示                                       ├─ 薬局の連絡先表示
│  ├─ 氏名                                                  │  ├─ 薬局名
│  ├─ 電話番号                                              │  ├─ 住所
│  └─ メールアドレス                                        │  ├─ 電話番号
└─ 直接連絡可能                                            │  └─ 担当者名
                                                            └─ 直接連絡可能

15. 勤務スケジュール調整（直接連絡）
├─ 電話・メールで調整                                       ├─ 電話・メールで調整
├─ 勤務曜日決定                                            ├─ 勤務曜日決定
├─ 勤務時間決定                                            ├─ 勤務時間決定
└─ 初回出勤日確定                                          └─ 初回出勤日確定

16. 初回出勤日
├─ 勤務開始                                                ├─ 勤務開始
└─ 体験期間開始（15〜90日）                                └─ 体験期間開始

17. 体験期間終了
├─ 報酬支払い（直接）                                       ├─ 報酬受取
│  └─ 金額：日給 × 実勤務日数                              └─ 体験期間終了
├─ 正式雇用判断
└─ システム上での管理終了
```

---

## 2. ステータス遷移図

### 2.1 求人ステータス (job_postings.status)

```
下書き (draft)
    │
    │ 薬局が「公開」ボタンクリック
    ↓
募集中 (active)
    │
    ├─→ 募集期限到達 → 募集終了 (closed)
    │
    ├─→ 薬剤師決定（契約成立） → 契約成立 (completed)
    │
    └─→ 薬局が「募集停止」 → キャンセル (cancelled)
```

### 2.2 応募ステータス (applications.status)

```
未読済 (pending)
    │
    │ 薬局が確認
    ↓
検討中 (reviewing)
    │
    ├─→ 薬局がオファー送信 → オファー送信済 (offered)
    │                           │
    │                           ├─→ 薬剤師が承認 → 承認 (accepted)
    │                           │                    │
    │                           │                    └─→ 契約成立へ
    │                           │
    │                           └─→ 薬剤師が辞退 → 薬剤師辞退 (pharmacist_rejected)
    │
    └─→ 薬局が辞退 → 薬局辞退 (rejected)
```

### 2.3 契約ステータス (contracts.status)

```
承認待ち (pending_approval)
    │
    │ 薬剤師がオファー承認
    ↓
手数料支払い待ち (pending_payment)
    │
    ├─→ 手数料支払い完了 → 契約成立 (active)
    │                         │
    │                         │ 初回出勤日到達
    │                         ↓
    │                      勤務中 (active)
    │                         │
    │                         │ 体験期間終了
    │                         ↓
    │                      契約終了 (completed)
    │
    └─→ 支払期限超過 → キャンセル (cancelled)
                         └─→ ペナルティ適用
```

### 2.4 支払いステータス (payments.status)

```
未払い (pending)
    │
    │ 薬局が支払い報告
    ↓
支払い報告済み (reported)
    │
    │ 運営が入金確認
    ├─→ 確認完了 → 確認済み (confirmed)
    │                 └─→ 契約ステータスを 'active' に更新
    │
    └─→ 確認失敗 → 失敗 (failed)
                    └─→ 薬局に再報告依頼
```

### 2.5 ペナルティステータス (penalties.status)

```
有効 (active)
    │
    ├─→ 手数料支払い + 解除申請 → 解決済み (resolved)
    │                              └─→ アカウント制限解除
    │
    └─→ 薬局が異議申し立て → 異議申し立て中 (appealed)
                                └─→ 運営が審査
```

---

## 3. データベースリレーション図

```
users (ユーザー認証)
  ├─ 1:1 → pharmacies (薬局情報)
  │          │
  │          ├─ 1:N → job_postings (求人投稿)
  │          │          │
  │          │          └─ 1:N → applications (応募)
  │          │                     │
  │          │                     ├─ 1:N → messages (メッセージ)
  │          │                     │
  │          │                     └─ 1:1 → contracts (契約)
  │          │                                │
  │          │                                ├─ 1:1 → payments (支払い)
  │          │                                │
  │          │                                └─ 1:N → documents (書類)
  │          │
  │          └─ 1:N → penalties (ペナルティ)
  │
  └─ 1:1 → pharmacists (薬剤師情報)
             │
             └─ 1:N → applications (応募)
                        │
                        └─ ... (上記と同じ)

notifications (通知)
  └─ N:1 → users

audit_logs (監査ログ)
  └─ N:1 → users
```

---

## 4. データフロー（テーブル間の連携）

### 4.1 応募〜契約成立フロー

```sql
-- 1. 薬剤師が応募
INSERT INTO applications (job_posting_id, pharmacist_id, status)
VALUES (求人ID, 薬剤師ID, 'pending');

-- 2. 薬局がオファー送信（メッセージ）
INSERT INTO messages (application_id, sender_type, message_type, structured_data)
VALUES (応募ID, 'pharmacy', 'formal_offer', {...});

UPDATE applications SET status = 'offered' WHERE id = 応募ID;

-- 3. 薬剤師がオファー承認（メッセージ）
INSERT INTO messages (application_id, sender_type, message_type, structured_data)
VALUES (応募ID, 'pharmacist', 'offer_response', {...});

UPDATE applications SET status = 'accepted' WHERE id = 応募ID;

-- 4. 契約レコード作成
INSERT INTO contracts (
  application_id, pharmacy_id, pharmacist_id, job_posting_id,
  initial_work_date, work_days, daily_wage, total_compensation,
  platform_fee, status
)
VALUES (..., 'pending_payment');

-- 5. 労働条件通知書・請求書生成
INSERT INTO documents (contract_id, document_type, file_path)
VALUES (契約ID, 'labor_conditions', '/path/to/pdf');

INSERT INTO documents (contract_id, document_type, file_path)
VALUES (契約ID, 'invoice', '/path/to/pdf');

-- 6. 支払いレコード作成
INSERT INTO payments (contract_id, pharmacy_id, amount, status)
VALUES (契約ID, 薬局ID, 手数料, 'pending');
```

### 4.2 支払い確認〜個人情報開示フロー

```sql
-- 1. 薬局が支払い報告
UPDATE payments
SET status = 'reported', payment_date = ?, transfer_name = ?, reported_at = NOW()
WHERE id = 支払いID;

-- 2. 運営が入金確認
UPDATE payments
SET status = 'confirmed', confirmed_at = NOW()
WHERE id = 支払いID;

-- 3. 契約ステータス更新
UPDATE contracts
SET status = 'active', payment_confirmed_at = NOW()
WHERE id = 契約ID;

-- 4. 個人情報開示（アプリケーション層で制御）
-- payments.status = 'confirmed' の場合のみ、
-- pharmacists.last_name, first_name, phone_number, email を表示
```

### 4.3 支払い期限超過〜ペナルティ適用フロー

```sql
-- 1. 日次バッチで期限超過契約を自動キャンセル
UPDATE contracts
SET status = 'cancelled', cancelled_at = NOW(),
    cancellation_reason = '手数料未払いによる自動キャンセル'
WHERE status = 'pending_payment'
  AND payment_deadline < CURRENT_DATE;

-- 2. ペナルティレコード作成
INSERT INTO penalties (pharmacy_id, contract_id, penalty_type, reason)
SELECT pharmacy_id, id, 'account_suspension', '手数料未払いによる契約キャンセル'
FROM contracts
WHERE status = 'cancelled'
  AND cancelled_at::DATE = CURRENT_DATE
  AND cancellation_reason = '手数料未払いによる自動キャンセル';

-- 3. 薬局アカウント停止
UPDATE users
SET is_active = FALSE
WHERE id IN (
  SELECT ph.user_id
  FROM pharmacies ph
  INNER JOIN penalties p ON ph.id = p.pharmacy_id
  WHERE p.penalty_status = 'active'
);
```

---

## 5. 重要なビジネスルール（データ整合性）

### 5.1 制約・バリデーション

```sql
-- 求人投稿
- desired_work_days: 15〜90日
- daily_wage: 20,000円以上
- work_start_period_from: 今日 + 14日以降
- recruitment_deadline: 今日 + 3日〜14日

-- 契約
- payment_deadline: initial_work_date - 3日
- contract_end_date: initial_work_date + work_days

-- 支払い
- amount: contracts.platform_fee と一致
- payment_date: contract.payment_deadline 以前
```

### 5.2 トランザクション境界

**契約成立時（重要なトランザクション）**
```sql
BEGIN TRANSACTION;

-- 1. 契約作成
INSERT INTO contracts (...) VALUES (...);

-- 2. 労働条件通知書生成
INSERT INTO documents (...) VALUES (...);

-- 3. 請求書生成
INSERT INTO documents (...) VALUES (...);

-- 4. 支払いレコード作成
INSERT INTO payments (...) VALUES (...);

-- 5. 応募ステータス更新
UPDATE applications SET status = 'accepted' WHERE id = ?;

-- 6. 求人ステータス更新
UPDATE job_postings SET status = 'completed' WHERE id = ?;

COMMIT;
```

**支払い確認時**
```sql
BEGIN TRANSACTION;

-- 1. 支払いステータス更新
UPDATE payments SET status = 'confirmed', confirmed_at = NOW() WHERE id = ?;

-- 2. 契約ステータス更新
UPDATE contracts SET status = 'active', payment_confirmed_at = NOW() WHERE contract_id = ?;

COMMIT;
```

---

## 6. メール送信タイミング一覧

| タイミング | 送信先 | 件名 | 内容 |
|-----------|--------|------|------|
| アカウント作成 | 薬局/薬剤師 | アカウント作成確認 | メール認証リンク |
| 求人公開 | 薬局 | 求人公開完了 | 求人詳細、URL |
| 応募受付 | 薬局 | 新規応募がありました | 応募者情報（一部）、詳細URL |
| 応募完了 | 薬剤師 | 応募完了 | 応募内容確認 |
| オファー送信 | 薬剤師 | 正式オファーが届きました | オファー内容、承認URL |
| オファー承認 | 薬局 | オファーが承認されました | 契約内容、次のステップ |
| 契約成立 | 薬局 | 契約成立・請求書発行 | 請求書PDF、支払い方法、期限 |
| 契約成立 | 薬剤師 | 契約成立 | 契約内容、労働条件通知書 |
| 支払い期限3日前 | 薬局 | 【重要】支払い期限が近づいています | 期限、金額、振込先 |
| 支払い期限当日 | 薬局 | 【緊急】本日が支払い期限です | 期限、キャンセル警告 |
| 支払い確認 | 薬局 | 支払いを確認しました | 確認完了、連絡先開示 |
| 支払い確認 | 薬剤師 | 薬局の支払いが確認されました | 薬局連絡先開示 |
| 契約キャンセル | 薬局 | 【重要】契約がキャンセルされました | キャンセル理由、ペナルティ |
| 契約キャンセル | 薬剤師 | 契約がキャンセルされました | お詫び、理由説明 |
| ペナルティ適用 | 薬局 | アカウントが制限されました | ペナルティ内容、解除方法 |

---

## 7. 通知タイミング一覧

| タイミング | 通知先 | 通知内容 | リンク先 |
|-----------|--------|---------|---------|
| 新規応募 | 薬局 | 新しい応募がありました | 応募者詳細 |
| メッセージ受信 | 薬局/薬剤師 | ◯◯からメッセージが届きました | メッセージ画面 |
| 初回出勤日候補提示 | 薬剤師 | 初回出勤日の候補が提示されました | メッセージ画面 |
| 初回出勤日選択 | 薬局 | 薬剤師が初回出勤日を選択しました | メッセージ画面 |
| 正式オファー | 薬剤師 | 正式オファーが届きました | オファー詳細 |
| オファー承認 | 薬局 | オファーが承認されました | 契約詳細 |
| 契約成立 | 薬局/薬剤師 | 契約が成立しました | 契約詳細 |
| 支払い期限3日前 | 薬局 | 支払い期限が近づいています | 請求書詳細 |
| 支払い期限当日 | 薬局 | 本日が支払い期限です | 請求書詳細 |
| 支払い確認 | 薬局/薬剤師 | 支払いが確認されました | 契約詳細 |
| 契約キャンセル | 薬局/薬剤師 | 契約がキャンセルされました | 契約詳細 |

---

## 8. 足りている/足りていない内容チェックリスト

### ✅ 完成している設計

- [x] 薬局側機能設計
- [x] 薬剤師側機能設計
- [x] データベース設計
- [x] 全体フロー図
- [x] ステータス遷移図
- [x] データフロー図
- [x] メール送信タイミング
- [x] 通知タイミング

### ❌ 足りない設計

#### 🔴 優先度：高（実装に必須）

1. **管理者画面の設計**
   - ユーザー管理（薬局・薬剤師）
   - 請求書・支払い管理
   - 契約管理
   - 資格証明書確認・承認
   - ペナルティ管理
   - システム設定

2. **API設計書**
   - RESTful APIエンドポイント一覧
   - リクエスト/レスポンス形式
   - 認証・認可（JWT等）
   - エラーハンドリング

#### 🟡 優先度：中（実装時に必要）

3. **メールテンプレート**
   - 各メールの具体的な文面
   - HTMLメール形式

4. **PDF生成仕様**
   - 労働条件通知書のフォーマット
   - 請求書のフォーマット
   - 契約書のフォーマット

5. **ファイルアップロード仕様**
   - アップロード制限
   - ファイル検証
   - ストレージ戦略

#### 🟢 優先度：低（あると良い）

6. **認証・認可設計**
   - JWT実装詳細
   - セッション管理
   - パスワードリセットフロー

7. **エラーハンドリング設計**
   - エラーコード一覧
   - エラーメッセージ
   - ユーザー向けエラー表示

8. **テストケース設計**
   - 単体テスト
   - 結合テスト
   - E2Eテスト

---

## 9. 次のステップ推奨

### 即座に必要な設計（実装前）

1. **管理者画面の設計** ← 最優先
   - 資格証明書の確認・承認機能は必須
   - 支払い確認機能も必須

2. **API設計書**
   - フロントエンドとバックエンドの接続仕様

### 実装と並行して作成できる設計

3. **メールテンプレート**
4. **PDF生成仕様**
5. **ファイルアップロード仕様**

---

Keiさん、次は**管理者画面の設計**を作成しましょうか？
それとも**API設計書**を先に作成しますか？