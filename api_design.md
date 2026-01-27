# 薬局管理システム：API設計書

## 1. 概要

### 1.1 API仕様
- **プロトコル**: HTTPS
- **形式**: RESTful API
- **データ形式**: JSON
- **認証**: JWT (JSON Web Token)
- **ベースURL**: `https://api.example.com/v1`
- **文字コード**: UTF-8

### 1.2 バージョニング
- URL パスにバージョンを含める: `/v1/...`
- 後方互換性のない変更時は新バージョンを作成

---

## 2. 認証・認可

### 2.1 JWT認証

#### トークンの取得
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "user_type": "pharmacy",
      "is_active": true
    }
  }
}
```

#### トークンのリフレッシュ
```http
POST /auth/refresh
Content-Type: application/json
Authorization: Bearer {refresh_token}

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 認証ヘッダー
```http
Authorization: Bearer {access_token}
```

### 2.2 権限レベル
- **pharmacy**: 薬局ユーザー
- **pharmacist**: 薬剤師ユーザー
- **admin**: 管理者ユーザー
- **super_admin**: スーパー管理者

---

## 3. エンドポイント一覧

### 3.1 認証関連

| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| POST | `/auth/register/pharmacy` | 薬局アカウント登録 | 公開 |
| POST | `/auth/register/pharmacist` | 薬剤師アカウント登録 | 公開 |
| POST | `/auth/login` | ログイン | 公開 |
| POST | `/auth/logout` | ログアウト | 認証済み |
| POST | `/auth/refresh` | トークンリフレッシュ | 認証済み |
| POST | `/auth/forgot-password` | パスワードリセット要求 | 公開 |
| POST | `/auth/reset-password` | パスワードリセット実行 | 公開 |
| GET | `/auth/verify-email/:token` | メール認証 | 公開 |

### 3.2 薬局側API

#### プロフィール管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/pharmacy/profile` | プロフィール取得 | pharmacy |
| PUT | `/pharmacy/profile` | プロフィール更新 | pharmacy |
| GET | `/pharmacy/dashboard` | ダッシュボード情報取得 | pharmacy |

#### 求人管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/pharmacy/job-postings` | 求人一覧取得 | pharmacy |
| POST | `/pharmacy/job-postings` | 求人投稿 | pharmacy |
| GET | `/pharmacy/job-postings/:id` | 求人詳細取得 | pharmacy |
| PUT | `/pharmacy/job-postings/:id` | 求人更新 | pharmacy |
| DELETE | `/pharmacy/job-postings/:id` | 求人削除 | pharmacy |
| POST | `/pharmacy/job-postings/:id/publish` | 求人公開 | pharmacy |
| POST | `/pharmacy/job-postings/:id/close` | 求人停止 | pharmacy |

#### 応募管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/pharmacy/applications` | 応募一覧取得 | pharmacy |
| GET | `/pharmacy/applications/:id` | 応募詳細取得 | pharmacy |
| PUT | `/pharmacy/applications/:id/status` | 応募ステータス更新 | pharmacy |
| GET | `/pharmacy/applications/:id/pharmacist` | 応募者プロフィール取得 | pharmacy |

#### メッセージ管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/pharmacy/messages` | メッセージ一覧取得 | pharmacy |
| GET | `/pharmacy/messages/:application_id` | メッセージ詳細取得 | pharmacy |
| POST | `/pharmacy/messages/:application_id` | メッセージ送信 | pharmacy |
| POST | `/pharmacy/messages/:application_id/propose-dates` | 初回出勤日候補提示 | pharmacy |
| POST | `/pharmacy/messages/:application_id/formal-offer` | 正式オファー送信 | pharmacy |

#### 契約管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/pharmacy/contracts` | 契約一覧取得 | pharmacy |
| GET | `/pharmacy/contracts/:id` | 契約詳細取得 | pharmacy |
| POST | `/pharmacy/contracts/:id/cancel` | 契約キャンセル | pharmacy |

#### 請求書・支払い管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/pharmacy/invoices` | 請求書一覧取得 | pharmacy |
| GET | `/pharmacy/invoices/:id` | 請求書詳細取得 | pharmacy |
| GET | `/pharmacy/invoices/:id/download` | 請求書PDFダウンロード | pharmacy |
| POST | `/pharmacy/payments/:id/report` | 支払い報告 | pharmacy |
| GET | `/pharmacy/payments` | 支払い一覧取得 | pharmacy |
| GET | `/pharmacy/payments/:id` | 支払い詳細取得 | pharmacy |

#### 書類管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/pharmacy/documents/:contract_id` | 契約書類一覧取得 | pharmacy |
| GET | `/pharmacy/documents/:id/download` | 書類ダウンロード | pharmacy |

### 3.3 薬剤師側API

#### プロフィール管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/pharmacist/profile` | プロフィール取得 | pharmacist |
| PUT | `/pharmacist/profile` | プロフィール更新 | pharmacist |
| POST | `/pharmacist/profile/license` | 薬剤師免許証アップロード | pharmacist |
| POST | `/pharmacist/profile/registration` | 保険薬剤師登録票アップロード | pharmacist |
| GET | `/pharmacist/profile/verification-status` | 証明書確認ステータス取得 | pharmacist |
| GET | `/pharmacist/dashboard` | ダッシュボード情報取得 | pharmacist |

#### 求人検索・応募
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/pharmacist/job-postings` | 求人一覧取得（検索） | pharmacist |
| GET | `/pharmacist/job-postings/:id` | 求人詳細取得 | pharmacist |
| POST | `/pharmacist/job-postings/:id/apply` | 求人に応募 | pharmacist |
| GET | `/pharmacist/applications` | 自分の応募一覧取得 | pharmacist |
| GET | `/pharmacist/applications/:id` | 応募詳細取得 | pharmacist |

#### メッセージ管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/pharmacist/messages` | メッセージ一覧取得 | pharmacist |
| GET | `/pharmacist/messages/:application_id` | メッセージ詳細取得 | pharmacist |
| POST | `/pharmacist/messages/:application_id` | メッセージ送信 | pharmacist |
| POST | `/pharmacist/messages/:application_id/select-date` | 初回出勤日選択 | pharmacist |
| POST | `/pharmacist/messages/:application_id/respond-offer` | オファーに回答 | pharmacist |

#### 契約管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/pharmacist/contracts` | 契約一覧取得 | pharmacist |
| GET | `/pharmacist/contracts/:id` | 契約詳細取得 | pharmacist |

#### 書類管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/pharmacist/documents/:contract_id` | 契約書類一覧取得 | pharmacist |
| GET | `/pharmacist/documents/:id/download` | 書類ダウンロード | pharmacist |

### 3.4 管理者側API

#### ダッシュボード
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/admin/dashboard` | ダッシュボード情報取得 | admin |
| GET | `/admin/statistics` | 統計情報取得 | admin |

#### ユーザー管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/admin/pharmacies` | 薬局一覧取得 | admin |
| GET | `/admin/pharmacies/:id` | 薬局詳細取得 | admin |
| PUT | `/admin/pharmacies/:id` | 薬局情報更新 | admin |
| POST | `/admin/pharmacies/:id/suspend` | 薬局アカウント停止 | admin |
| POST | `/admin/pharmacies/:id/activate` | 薬局アカウント有効化 | admin |
| GET | `/admin/pharmacists` | 薬剤師一覧取得 | admin |
| GET | `/admin/pharmacists/:id` | 薬剤師詳細取得 | admin |
| PUT | `/admin/pharmacists/:id` | 薬剤師情報更新 | admin |
| POST | `/admin/pharmacists/:id/suspend` | 薬剤師アカウント停止 | admin |
| POST | `/admin/pharmacists/:id/activate` | 薬剤師アカウント有効化 | admin |

#### 資格証明書管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/admin/certifications` | 証明書一覧取得 | admin |
| GET | `/admin/certifications/:id` | 証明書詳細取得 | admin |
| GET | `/admin/certifications/:id/view` | 証明書PDF表示 | admin |
| POST | `/admin/certifications/:id/approve` | 証明書承認 | admin |
| POST | `/admin/certifications/:id/reject` | 証明書差し戻し | admin |

#### 支払い管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/admin/payments` | 支払い一覧取得 | admin |
| GET | `/admin/payments/:id` | 支払い詳細取得 | admin |
| POST | `/admin/payments/:id/confirm` | 支払い確認 | admin |
| POST | `/admin/payments/:id/reject` | 支払い却下 | admin |

#### 契約管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/admin/contracts` | 契約一覧取得 | admin |
| GET | `/admin/contracts/:id` | 契約詳細取得 | admin |
| POST | `/admin/contracts/:id/cancel` | 契約キャンセル | admin |

#### ペナルティ管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/admin/penalties` | ペナルティ一覧取得 | admin |
| GET | `/admin/penalties/:id` | ペナルティ詳細取得 | admin |
| POST | `/admin/penalties/:id/resolve` | ペナルティ解除 | admin |
| POST | `/admin/penalties/:id/reject-resolution` | 解除申請却下 | admin |

#### 監査ログ
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/admin/audit-logs` | 監査ログ一覧取得 | admin |

#### システム設定
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/admin/settings` | システム設定取得 | admin |
| PUT | `/admin/settings` | システム設定更新 | super_admin |

### 3.5 共通API

#### 通知管理
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| GET | `/notifications` | 通知一覧取得 | 認証済み |
| PUT | `/notifications/:id/read` | 通知既読 | 認証済み |
| PUT | `/notifications/read-all` | 全通知既読 | 認証済み |
| DELETE | `/notifications/:id` | 通知削除 | 認証済み |

#### ファイルアップロード
| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| POST | `/upload/image` | 画像アップロード | 認証済み |
| POST | `/upload/document` | 書類アップロード | 認証済み |

---

## 4. リクエスト・レスポンス例

### 4.1 薬局アカウント登録

**リクエスト:**
```http
POST /auth/register/pharmacy
Content-Type: application/json

{
  "email": "pharmacy@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "pharmacy_name": "羽曳野薬局",
  "representative_last_name": "山田",
  "representative_first_name": "太郎",
  "phone_number": "072-123-4567",
  "address": "大阪府羽曳野市◯◯町1-2-3",
  "terms_accepted": true
}
```

**レスポンス (成功):**
```json
{
  "success": true,
  "message": "薬局アカウントが作成されました。確認メールをご確認ください。",
  "data": {
    "user_id": 1,
    "email": "pharmacy@example.com",
    "user_type": "pharmacy",
    "pharmacy": {
      "id": 1,
      "pharmacy_name": "羽曳野薬局",
      "representative_name": "山田 太郎"
    }
  }
}
```

**レスポンス (失敗):**
```json
{
  "success": false,
  "message": "バリデーションエラー",
  "errors": {
    "email": ["このメールアドレスは既に使用されています"],
    "password": ["パスワードは8文字以上である必要があります"]
  }
}
```

### 4.2 求人投稿

**リクエスト:**
```http
POST /pharmacy/job-postings
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "title": "急募！大阪市中央区の調剤薬局で薬剤師募集",
  "description": "アットホームな雰囲気の薬局です...",
  "work_location": "大阪市中央区",
  "daily_wage": 22000,
  "desired_work_days": 30,
  "work_start_period_from": "2026-02-12",
  "work_start_period_to": "2026-02-26",
  "recruitment_deadline": "2026-02-05",
  "requirements": "薬剤師免許必須、調剤経験3年以上歓迎",
  "desired_work_hours": "平日9:00-18:00（目安）",
  "status": "draft"
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "求人が作成されました",
  "data": {
    "id": 1,
    "pharmacy_id": 1,
    "title": "急募！大阪市中央区の調剤薬局で薬剤師募集",
    "work_location": "大阪市中央区",
    "daily_wage": 22000,
    "desired_work_days": 30,
    "total_compensation": 660000,
    "platform_fee": 264000,
    "status": "draft",
    "created_at": "2026-01-27T10:30:00Z"
  }
}
```

### 4.3 応募

**リクエスト:**
```http
POST /pharmacist/job-postings/1/apply
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "nearest_station": "天王寺駅",
  "work_experience_types": ["調剤薬局", "ドラッグストア"],
  "cover_letter": "調剤薬局で5年の経験があります。在宅医療にも対応可能です。"
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "応募が完了しました",
  "data": {
    "application_id": 1,
    "job_posting_id": 1,
    "pharmacist_id": 1,
    "status": "pending",
    "applied_at": "2026-01-27T14:30:00Z"
  }
}
```

### 4.4 証明書承認

**リクエスト:**
```http
POST /admin/certifications/1/approve
Content-Type: application/json
Authorization: Bearer {admin_access_token}

{
  "comment": "問題なく確認できました"
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "資格証明書を承認しました",
  "data": {
    "pharmacist_id": 1,
    "verification_status": "approved",
    "approved_at": "2026-01-27T15:00:00Z",
    "approved_by": "admin_user_id"
  }
}
```

### 4.5 支払い確認

**リクエスト:**
```http
POST /admin/payments/1/confirm
Content-Type: application/json
Authorization: Bearer {admin_access_token}

{
  "confirmed_amount": 264000,
  "confirmation_note": "◯◯銀行で入金確認済み"
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "支払いを確認しました",
  "data": {
    "payment_id": 1,
    "contract_id": 1,
    "payment_status": "confirmed",
    "confirmed_at": "2026-02-08T16:00:00Z",
    "contract_status": "active"
  }
}
```

---

## 5. ページネーション

### 5.1 リクエスト

```http
GET /pharmacy/job-postings?page=1&per_page=20&sort=created_at&order=desc
Authorization: Bearer {access_token}
```

**クエリパラメータ:**
- `page`: ページ番号（デフォルト: 1）
- `per_page`: 1ページあたりの件数（デフォルト: 20、最大: 100）
- `sort`: ソートフィールド
- `order`: ソート順（asc/desc）

### 5.2 レスポンス

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "求人タイトル",
      ...
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8,
    "has_next_page": true,
    "has_prev_page": false
  },
  "links": {
    "first": "/pharmacy/job-postings?page=1&per_page=20",
    "last": "/pharmacy/job-postings?page=8&per_page=20",
    "next": "/pharmacy/job-postings?page=2&per_page=20",
    "prev": null
  }
}
```

---

## 6. エラーハンドリング

### 6.1 HTTPステータスコード

| コード | 意味 | 使用例 |
|--------|------|--------|
| 200 | OK | 成功 |
| 201 | Created | リソース作成成功 |
| 204 | No Content | 削除成功（レスポンスボディなし） |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 権限エラー |
| 404 | Not Found | リソースが見つからない |
| 409 | Conflict | リソースの競合（重複など） |
| 422 | Unprocessable Entity | 処理できないエンティティ |
| 429 | Too Many Requests | レート制限超過 |
| 500 | Internal Server Error | サーバーエラー |
| 503 | Service Unavailable | サービス一時停止 |

### 6.2 エラーレスポンス形式

**バリデーションエラー:**
```json
{
  "success": false,
  "message": "バリデーションエラー",
  "errors": {
    "email": ["メールアドレスは必須です", "正しいメールアドレス形式で入力してください"],
    "password": ["パスワードは8文字以上である必要があります"]
  },
  "error_code": "VALIDATION_ERROR"
}
```

**認証エラー:**
```json
{
  "success": false,
  "message": "認証に失敗しました",
  "error_code": "UNAUTHORIZED",
  "details": "トークンが無効または期限切れです"
}
```

**権限エラー:**
```json
{
  "success": false,
  "message": "この操作を実行する権限がありません",
  "error_code": "FORBIDDEN"
}
```

**リソースが見つからない:**
```json
{
  "success": false,
  "message": "指定されたリソースが見つかりません",
  "error_code": "NOT_FOUND",
  "resource_type": "job_posting",
  "resource_id": 999
}
```

**サーバーエラー:**
```json
{
  "success": false,
  "message": "サーバーエラーが発生しました",
  "error_code": "INTERNAL_SERVER_ERROR",
  "request_id": "req_abc123xyz"
}
```

### 6.3 エラーコード一覧

| エラーコード | 説明 |
|-------------|------|
| VALIDATION_ERROR | バリデーションエラー |
| UNAUTHORIZED | 認証エラー |
| FORBIDDEN | 権限エラー |
| NOT_FOUND | リソースが見つからない |
| DUPLICATE_RESOURCE | リソースの重複 |
| PAYMENT_DEADLINE_PASSED | 支払い期限超過 |
| CONTRACT_ALREADY_EXISTS | 契約が既に存在する |
| CERTIFICATION_NOT_APPROVED | 資格証明書が未承認 |
| ACCOUNT_SUSPENDED | アカウントが停止中 |
| RATE_LIMIT_EXCEEDED | レート制限超過 |
| INTERNAL_SERVER_ERROR | サーバーエラー |

---

## 7. ファイルアップロード

### 7.1 資格証明書アップロード

**リクエスト:**
```http
POST /pharmacist/profile/license
Content-Type: multipart/form-data
Authorization: Bearer {access_token}

--boundary
Content-Disposition: form-data; name="file"; filename="license.pdf"
Content-Type: application/pdf

[バイナリデータ]
--boundary--
```

**レスポンス:**
```json
{
  "success": true,
  "message": "薬剤師免許証をアップロードしました",
  "data": {
    "file_id": "cert_abc123",
    "file_name": "license.pdf",
    "file_size": 2048576,
    "file_type": "application/pdf",
    "uploaded_at": "2026-01-27T10:00:00Z",
    "verification_status": "pending"
  }
}
```

### 7.2 ファイル制限

- **最大ファイルサイズ**: 10MB
- **許可される形式**: PDF
- **ファイル名**: UTF-8エンコード、最大255文字

---

## 8. フィルタリング・検索

### 8.1 求人検索

```http
GET /pharmacist/job-postings?prefecture=大阪府&min_wage=20000&max_wage=30000&status=active
Authorization: Bearer {access_token}
```

**クエリパラメータ:**
- `prefecture`: 都道府県（フィルター）
- `min_wage`: 最低日給（フィルター）
- `max_wage`: 最高日給（フィルター）
- `status`: ステータス（通常は`active`）
- `page`: ページ番号（ページネーション）
- `per_page`: 1ページあたりの件数

**注意**: 
- 勤務日数によるフィルタリングは実装しません
- キーワード検索機能は実装しません

### 8.2 応募フィルタリング

```http
GET /pharmacy/applications?status=pending&sort=applied_at&order=desc
Authorization: Bearer {access_token}
```

**クエリパラメータ:**
- `status`: ステータスフィルター
- `job_posting_id`: 求人IDでフィルター
- `date_from`: 応募日開始
- `date_to`: 応募日終了

---

## 9. レート制限

### 9.1 制限

- **認証済みユーザー**: 1,000リクエスト/時間
- **未認証ユーザー**: 100リクエスト/時間
- **ファイルアップロード**: 50リクエスト/時間

### 9.2 レート制限ヘッダー

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1706356800
```

### 9.3 レート制限超過

**レスポンス:**
```json
{
  "success": false,
  "message": "レート制限を超えました",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 3600
}
```

---

## 10. Webhook（将来実装）

### 10.1 イベント

- `contract.created`: 契約成立
- `payment.confirmed`: 支払い確認
- `application.created`: 応募受付
- `penalty.applied`: ペナルティ適用

### 10.2 Webhookペイロード例

```json
{
  "event": "contract.created",
  "timestamp": "2026-01-27T11:00:00Z",
  "data": {
    "contract_id": 1,
    "pharmacy_id": 1,
    "pharmacist_id": 1,
    "total_compensation": 660000,
    "platform_fee": 264000
  }
}
```

---

## 11. セキュリティ

### 11.1 HTTPS必須
- 全てのAPIリクエストはHTTPS経由で行う
- HTTP接続は自動的にHTTPSにリダイレクト

### 11.2 CORS設定
- 許可されたオリジンからのみアクセス可能
- 本番環境: `https://app.example.com`
- 開発環境: `http://localhost:3000`

### 11.3 セキュリティヘッダー

```http
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 12. バージョン情報

### 12.1 現在のバージョン
- **API Version**: v1
- **最終更新**: 2026-01-27

### 12.2 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| v1.0.0 | 2026-01-27 | 初版リリース |

---

## 付録A：データモデル

### A.1 User（ユーザー）
```json
{
  "id": 1,
  "email": "user@example.com",
  "user_type": "pharmacy",
  "email_verified": true,
  "is_active": true,
  "created_at": "2026-01-27T10:00:00Z",
  "updated_at": "2026-01-27T10:00:00Z"
}
```

### A.2 Pharmacy（薬局）
```json
{
  "id": 1,
  "user_id": 1,
  "pharmacy_name": "羽曳野薬局",
  "representative_last_name": "山田",
  "representative_first_name": "太郎",
  "phone_number": "072-123-4567",
  "address": "大阪府羽曳野市◯◯町1-2-3",
  "nearest_station": "古市駅",
  "business_hours": "9:00-18:00",
  "created_at": "2026-01-27T10:00:00Z"
}
```

### A.3 JobPosting（求人）
```json
{
  "id": 1,
  "pharmacy_id": 1,
  "title": "急募！大阪市中央区の調剤薬局で薬剤師募集",
  "description": "アットホームな雰囲気...",
  "work_location": "大阪市中央区",
  "daily_wage": 22000,
  "desired_work_days": 30,
  "total_compensation": 660000,
  "platform_fee": 264000,
  "work_start_period_from": "2026-02-12",
  "work_start_period_to": "2026-02-26",
  "recruitment_deadline": "2026-02-05",
  "status": "active",
  "view_count": 125,
  "application_count": 5,
  "created_at": "2026-01-27T10:00:00Z"
}
```

### A.4 Application（応募）
```json
{
  "id": 1,
  "job_posting_id": 1,
  "pharmacist_id": 1,
  "status": "pending",
  "cover_letter": "調剤薬局で5年の経験があります...",
  "applied_at": "2026-01-27T14:30:00Z",
  "reviewed_at": null,
  "offered_at": null
}
```

### A.5 Contract（契約）
```json
{
  "id": 1,
  "application_id": 1,
  "pharmacy_id": 1,
  "pharmacist_id": 1,
  "job_posting_id": 1,
  "initial_work_date": "2026-02-12",
  "work_days": 30,
  "daily_wage": 22000,
  "total_compensation": 660000,
  "platform_fee": 264000,
  "status": "pending_payment",
  "payment_deadline": "2026-02-09",
  "created_at": "2026-01-27T11:00:00Z"
}
```

### A.6 Payment（支払い）
```json
{
  "id": 1,
  "contract_id": 1,
  "pharmacy_id": 1,
  "amount": 264000,
  "payment_type": "platform_fee",
  "payment_status": "pending",
  "payment_date": null,
  "transfer_name": null,
  "reported_at": null,
  "confirmed_at": null
}
```

---

## 付録B：環境変数

```env
# API設定
API_BASE_URL=https://api.example.com
API_VERSION=v1

# JWT設定
JWT_SECRET=your-secret-key
JWT_ACCESS_TOKEN_EXPIRES_IN=3600
JWT_REFRESH_TOKEN_EXPIRES_IN=604800

# データベース
DATABASE_URL=postgresql://user:password@localhost:5432/pharmacy_db

# ファイルストレージ
STORAGE_TYPE=s3
AWS_S3_BUCKET=pharmacy-uploads
AWS_REGION=ap-northeast-1

# メール設定
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
FROM_EMAIL=noreply@example.com

# レート制限
RATE_LIMIT_AUTHENTICATED=1000
RATE_LIMIT_UNAUTHENTICATED=100
```

---

以上、API設計書
