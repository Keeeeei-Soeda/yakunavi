# 薬局管理システム：データベース設計書

## 1. データベース概要

### 1.1 データベース管理システム
- **DBMS**: PostgreSQL 14以上推奨
- **文字コード**: UTF-8
- **タイムゾーン**: Asia/Tokyo

### 1.2 命名規則
- テーブル名: スネークケース、複数形（例: `job_postings`）
- カラム名: スネークケース（例: `created_at`）
- インデックス名: `idx_{テーブル名}_{カラム名}`
- 外部キー名: `fk_{テーブル名}_{参照テーブル名}`

---

## 2. ER図（概要）

```
users (ユーザー)
  ├─ pharmacies (薬局情報)
  └─ pharmacists (薬剤師情報)

pharmacies
  ├─ job_postings (求人投稿)
  └─ contracts (契約)

job_postings
  └─ applications (応募)

applications
  ├─ messages (メッセージ)
  └─ contracts (契約)

contracts
  ├─ payments (支払い)
  └─ documents (書類)

pharmacies
  └─ penalties (ペナルティ)

users
  └─ notifications (通知)
```

---

## 3. テーブル定義

### 3.1 users（ユーザー）

**用途**: 薬局と薬剤師の共通認証テーブル

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) NOT NULL, -- 'pharmacy' or 'pharmacist'
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_sent_at TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_sent_at TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_user_type CHECK (user_type IN ('pharmacy', 'pharmacist'))
);

-- インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token);

-- コメント
COMMENT ON TABLE users IS 'ユーザー認証情報（薬局・薬剤師共通）';
COMMENT ON COLUMN users.user_type IS 'ユーザータイプ: pharmacy または pharmacist';
COMMENT ON COLUMN users.email_verified IS 'メールアドレス確認済みフラグ';
COMMENT ON COLUMN users.is_active IS 'アカウント有効フラグ（ペナルティで無効化される可能性）';
```

---

### 3.2 pharmacies（薬局情報）

**用途**: 薬局の詳細情報

```sql
CREATE TABLE pharmacies (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL,
  pharmacy_name VARCHAR(255) NOT NULL,
  representative_last_name VARCHAR(100) NOT NULL,
  representative_first_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  fax_number VARCHAR(20),
  prefecture VARCHAR(50),
  address TEXT,
  nearest_station VARCHAR(255),
  established_date DATE,
  daily_prescription_count INTEGER,
  staff_count INTEGER,
  business_hours_start TIME,
  business_hours_end TIME,
  introduction TEXT,
  strengths TEXT,
  equipment_systems TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_pharmacies_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_pharmacies_user_id ON pharmacies(user_id);
CREATE INDEX idx_pharmacies_prefecture ON pharmacies(prefecture);

-- コメント
COMMENT ON TABLE pharmacies IS '薬局の詳細情報';
COMMENT ON COLUMN pharmacies.daily_prescription_count IS '1日の処方箋枚数';
COMMENT ON COLUMN pharmacies.staff_count IS 'スタッフ数';
```

---

### 3.3 pharmacists（薬剤師情報）

**用途**: 薬剤師の詳細情報とプロフィール

```sql
CREATE TABLE pharmacists (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  address TEXT,
  birth_date DATE,
  age INTEGER,
  university VARCHAR(255),
  graduation_year INTEGER,
  license_year INTEGER,
  certified_pharmacist_license VARCHAR(255),
  other_licenses TEXT,
  work_experience_years INTEGER,
  work_experience_months INTEGER,
  work_experience_types TEXT[], -- ['調剤薬局', 'ドラッグストア', '病院薬剤部']
  main_duties TEXT[], -- ['在宅医療', 'かかりつけ薬剤師', 'OTC販売']
  specialty_areas TEXT[], -- 得意な診療科・疾患領域
  pharmacy_systems TEXT[], -- 使用経験のある薬歴システム
  special_notes TEXT,
  self_introduction TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_pharmacists_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_pharmacists_user_id ON pharmacists(user_id);
CREATE INDEX idx_pharmacists_age ON pharmacists(age);
CREATE INDEX idx_pharmacists_work_experience_years ON pharmacists(work_experience_years);

-- コメント
COMMENT ON TABLE pharmacists IS '薬剤師の詳細情報とプロフィール';
COMMENT ON COLUMN pharmacists.work_experience_types IS '勤務経験のある業態（配列）';
COMMENT ON COLUMN pharmacists.main_duties IS '主な業務経験（配列）';
COMMENT ON COLUMN pharmacists.specialty_areas IS '得意な診療科・疾患領域（配列）';
COMMENT ON COLUMN pharmacists.pharmacy_systems IS '使用経験のある薬歴システム（配列）';
```

---

### 3.4 job_postings（求人投稿）

**用途**: 薬局が投稿する求人情報

```sql
CREATE TABLE job_postings (
  id BIGSERIAL PRIMARY KEY,
  pharmacy_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  work_location VARCHAR(255) NOT NULL,
  desired_work_days INTEGER NOT NULL, -- 15〜90日
  work_start_period_from DATE NOT NULL, -- 勤務開始可能期間の開始日
  work_start_period_to DATE NOT NULL, -- 勤務開始可能期間の終了日（開始日+14日）
  recruitment_deadline DATE NOT NULL,
  requirements TEXT,
  desired_work_hours TEXT,
  daily_wage INTEGER NOT NULL, -- 日給（薬局が設定、20,000円以上）
  total_compensation INTEGER NOT NULL, -- 報酬総額（日給 × 日数）
  platform_fee INTEGER NOT NULL, -- プラットフォーム手数料（40%）
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'closed', 'completed', 'cancelled'
  view_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_job_postings_pharmacy FOREIGN KEY (pharmacy_id) 
    REFERENCES pharmacies(id) ON DELETE CASCADE,
  CONSTRAINT chk_desired_work_days CHECK (desired_work_days >= 15 AND desired_work_days <= 90),
  CONSTRAINT chk_daily_wage CHECK (daily_wage >= 20000),
  CONSTRAINT chk_status CHECK (status IN ('draft', 'active', 'closed', 'completed', 'cancelled'))
);

-- インデックス
CREATE INDEX idx_job_postings_pharmacy_id ON job_postings(pharmacy_id);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_recruitment_deadline ON job_postings(recruitment_deadline);
CREATE INDEX idx_job_postings_published_at ON job_postings(published_at);

-- コメント
COMMENT ON TABLE job_postings IS '薬局が投稿する求人情報';
COMMENT ON COLUMN job_postings.desired_work_days IS '希望勤務日数（15〜90日）';
COMMENT ON COLUMN job_postings.work_start_period_from IS '勤務開始可能期間の開始日（今日+14日以降）';
COMMENT ON COLUMN job_postings.work_start_period_to IS '勤務開始可能期間の終了日（開始日+14日）';
COMMENT ON COLUMN job_postings.daily_wage IS '日給（薬局が設定、20,000円以上）';
COMMENT ON COLUMN job_postings.total_compensation IS '報酬総額（日給 × 勤務日数）';
COMMENT ON COLUMN job_postings.platform_fee IS 'プラットフォーム手数料（報酬総額の40%）';
COMMENT ON COLUMN job_postings.status IS 'ステータス: draft=下書き, active=募集中, closed=募集終了, completed=契約成立, cancelled=キャンセル';
```

---

### 3.5 applications（応募）

**用途**: 薬剤師の求人応募情報

```sql
CREATE TABLE applications (
  id BIGSERIAL PRIMARY KEY,
  job_posting_id BIGINT NOT NULL,
  pharmacist_id BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewing', 'offered', 'accepted', 'rejected', 'pharmacist_rejected'
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  offered_at TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_applications_job_posting FOREIGN KEY (job_posting_id) 
    REFERENCES job_postings(id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_pharmacist FOREIGN KEY (pharmacist_id) 
    REFERENCES pharmacists(id) ON DELETE CASCADE,
  CONSTRAINT chk_status CHECK (status IN ('pending', 'reviewing', 'offered', 'accepted', 'rejected', 'pharmacist_rejected')),
  UNIQUE(job_posting_id, pharmacist_id) -- 同じ求人に複数回応募不可
);

-- インデックス
CREATE INDEX idx_applications_job_posting_id ON applications(job_posting_id);
CREATE INDEX idx_applications_pharmacist_id ON applications(pharmacist_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at);

-- コメント
COMMENT ON TABLE applications IS '薬剤師の求人応募情報';
COMMENT ON COLUMN applications.status IS 'ステータス: pending=未読済, reviewing=検討中, offered=オファー送信済, accepted=承認, rejected=薬局辞退, pharmacist_rejected=薬剤師辞退';
```

---

### 3.6 messages（メッセージ）

**用途**: 薬局と薬剤師間のメッセージ（構造化含む）

```sql
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL,
  sender_type VARCHAR(20) NOT NULL, -- 'pharmacy' or 'pharmacist'
  sender_id BIGINT NOT NULL, -- pharmacy_id or pharmacist_id
  message_type VARCHAR(30) DEFAULT 'text', -- 'text', 'initial_date_proposal', 'initial_date_selection', 'formal_offer', 'offer_response'
  message_content TEXT,
  structured_data JSONB, -- 構造化データ（初回出勤日候補、正式オファー内容など）
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_messages_application FOREIGN KEY (application_id) 
    REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT chk_sender_type CHECK (sender_type IN ('pharmacy', 'pharmacist')),
  CONSTRAINT chk_message_type CHECK (message_type IN ('text', 'initial_date_proposal', 'initial_date_selection', 'formal_offer', 'offer_response'))
);

-- インデックス
CREATE INDEX idx_messages_application_id ON messages(application_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- コメント
COMMENT ON TABLE messages IS '薬局と薬剤師間のメッセージ（構造化メッセージ含む）';
COMMENT ON COLUMN messages.message_type IS 'メッセージタイプ: text=通常テキスト, initial_date_proposal=初回出勤日候補提案, initial_date_selection=初回出勤日選択, formal_offer=正式オファー, offer_response=オファー回答';
COMMENT ON COLUMN messages.structured_data IS '構造化データ（JSON形式）';
```

**structured_dataの例**:
```json
// 初回出勤日候補提案 (initial_date_proposal)
{
  "candidate_dates": [
    "2026-02-12",
    "2026-02-13",
    "2026-02-14"
  ]
}

// 初回出勤日選択 (initial_date_selection)
{
  "selected_date": "2026-02-12"
}

// 正式オファー (formal_offer)
{
  "initial_work_date": "2026-02-12",
  "work_days": 30,
  "total_compensation": 750000,
  "platform_fee": 300000,
  "payment_deadline": "2026-02-09",
  "work_hours": "9:00-18:00"
}

// オファー回答 (offer_response)
{
  "response": "accepted", // or "rejected"
  "reason": "辞退理由（辞退の場合）"
}
```

---

### 3.7 contracts（契約）

**用途**: 薬局と薬剤師間の契約情報

```sql
CREATE TABLE contracts (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT UNIQUE NOT NULL,
  pharmacy_id BIGINT NOT NULL,
  pharmacist_id BIGINT NOT NULL,
  job_posting_id BIGINT NOT NULL,
  initial_work_date DATE NOT NULL, -- 初回出勤日
  work_days INTEGER NOT NULL,
  daily_wage INTEGER NOT NULL, -- 日給
  total_compensation INTEGER NOT NULL, -- 薬剤師への報酬総額（日給 × 勤務日数）
  platform_fee INTEGER NOT NULL, -- プラットフォーム手数料（40%）
  work_hours VARCHAR(255), -- 勤務時間（目安）
  status VARCHAR(30) DEFAULT 'pending_approval', -- 'pending_approval', 'pending_payment', 'active', 'completed', 'cancelled'
  contract_start_date DATE, -- 契約開始日（初回出勤日と同じ）
  contract_end_date DATE, -- 契約終了日（初回出勤日 + work_days）
  payment_deadline DATE NOT NULL, -- 手数料支払い期限（初回出勤日の3日前）
  approved_at TIMESTAMP,
  payment_confirmed_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_contracts_application FOREIGN KEY (application_id) 
    REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_contracts_pharmacy FOREIGN KEY (pharmacy_id) 
    REFERENCES pharmacies(id) ON DELETE CASCADE,
  CONSTRAINT fk_contracts_pharmacist FOREIGN KEY (pharmacist_id) 
    REFERENCES pharmacists(id) ON DELETE CASCADE,
  CONSTRAINT fk_contracts_job_posting FOREIGN KEY (job_posting_id) 
    REFERENCES job_postings(id) ON DELETE CASCADE,
  CONSTRAINT chk_status CHECK (status IN ('pending_approval', 'pending_payment', 'active', 'completed', 'cancelled'))
);

-- インデックス
CREATE INDEX idx_contracts_application_id ON contracts(application_id);
CREATE INDEX idx_contracts_pharmacy_id ON contracts(pharmacy_id);
CREATE INDEX idx_contracts_pharmacist_id ON contracts(pharmacist_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_payment_deadline ON contracts(payment_deadline);
CREATE INDEX idx_contracts_initial_work_date ON contracts(initial_work_date);

-- コメント
COMMENT ON TABLE contracts IS '薬局と薬剤師間の契約情報';
COMMENT ON COLUMN contracts.status IS 'ステータス: pending_approval=承認待ち, pending_payment=手数料支払い待ち, active=契約成立, completed=契約終了, cancelled=キャンセル';
COMMENT ON COLUMN contracts.payment_deadline IS '手数料支払い期限（初回出勤日の3日前）';
```

---

### 3.8 payments（支払い）

**用途**: プラットフォーム手数料の支払い情報

```sql
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  contract_id BIGINT UNIQUE NOT NULL,
  pharmacy_id BIGINT NOT NULL,
  amount INTEGER NOT NULL, -- 支払い金額（プラットフォーム手数料）
  payment_type VARCHAR(20) DEFAULT 'platform_fee', -- 'platform_fee'
  payment_method VARCHAR(30), -- 'bank_transfer', 'credit_card', 'other'
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reported', 'confirmed', 'failed'
  payment_date DATE,
  transfer_name VARCHAR(255), -- 振込名義人
  confirmation_note TEXT,
  reported_at TIMESTAMP, -- 薬局が支払い報告した日時
  confirmed_at TIMESTAMP, -- 運営が確認した日時
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_payments_contract FOREIGN KEY (contract_id) 
    REFERENCES contracts(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_pharmacy FOREIGN KEY (pharmacy_id) 
    REFERENCES pharmacies(id) ON DELETE CASCADE,
  CONSTRAINT chk_payment_type CHECK (payment_type IN ('platform_fee')),
  CONSTRAINT chk_payment_status CHECK (payment_status IN ('pending', 'reported', 'confirmed', 'failed'))
);

-- インデックス
CREATE INDEX idx_payments_contract_id ON payments(contract_id);
CREATE INDEX idx_payments_pharmacy_id ON payments(pharmacy_id);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- コメント
COMMENT ON TABLE payments IS 'プラットフォーム手数料の支払い情報';
COMMENT ON COLUMN payments.payment_type IS '支払いタイプ: platform_fee=プラットフォーム手数料';
COMMENT ON COLUMN payments.payment_status IS 'ステータス: pending=未払い, reported=支払い報告済み, confirmed=確認済み, failed=失敗';
```

---

### 3.9 documents（書類）

**用途**: 労働条件通知書、請求書などのPDF文書管理

```sql
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  contract_id BIGINT,
  pharmacy_id BIGINT,
  pharmacist_id BIGINT,
  document_type VARCHAR(30) NOT NULL, -- 'labor_conditions', 'invoice', 'contract'
  document_title VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- PDFファイルのパス
  file_size INTEGER,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  downloaded_by_pharmacy BOOLEAN DEFAULT FALSE,
  pharmacy_downloaded_at TIMESTAMP,
  downloaded_by_pharmacist BOOLEAN DEFAULT FALSE,
  pharmacist_downloaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_documents_contract FOREIGN KEY (contract_id) 
    REFERENCES contracts(id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_pharmacy FOREIGN KEY (pharmacy_id) 
    REFERENCES pharmacies(id) ON DELETE SET NULL,
  CONSTRAINT fk_documents_pharmacist FOREIGN KEY (pharmacist_id) 
    REFERENCES pharmacists(id) ON DELETE SET NULL,
  CONSTRAINT chk_document_type CHECK (document_type IN ('labor_conditions', 'invoice', 'contract'))
);

-- インデックス
CREATE INDEX idx_documents_contract_id ON documents(contract_id);
CREATE INDEX idx_documents_pharmacy_id ON documents(pharmacy_id);
CREATE INDEX idx_documents_pharmacist_id ON documents(pharmacist_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);

-- コメント
COMMENT ON TABLE documents IS '労働条件通知書、請求書などのPDF文書管理';
COMMENT ON COLUMN documents.document_type IS '書類タイプ: labor_conditions=労働条件通知書, invoice=請求書, contract=契約書';
```

---

### 3.10 penalties（ペナルティ）

**用途**: 薬局の手数料未払いペナルティ管理

```sql
CREATE TABLE penalties (
  id BIGSERIAL PRIMARY KEY,
  pharmacy_id BIGINT NOT NULL,
  contract_id BIGINT,
  penalty_type VARCHAR(30) NOT NULL, -- 'payment_delay', 'account_suspension', 'permanent_ban'
  reason TEXT NOT NULL,
  penalty_status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'appealed'
  imposed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  resolution_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_penalties_pharmacy FOREIGN KEY (pharmacy_id) 
    REFERENCES pharmacies(id) ON DELETE CASCADE,
  CONSTRAINT fk_penalties_contract FOREIGN KEY (contract_id) 
    REFERENCES contracts(id) ON DELETE SET NULL,
  CONSTRAINT chk_penalty_type CHECK (penalty_type IN ('payment_delay', 'account_suspension', 'permanent_ban')),
  CONSTRAINT chk_penalty_status CHECK (penalty_status IN ('active', 'resolved', 'appealed'))
);

-- インデックス
CREATE INDEX idx_penalties_pharmacy_id ON penalties(pharmacy_id);
CREATE INDEX idx_penalties_penalty_status ON penalties(penalty_status);
CREATE INDEX idx_penalties_imposed_at ON penalties(imposed_at);

-- コメント
COMMENT ON TABLE penalties IS '薬局の手数料未払いペナルティ管理';
COMMENT ON COLUMN penalties.penalty_type IS 'ペナルティタイプ: payment_delay=支払い遅延, account_suspension=アカウント停止, permanent_ban=永久停止';
COMMENT ON COLUMN penalties.penalty_status IS 'ステータス: active=有効, resolved=解決済み, appealed=異議申し立て中';
```

---

### 3.11 notifications（通知）

**用途**: ユーザーへの通知管理

```sql
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- 'new_application', 'offer_accepted', 'payment_reminder', 'contract_established', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_notification_type ON notifications(notification_type);

-- コメント
COMMENT ON TABLE notifications IS 'ユーザーへの通知管理';
COMMENT ON COLUMN notifications.notification_type IS '通知タイプ: new_application=新規応募, offer_accepted=オファー承認, payment_reminder=支払いリマインダー, contract_established=契約成立など';
```

---

### 3.12 audit_logs（監査ログ）

**用途**: システムの重要な操作の記録

```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
  table_name VARCHAR(50),
  record_id BIGINT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE SET NULL
);

-- インデックス
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- コメント
COMMENT ON TABLE audit_logs IS 'システムの重要な操作の監査ログ';
```

---

## 4. ビュー定義

### 4.1 active_contracts_view（アクティブな契約一覧）

```sql
CREATE VIEW active_contracts_view AS
SELECT 
  c.id AS contract_id,
  c.pharmacy_id,
  ph.pharmacy_name,
  c.pharmacist_id,
  p.last_name || ' ' || p.first_name AS pharmacist_name,
  c.initial_work_date,
  c.work_days,
  c.total_compensation,
  c.platform_fee,
  c.status,
  c.payment_deadline,
  CASE 
    WHEN c.status = 'pending_payment' AND c.payment_deadline < CURRENT_DATE THEN 'overdue'
    WHEN c.status = 'pending_payment' AND c.payment_deadline <= CURRENT_DATE + INTERVAL '3 days' THEN 'urgent'
    ELSE 'normal'
  END AS payment_urgency
FROM contracts c
JOIN pharmacies ph ON c.pharmacy_id = ph.id
JOIN pharmacists p ON c.pharmacist_id = p.id
WHERE c.status IN ('pending_approval', 'pending_payment', 'active');

COMMENT ON VIEW active_contracts_view IS 'アクティブな契約一覧（支払い状況含む）';
```

### 4.2 pharmacy_dashboard_stats（薬局ダッシュボード統計）

```sql
CREATE VIEW pharmacy_dashboard_stats AS
SELECT 
  ph.id AS pharmacy_id,
  ph.pharmacy_name,
  COUNT(DISTINCT jp.id) FILTER (WHERE jp.status = 'active') AS active_job_postings,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'pending') AS new_applications,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status IN ('pending_payment', 'active')) AS active_contracts,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'pending_payment') AS pending_contracts
FROM pharmacies ph
LEFT JOIN job_postings jp ON ph.id = jp.pharmacy_id
LEFT JOIN applications a ON jp.id = a.job_posting_id
LEFT JOIN contracts c ON ph.id = c.pharmacy_id
GROUP BY ph.id, ph.pharmacy_name;

COMMENT ON VIEW pharmacy_dashboard_stats IS '薬局ダッシュボードの統計情報';
```

---

## 5. トリガー関数

### 5.1 更新日時の自動更新

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON pharmacies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacists_updated_at BEFORE UPDATE ON pharmacists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_penalties_updated_at BEFORE UPDATE ON penalties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 契約成立時の自動処理

```sql
CREATE OR REPLACE FUNCTION on_contract_approved()
RETURNS TRIGGER AS $$
BEGIN
  -- 契約終了日を自動計算
  IF NEW.status = 'pending_payment' AND OLD.status = 'pending_approval' THEN
    NEW.contract_start_date = NEW.initial_work_date;
    NEW.contract_end_date = NEW.initial_work_date + (NEW.work_days || ' days')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_contract_approved BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION on_contract_approved();
```

### 5.3 支払い期限超過時の自動キャンセル

```sql
-- 日次バッチジョブとして実行（cron等で呼び出し）
CREATE OR REPLACE FUNCTION auto_cancel_unpaid_contracts()
RETURNS void AS $$
BEGIN
  -- 支払い期限を過ぎた契約を自動キャンセル
  UPDATE contracts
  SET status = 'cancelled',
      cancelled_at = CURRENT_TIMESTAMP,
      cancellation_reason = '手数料未払いによる自動キャンセル'
  WHERE status = 'pending_payment'
    AND payment_deadline < CURRENT_DATE;
  
  -- ペナルティを記録
  INSERT INTO penalties (pharmacy_id, contract_id, penalty_type, reason)
  SELECT 
    c.pharmacy_id,
    c.id,
    'account_suspension',
    '手数料未払いによる契約キャンセル'
  FROM contracts c
  WHERE c.status = 'cancelled'
    AND c.cancelled_at::DATE = CURRENT_DATE
    AND c.cancellation_reason = '手数料未払いによる自動キャンセル';
  
  -- 薬局のアカウントを停止
  UPDATE users
  SET is_active = FALSE
  WHERE id IN (
    SELECT ph.user_id
    FROM pharmacies ph
    WHERE ph.id IN (
      SELECT pharmacy_id FROM penalties
      WHERE penalty_type = 'account_suspension'
        AND penalty_status = 'active'
    )
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 6. インデックス戦略

### 6.1 複合インデックス

```sql
-- 求人検索用
CREATE INDEX idx_job_postings_status_deadline 
  ON job_postings(status, recruitment_deadline);

-- 応募一覧用
CREATE INDEX idx_applications_pharmacy_status 
  ON applications(job_posting_id, status);

-- 契約一覧用
CREATE INDEX idx_contracts_pharmacy_status 
  ON contracts(pharmacy_id, status);

-- メッセージ履歴用
CREATE INDEX idx_messages_application_created 
  ON messages(application_id, created_at DESC);

-- 通知一覧用
CREATE INDEX idx_notifications_user_read_created 
  ON notifications(user_id, is_read, created_at DESC);
```

### 6.2 部分インデックス

```sql
-- アクティブな求人のみ
CREATE INDEX idx_active_job_postings 
  ON job_postings(pharmacy_id) 
  WHERE status = 'active';

-- 未読通知のみ
CREATE INDEX idx_unread_notifications 
  ON notifications(user_id) 
  WHERE is_read = FALSE;

-- 支払い待ちの契約のみ
CREATE INDEX idx_pending_payment_contracts 
  ON contracts(pharmacy_id, payment_deadline) 
  WHERE status = 'pending_payment';
```

---

## 7. データベース制約まとめ

### 7.1 外部キー制約
- すべてのリレーションに適切な外部キー制約を設定
- `ON DELETE CASCADE`または`ON DELETE SET NULL`を適切に使用

### 7.2 CHECK制約
- ステータス値のENUM的な制約
- 数値範囲の制約（勤務日数: 10〜90日）
- 日付の論理的な制約

### 7.3 UNIQUE制約
- 同一求人への重複応募防止
- ユーザーとプロフィールの1対1関係保証

---

## 8. データ移行・初期データ

### 8.1 マスターデータ

```sql
-- 都道府県マスター（必要に応じて）
CREATE TABLE prefectures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  sort_order INTEGER
);

-- 資格マスター（必要に応じて）
CREATE TABLE certifications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(50) -- '認定薬剤師', 'その他資格'
);
```

### 8.2 テストデータ

```sql
-- 開発環境用のテストユーザー作成
INSERT INTO users (email, password_hash, user_type, email_verified, is_active)
VALUES 
  ('pharmacy_test@example.com', 'hashed_password', 'pharmacy', TRUE, TRUE),
  ('pharmacist_test@example.com', 'hashed_password', 'pharmacist', TRUE, TRUE);
```

---

## 9. パフォーマンス最適化

### 9.1 クエリ最適化のポイント
- `EXPLAIN ANALYZE`で実行計画を確認
- 適切なインデックスの使用
- N+1問題の回避（JOINまたはプリロード）
- ページネーションの実装

### 9.2 キャッシュ戦略
- 頻繁にアクセスされるマスターデータはアプリケーション層でキャッシュ
- ダッシュボード統計はRedis等でキャッシュ（TTL: 5分）

---

## 10. バックアップ・リストア戦略

### 10.1 バックアップ
```bash
# 毎日自動バックアップ
pg_dump -U postgres -d pharmacy_system > backup_$(date +%Y%m%d).sql

# WALアーカイブでポイントインタイムリカバリ対応
```

### 10.2 データ保持ポリシー
- 削除されたユーザーのデータは180日間保持後に完全削除
- 監査ログは3年間保持

---

## 11. セキュリティ

### 11.1 アクセス制御
```sql
-- アプリケーション用ユーザー
CREATE ROLE pharmacy_app WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE pharmacy_system TO pharmacy_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pharmacy_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pharmacy_app;
```

### 11.2 機密データの暗号化
- パスワードは bcrypt でハッシュ化
- 個人情報カラムは暗号化（アプリケーション層）
- SSL/TLS接続の強制

---

## 付録: DDLスクリプト生成順序

1. users
2. pharmacies
3. pharmacists
4. job_postings
5. applications
6. messages
7. contracts
8. payments
9. documents
10. penalties
11. notifications
12. audit_logs
13. ビュー作成
14. トリガー作成
15. インデックス作成

---

以上、薬局管理システムのデータベース設計書
