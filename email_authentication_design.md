# 薬局管理システム：メール認証・メール機能設計書

## 目次
1. メール認証の仕組み
2. データベーススキーマ
3. バックエンド実装
4. メールテンプレート一覧
5. フロントエンド実装
6. メールサービス選択
7. セキュリティ対策
8. 実装チェックリスト

---

## 1. メール認証の仕組み

### 1.1 フロー図

```
【ユーザー登録時】
┌─────────────┐
│ユーザー登録  │
│フォーム送信  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│サーバー処理              │
│1. ユーザーレコード作成   │
│   - email_verified: false│
│   - token生成（32バイト）│
│   - 有効期限: 24時間     │
│2. 認証メール送信         │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────┐
│ユーザーのメール  │
│に認証リンク送信  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ユーザーがリンク  │
│をクリック        │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────┐
│サーバーで認証処理        │
│1. トークン検証           │
│2. email_verified: true   │
│3. トークン削除           │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────┐
│認証完了画面表示  │
│→ログイン可能に  │
└─────────────────┘
```

### 1.2 セキュリティポイント

```
✅ トークンは暗号学的に安全な方法で生成（crypto.randomBytes）
✅ トークンは一度のみ使用可能
✅ 24時間の有効期限
✅ HTTPS必須
✅ レート制限（メール送信は15分で3回まで）
```

---

## 2. データベーススキーマ

### 2.1 usersテーブルへの追加カラム

```sql
-- メール認証用カラムを追加
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN verification_token_expires_at TIMESTAMP;

-- パスワードリセット用カラムを追加
ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255);
ALTER TABLE users ADD COLUMN reset_password_token_expires_at TIMESTAMP;

-- インデックス作成（検索高速化）
CREATE INDEX idx_users_verification_token ON users(verification_token);
CREATE INDEX idx_users_reset_password_token ON users(reset_password_token);
```

### 2.2 更新後のusersテーブル

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('pharmacy', 'pharmacist', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- メール認証
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires_at TIMESTAMP,
    
    -- パスワードリセット
    reset_password_token VARCHAR(255),
    reset_password_token_expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);
```

---

## 3. バックエンド実装

### 3.1 必要なパッケージ

```bash
# メール送信
npm install nodemailer

# または SendGrid
npm install @sendgrid/mail

# または Resend（推奨）
npm install resend

# その他
npm install bcrypt
npm install jsonwebtoken
npm install express-rate-limit
```

### 3.2 環境変数（.env）

```env
# アプリケーション
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://example.com

# データベース
DATABASE_URL=postgresql://user:password@localhost:5432/pharmacy_db

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=24h

# メール送信（Nodemailer + Gmail）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@example.com
FROM_NAME=薬局管理システム

# または SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxx

# または Resend（推奨）
RESEND_API_KEY=re_xxxxxxxxxxxx
```

### 3.3 ユーザー登録（認証メール送信）

```typescript
// routes/auth.ts
import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from '../config/database';
import { sendVerificationEmail } from '../services/emailService';

const router = express.Router();

// 薬剤師登録
router.post('/register/pharmacist', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      last_name, 
      first_name, 
      phone_number,
      address,
      pharmacist_license_number 
    } = req.body;
    
    // 既存ユーザーチェック
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'このメールアドレスは既に登録されています' 
      });
    }
    
    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 認証トークン生成
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後
    
    // トランザクション開始
    await db.query('BEGIN');
    
    try {
      // ユーザー作成
      const userResult = await db.query(
        `INSERT INTO users 
         (email, password, user_type, email_verified, verification_token, verification_token_expires_at) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, email, user_type, created_at`,
        [email, hashedPassword, 'pharmacist', false, verificationToken, tokenExpiresAt]
      );
      
      const user = userResult.rows[0];
      
      // 薬剤師レコード作成
      await db.query(
        `INSERT INTO pharmacists 
         (user_id, last_name, first_name, phone_number, address, pharmacist_license_number) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, last_name, first_name, phone_number, address, pharmacist_license_number]
      );
      
      await db.query('COMMIT');
      
      // 認証メール送信（非同期）
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      const userName = `${last_name} ${first_name}`;
      
      sendVerificationEmail(email, userName, verificationUrl)
        .catch(error => console.error('Email sending error:', error));
      
      res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        user: {
          id: user.id,
          email: user.email,
          user_type: user.user_type,
          email_verified: false,
          created_at: user.created_at
        }
      });
      
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
```

### 3.4 メール認証処理

```typescript
// routes/auth.ts
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // トークン検証
    const result = await db.query(
      `SELECT id, email, user_type, verification_token_expires_at 
       FROM users 
       WHERE verification_token = $1 AND email_verified = FALSE`,
      [token]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ 
        error: '無効な認証トークンです。または既に認証済みです。',
        code: 'INVALID_TOKEN'
      });
    }
    
    const user = result.rows[0];
    
    // トークン期限チェック
    const now = new Date();
    const expiresAt = new Date(user.verification_token_expires_at);
    
    if (now > expiresAt) {
      return res.status(400).json({ 
        error: '認証トークンの有効期限が切れています。再送信してください。',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    // メール認証完了
    await db.query(
      `UPDATE users 
       SET email_verified = TRUE, 
           verification_token = NULL, 
           verification_token_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id]
    );
    
    res.json({
      success: true,
      message: 'メール認証が完了しました。ログインしてください。',
      email: user.email,
      user_type: user.user_type
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      code: 'VERIFICATION_FAILED'
    });
  }
});
```

### 3.5 認証メール再送信

```typescript
// routes/auth.ts
import rateLimit from 'express-rate-limit';

// レート制限（15分で3回まで）
const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 3,
  message: '認証メールの再送信回数が上限に達しました。15分後に再試行してください。'
});

router.post('/resend-verification', resendLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'メールアドレスを入力してください' 
      });
    }
    
    // ユーザー検索（未認証のみ）
    const result = await db.query(
      `SELECT u.id, u.email, u.user_type,
              COALESCE(ph.last_name || ' ' || ph.first_name, p.representative_last_name || ' ' || p.representative_first_name) as name
       FROM users u
       LEFT JOIN pharmacists ph ON u.id = ph.user_id AND u.user_type = 'pharmacist'
       LEFT JOIN pharmacies p ON u.id = p.user_id AND u.user_type = 'pharmacy'
       WHERE u.email = $1 AND u.email_verified = FALSE`,
      [email]
    );
    
    if (result.rows.length === 0) {
      // セキュリティのため、存在しないメールでも同じレスポンス
      return res.json({ 
        message: '認証メールを送信しました。メールボックスをご確認ください。' 
      });
    }
    
    const user = result.rows[0];
    
    // 新しいトークン生成
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // トークン更新
    await db.query(
      `UPDATE users 
       SET verification_token = $1, 
           verification_token_expires_at = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [verificationToken, tokenExpiresAt, user.id]
    );
    
    // 認証メール再送信
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendVerificationEmail(user.email, user.name, verificationUrl);
    
    res.json({ 
      message: '認証メールを送信しました。メールボックスをご確認ください。' 
    });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      error: '認証メールの送信に失敗しました' 
    });
  }
});
```

### 3.6 ログイン時の認証チェック

```typescript
// routes/auth.ts
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ユーザー検索
    const result = await db.query(
      'SELECT id, email, password, user_type, email_verified, is_active FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'メールアドレスまたはパスワードが正しくありません' 
      });
    }
    
    const user = result.rows[0];
    
    // パスワード確認
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'メールアドレスまたはパスワードが正しくありません' 
      });
    }
    
    // メール認証チェック
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: 'メールアドレスが認証されていません。メールボックスをご確認ください。',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email
      });
    }
    
    // アカウント停止チェック
    if (!user.is_active) {
      return res.status(403).json({ 
        error: 'このアカウントは停止されています。サポートにお問い合わせください。',
        code: 'ACCOUNT_SUSPENDED'
      });
    }
    
    // JWTトークン生成
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        user_type: user.user_type 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // 最終ログイン日時更新
    await db.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
```

---

## 4. メールテンプレート一覧

### 4.1 メール送信サービス（Resend使用例）

```typescript
// services/emailService.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@example.com';
const FROM_NAME = process.env.FROM_NAME || '薬局管理システム';

// ベーステンプレート
function getEmailTemplate(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      line-height: 1.8;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 14px 35px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 13px;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
    }
    .alert {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert-danger {
      background-color: #f8d7da;
      border-left-color: #dc3545;
    }
    .alert-success {
      background-color: #d4edda;
      border-left-color: #28a745;
    }
    .info-box {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
    .url-box {
      background-color: #f8f9fa;
      padding: 12px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      word-break: break-all;
      font-size: 13px;
      color: #495057;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 薬局管理システム</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>このメールは自動送信されています。返信しないでください。</p>
      <p>お問い合わせ: <a href="mailto:support@example.com">support@example.com</a></p>
      <p>&copy; 2026 薬局管理システム. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// 1. メール認証
export async function sendVerificationEmail(
  to: string,
  userName: string,
  verificationUrl: string
): Promise<void> {
  const content = `
    <p>${userName} 様</p>
    
    <p>薬局管理システムにご登録いただきありがとうございます。</p>
    
    <p>以下のボタンをクリックして、メールアドレスを確認してください。</p>
    
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">
        メールアドレスを確認する
      </a>
    </div>
    
    <p>ボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：</p>
    <div class="url-box">${verificationUrl}</div>
    
    <div class="alert">
      <strong>⚠️ 重要</strong><br>
      このリンクの有効期限は24時間です。<br>
      期限が切れた場合は、再度認証メールを送信してください。
    </div>
    
    <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
      このメールに心当たりがない場合は、このメールを無視してください。
    </p>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: '【薬局管理システム】メールアドレスの確認',
    html: getEmailTemplate('メールアドレスの確認', content)
  });
}

// 2. 新規求人投稿通知（薬局→システム管理者）
export async function sendJobPostingNotification(
  pharmacyName: string,
  jobTitle: string,
  adminEmail: string
): Promise<void> {
  const content = `
    <p>管理者様</p>
    
    <p>新しい求人が投稿されました。</p>
    
    <div class="info-box">
      <strong>薬局名:</strong> ${pharmacyName}<br>
      <strong>求人タイトル:</strong> ${jobTitle}
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/admin/job-postings" class="button">
        求人を確認する
      </a>
    </div>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: adminEmail,
    subject: '【管理者通知】新しい求人が投稿されました',
    html: getEmailTemplate('新規求人投稿', content)
  });
}

// 3. 応募通知（薬剤師→薬局）
export async function sendApplicationNotification(
  to: string,
  pharmacyName: string,
  jobTitle: string,
  applicantName: string
): Promise<void> {
  const content = `
    <p>${pharmacyName} 様</p>
    
    <p>求人「${jobTitle}」に新しい応募がありました。</p>
    
    <div class="info-box">
      <strong>応募者:</strong> ${applicantName}
    </div>
    
    <p>応募者のプロフィールを確認して、メッセージを送信してください。</p>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/pharmacy/applications" class="button">
        応募を確認する
      </a>
    </div>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: `【薬局管理システム】新しい応募がありました - ${jobTitle}`,
    html: getEmailTemplate('新しい応募', content)
  });
}

// 4. オファー通知（薬局→薬剤師）
export async function sendOfferNotification(
  to: string,
  pharmacistName: string,
  pharmacyName: string,
  jobTitle: string
): Promise<void> {
  const content = `
    <p>${pharmacistName} 様</p>
    
    <p>${pharmacyName}から正式なオファーが届きました。</p>
    
    <div class="info-box">
      <strong>求人:</strong> ${jobTitle}<br>
      <strong>薬局:</strong> ${pharmacyName}
    </div>
    
    <p>契約内容を確認して、承認または辞退を選択してください。</p>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/pharmacist/applications" class="button">
        オファーを確認する
      </a>
    </div>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: `【薬局管理システム】${pharmacyName}から正式オファーが届きました`,
    html: getEmailTemplate('正式オファー', content)
  });
}

// 5. 契約成立通知（双方）
export async function sendContractCreatedNotification(
  to: string,
  userName: string,
  userType: 'pharmacy' | 'pharmacist',
  pharmacyName: string,
  pharmacistName: string,
  contractDetails: {
    initialWorkDate: string;
    workDays: number;
    dailyWage: number;
    totalCompensation: number;
    platformFee: number;
    paymentDeadline: string;
  }
): Promise<void> {
  const isPharma = userType === 'pharmacy';
  
  const content = `
    <p>${userName} 様</p>
    
    <div class="alert-success">
      <strong>🎉 契約が成立しました！</strong>
    </div>
    
    <p>以下の契約が成立しました。</p>
    
    <div class="info-box">
      <strong>薬局:</strong> ${pharmacyName}<br>
      <strong>薬剤師:</strong> ${pharmacistName}<br>
      <strong>初回出勤日:</strong> ${contractDetails.initialWorkDate}<br>
      <strong>勤務日数:</strong> ${contractDetails.workDays}日<br>
      <strong>日給:</strong> ${contractDetails.dailyWage.toLocaleString()}円<br>
      <strong>報酬総額:</strong> ${contractDetails.totalCompensation.toLocaleString()}円
    </div>
    
    ${isPharma ? `
    <div class="alert">
      <strong>⚠️ 重要: 手数料のお支払いについて</strong><br><br>
      <strong>お支払い金額:</strong> ${contractDetails.platformFee.toLocaleString()}円（報酬総額の40%）<br>
      <strong>お支払い期限:</strong> ${contractDetails.paymentDeadline}<br><br>
      期限までにお支払いがない場合、契約は自動的にキャンセルされます。
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/pharmacy/contracts" class="button">
        請求書を確認する
      </a>
    </div>
    ` : `
    <div class="alert">
      <strong>📋 次のステップ</strong><br><br>
      薬局が手数料を支払い、運営が確認した後、<br>
      薬局の連絡先が開示されます。<br><br>
      その後、薬局と直接連絡を取り、<br>
      詳細な勤務スケジュールを調整してください。
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/pharmacist/contracts" class="button">
        契約詳細を確認する
      </a>
    </div>
    `}
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: '【薬局管理システム】契約が成立しました',
    html: getEmailTemplate('契約成立', content)
  });
}

// 6. 支払い期限リマインダー（薬局）
export async function sendPaymentReminderNotification(
  to: string,
  pharmacyName: string,
  contractId: string,
  amount: number,
  deadline: string,
  daysRemaining: number
): Promise<void> {
  const isUrgent = daysRemaining <= 1;
  
  const content = `
    <p>${pharmacyName} 様</p>
    
    <div class="${isUrgent ? 'alert-danger' : 'alert'}">
      <strong>${isUrgent ? '🚨 緊急' : '⚠️ リマインダー'}: 手数料のお支払い期限が近づいています</strong>
    </div>
    
    <p>以下の契約の手数料支払い期限が ${daysRemaining === 0 ? '本日' : `あと${daysRemaining}日`} です。</p>
    
    <div class="info-box">
      <strong>契約ID:</strong> ${contractId}<br>
      <strong>お支払い金額:</strong> ${amount.toLocaleString()}円<br>
      <strong>お支払い期限:</strong> ${deadline}
    </div>
    
    <div class="alert-danger">
      <strong>⚠️ 重要</strong><br>
      期限までにお支払いがない場合、契約は自動的にキャンセルされ、<br>
      ペナルティが適用されます。
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/pharmacy/payments" class="button">
        お支払い手続きへ
      </a>
    </div>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: `【重要】手数料のお支払い期限が${daysRemaining === 0 ? '本日' : `あと${daysRemaining}日`}です`,
    html: getEmailTemplate('支払い期限リマインダー', content)
  });
}

// 7. 支払い確認完了通知（双方）
export async function sendPaymentConfirmedNotification(
  to: string,
  userName: string,
  userType: 'pharmacy' | 'pharmacist',
  pharmacyName: string,
  pharmacistName: string,
  contactInfo: {
    name: string;
    phone: string;
    email: string;
    address?: string;
  }
): Promise<void> {
  const isPharma = userType === 'pharmacy';
  
  const content = `
    <p>${userName} 様</p>
    
    <div class="alert-success">
      <strong>✅ 手数料の支払いが確認されました</strong>
    </div>
    
    <p>${isPharma ? '薬剤師' : '薬局'}の連絡先を開示いたします。</p>
    
    <div class="info-box">
      <strong>${isPharma ? '薬剤師' : '薬局'}:</strong> ${isPharma ? pharmacistName : pharmacyName}<br>
      <strong>電話番号:</strong> ${contactInfo.phone}<br>
      <strong>メールアドレス:</strong> ${contactInfo.email}
      ${contactInfo.address ? `<br><strong>住所:</strong> ${contactInfo.address}` : ''}
    </div>
    
    <div class="alert">
      <strong>📞 次のステップ</strong><br><br>
      直接連絡を取り、詳細な勤務スケジュール（勤務曜日、勤務時間など）を<br>
      調整してください。
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/${userType}/contracts" class="button">
        契約詳細を確認する
      </a>
    </div>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: '【薬局管理システム】連絡先を開示しました',
    html: getEmailTemplate('連絡先開示', content)
  });
}

// 8. 契約キャンセル通知（双方）
export async function sendContractCancelledNotification(
  to: string,
  userName: string,
  reason: string,
  contractId: string
): Promise<void> {
  const content = `
    <p>${userName} 様</p>
    
    <div class="alert-danger">
      <strong>❌ 契約がキャンセルされました</strong>
    </div>
    
    <p>以下の契約がキャンセルされました。</p>
    
    <div class="info-box">
      <strong>契約ID:</strong> ${contractId}<br>
      <strong>キャンセル理由:</strong> ${reason}
    </div>
    
    <p>ご不明な点がございましたら、サポートまでお問い合わせください。</p>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: '【薬局管理システム】契約がキャンセルされました',
    html: getEmailTemplate('契約キャンセル', content)
  });
}

// 9. ペナルティ適用通知（薬局）
export async function sendPenaltyNotification(
  to: string,
  pharmacyName: string,
  penaltyType: string,
  reason: string,
  unpaidAmount: number
): Promise<void> {
  const content = `
    <p>${pharmacyName} 様</p>
    
    <div class="alert-danger">
      <strong>⚠️ ペナルティが適用されました</strong>
    </div>
    
    <p>手数料の未払いにより、以下のペナルティが適用されました。</p>
    
    <div class="info-box">
      <strong>ペナルティ種類:</strong> ${penaltyType}<br>
      <strong>理由:</strong> ${reason}<br>
      <strong>未払い金額:</strong> ${unpaidAmount.toLocaleString()}円
    </div>
    
    <div class="alert">
      <strong>現在の制限</strong><br>
      ❌ 新規求人投稿が停止されました<br>
      ❌ 既存の求人が一時停止されました<br>
      ❌ 薬剤師への連絡が制限されました
    </div>
    
    <p><strong>ペナルティの解除方法:</strong></p>
    <ol>
      <li>未払いの手数料をお支払いください</li>
      <li>システムから解除申請を行ってください</li>
      <li>運営による審査後、解除されます</li>
    </ol>
    
    <div class="alert-danger">
      <strong>⚠️ 重要な注意事項</strong><br>
      これは1回目のペナルティです。<br>
      2回目の未払いでアカウントが永久停止されます。
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/pharmacy/penalties" class="button">
        ペナルティ詳細を確認
      </a>
    </div>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: '【重要】ペナルティが適用されました',
    html: getEmailTemplate('ペナルティ適用', content)
  });
}

// 10. ペナルティ解除通知（薬局）
export async function sendPenaltyResolvedNotification(
  to: string,
  pharmacyName: string
): Promise<void> {
  const content = `
    <p>${pharmacyName} 様</p>
    
    <div class="alert-success">
      <strong>✅ ペナルティが解除されました</strong>
    </div>
    
    <p>手数料のお支払いを確認いたしました。<br>
    ペナルティを解除し、アカウントを復旧いたしました。</p>
    
    <div class="info-box">
      <strong>復旧した機能:</strong><br>
      ✅ 新規求人投稿が可能になりました<br>
      ✅ 既存求人が再開されました<br>
      ✅ 通常機能がご利用可能です
    </div>
    
    <div class="alert">
      <strong>⚠️ 今後のご注意</strong><br>
      これは1回目のペナルティでした。<br>
      2回目の未払いでアカウントが永久停止されます。<br>
      支払い期限を厳守いただきますようお願いいたします。
    </div>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/pharmacy/dashboard" class="button">
        ダッシュボードへ
      </a>
    </div>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: '【薬局管理システム】ペナルティが解除されました',
    html: getEmailTemplate('ペナルティ解除', content)
  });
}

// 11. 証明書承認通知（薬剤師）
export async function sendCertificateApprovedNotification(
  to: string,
  pharmacistName: string
): Promise<void> {
  const content = `
    <p>${pharmacistName} 様</p>
    
    <div class="alert-success">
      <strong>✅ 資格証明書が承認されました</strong>
    </div>
    
    <p>薬剤師免許証と保険薬剤師登録票の確認が完了しました。</p>
    
    <p>求人への応募が可能になりました。<br>
    条件に合った求人を探して、ぜひ応募してください。</p>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/pharmacist/job-postings" class="button">
        求人を探す
      </a>
    </div>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: '【薬局管理システム】資格証明書が承認されました',
    html: getEmailTemplate('証明書承認', content)
  });
}

// 12. 証明書差し戻し通知（薬剤師）
export async function sendCertificateRejectedNotification(
  to: string,
  pharmacistName: string,
  reason: string
): Promise<void> {
  const content = `
    <p>${pharmacistName} 様</p>
    
    <div class="alert-danger">
      <strong>⚠️ 資格証明書が差し戻されました</strong>
    </div>
    
    <p>申し訳ございませんが、提出いただいた資格証明書に不備がありました。</p>
    
    <div class="info-box">
      <strong>差し戻し理由:</strong><br>
      ${reason}
    </div>
    
    <p>お手数ですが、修正の上、再度アップロードしてください。</p>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/pharmacist/profile/certificates" class="button">
        証明書を再アップロード
      </a>
    </div>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: '【薬局管理システム】資格証明書の再提出をお願いします',
    html: getEmailTemplate('証明書差し戻し', content)
  });
}

// 13. パスワードリセット
export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetUrl: string
): Promise<void> {
  const content = `
    <p>${userName} 様</p>
    
    <p>パスワードリセットのリクエストを受け付けました。</p>
    
    <p>以下のボタンをクリックして、新しいパスワードを設定してください。</p>
    
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">
        パスワードをリセット
      </a>
    </div>
    
    <p>ボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：</p>
    <div class="url-box">${resetUrl}</div>
    
    <div class="alert">
      <strong>⚠️ 重要</strong><br>
      このリンクの有効期限は1時間です。<br>
      期限が切れた場合は、再度パスワードリセットをリクエストしてください。
    </div>
    
    <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
      このメールに心当たりがない場合は、このメールを無視してください。<br>
      パスワードは変更されません。
    </p>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: '【薬局管理システム】パスワードリセットのご案内',
    html: getEmailTemplate('パスワードリセット', content)
  });
}

// 14. メッセージ通知
export async function sendMessageNotification(
  to: string,
  userName: string,
  senderName: string,
  messagePreview: string,
  applicationUrl: string
): Promise<void> {
  const content = `
    <p>${userName} 様</p>
    
    <p>${senderName}からメッセージが届きました。</p>
    
    <div class="info-box">
      <strong>メッセージプレビュー:</strong><br>
      ${messagePreview}
    </div>
    
    <div style="text-align: center;">
      <a href="${applicationUrl}" class="button">
        メッセージを確認する
      </a>
    </div>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: `【薬局管理システム】${senderName}からメッセージが届きました`,
    html: getEmailTemplate('新着メッセージ', content)
  });
}

// 15. システムメンテナンス通知
export async function sendMaintenanceNotification(
  to: string,
  userName: string,
  startTime: string,
  endTime: string,
  description: string
): Promise<void> {
  const content = `
    <p>${userName} 様</p>
    
    <p>システムメンテナンスのお知らせです。</p>
    
    <div class="info-box">
      <strong>メンテナンス日時:</strong><br>
      ${startTime} 〜 ${endTime}<br><br>
      <strong>内容:</strong><br>
      ${description}
    </div>
    
    <div class="alert">
      <strong>⚠️ ご注意</strong><br>
      メンテナンス中はシステムをご利用いただけません。<br>
      ご不便をおかけしますが、ご理解とご協力をお願いいたします。
    </div>
  `;
  
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject: '【薬局管理システム】システムメンテナンスのお知らせ',
    html: getEmailTemplate('メンテナンス通知', content)
  });
}
```

---

## 5. フロントエンド実装

### 5.1 登録完了画面

```tsx
// pages/RegisterSuccess.tsx
import { useLocation } from 'react-router-dom';

export default function RegisterSuccess() {
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-4">登録完了</h1>
        
        <p className="text-gray-600 mb-4">
          確認メールを送信しました。
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>{email}</strong> に送信された<br />
            確認リンクをクリックしてください。
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-left">
          <p className="font-bold mb-2">📧 メールが届かない場合:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>迷惑メールフォルダをご確認ください</li>
            <li>メールアドレスが正しいかご確認ください</li>
            <li>しばらく待ってから再送信してください</li>
          </ul>
        </div>
        
        <button 
          onClick={() => window.location.href = '/resend-verification'}
          className="mt-4 text-blue-600 hover:underline"
        >
          確認メールを再送信
        </button>
      </div>
    </div>
  );
}
```

### 5.2 メール認証画面

```tsx
// pages/VerifyEmail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`/api/auth/verify-email/${token}`);
        
        setStatus('success');
        setMessage(response.data.message);
        
        // 3秒後にログイン画面へリダイレクト
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'メール認証が完了しました。ログインしてください。' 
            } 
          });
        }, 3000);
        
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed');
        setErrorCode(error.response?.data?.code || '');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      {status === 'loading' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">メール認証中...</h2>
          <p className="text-gray-600">しばらくお待ちください。</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            メール認証完了
          </h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <p className="text-sm text-gray-500">
            ログイン画面に移動します...
          </p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">認証失敗</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {errorCode === 'TOKEN_EXPIRED' && (
            <button
              onClick={() => navigate('/resend-verification')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              認証メールを再送信
            </button>
          )}
          
          <button
            onClick={() => navigate('/login')}
            className="mt-2 text-gray-600 hover:underline block"
          >
            ログイン画面へ
          </button>
        </div>
      )}
    </div>
  );
}
```

### 5.3 認証メール再送信画面

```tsx
// pages/ResendVerification.tsx
import { useState } from 'react';
import axios from 'axios';

export default function ResendVerification() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await axios.post('/api/auth/resend-verification', { email });
      setStatus('success');
      setMessage(response.data.message);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || '送信に失敗しました');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">認証メールを再送信</h1>
      
      {status === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <p className="text-green-800">✅ {message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="your-email@example.com"
            />
          </div>

          {status === 'error' && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded p-3 text-red-800">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {status === 'loading' ? '送信中...' : '再送信する'}
          </button>
        </form>
      )}
    </div>
  );
}
```

---

## 6. メールサービス選択ガイド

### 6.1 推奨サービス比較

| サービス | 無料枠 | 価格 | 信頼性 | 設定難易度 | おすすめ度 |
|---------|-------|------|--------|-----------|----------|
| **Resend** | 100通/日 | $20/月〜 | ⭐⭐⭐⭐⭐ | ⭐ 簡単 | ★★★★★ |
| SendGrid | 100通/日 | $15/月〜 | ⭐⭐⭐⭐⭐ | ⭐⭐ 普通 | ★★★★☆ |
| AWS SES | なし | $0.10/1000通 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ 難 | ★★★☆☆ |
| Mailgun | 100通/日 | $35/月〜 | ⭐⭐⭐⭐ | ⭐⭐ 普通 | ★★★☆☆ |
| Nodemailer | - | SMTP次第 | ⭐⭐⭐ | ⭐⭐⭐⭐ 難 | ★★☆☆☆ |

### 6.2 Resend（推奨）

```bash
npm install resend
```

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: 'user@example.com',
  subject: 'Hello',
  html: '<p>Hello World</p>'
});
```

**メリット:**
- 開発者フレンドリー
- シンプルなAPI
- React Email対応
- 無料枠が十分

### 6.3 SendGrid

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: 'user@example.com',
  from: 'noreply@yourdomain.com',
  subject: 'Hello',
  html: '<p>Hello World</p>'
});
```

**メリット:**
- 業界標準
- 高い信頼性
- 豊富な機能

---

## 7. セキュリティ対策

### 7.1 トークン生成

```typescript
// ✅ 推奨: crypto.randomBytes
import crypto from 'crypto';
const token = crypto.randomBytes(32).toString('hex');

// ❌ 非推奨: Math.random()（予測可能）
const token = Math.random().toString(36);
```

### 7.2 トークン有効期限

```typescript
// メール認証: 24時間
const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

// パスワードリセット: 1時間（より短く）
const passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
```

### 7.3 レート制限

```typescript
import rateLimit from 'express-rate-limit';

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 3, // 最大3回
  message: 'Too many requests. Please try again later.'
});

router.post('/resend-verification', emailLimiter, handler);
```

### 7.4 HTTPS必須

```typescript
// production環境ではHTTPSを強制
if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
  return res.redirect('https://' + req.get('host') + req.url);
}
```

---

## 8. 実装チェックリスト

### 8.1 データベース

```
□ usersテーブルに認証カラムを追加
  □ email_verified (boolean)
  □ verification_token (varchar)
  □ verification_token_expires_at (timestamp)
  □ reset_password_token (varchar)
  □ reset_password_token_expires_at (timestamp)

□ インデックスを作成
  □ verification_token
  □ reset_password_token
```

### 8.2 バックエンド

```
□ メール送信サービスを選択・設定
  □ Resend / SendGrid / その他
  □ 環境変数設定

□ 認証エンドポイントを実装
  □ POST /auth/register/* (トークン生成・メール送信)
  □ GET /auth/verify-email/:token
  □ POST /auth/resend-verification

□ ログイン時の認証チェック
  □ email_verifiedがfalseならログイン拒否

□ メールテンプレート作成
  □ メール認証
  □ パスワードリセット
  □ その他業務メール（15種類）

□ エラーハンドリング
  □ トークン期限切れ
  □ 無効なトークン
  □ メール送信失敗

□ セキュリティ対策
  □ crypto.randomBytes使用
  □ レート制限実装
  □ HTTPS強制
```

### 8.3 フロントエンド

```
□ 登録完了画面
  □ メール送信成功メッセージ
  □ 再送信リンク

□ メール認証画面
  □ ローディング表示
  □ 成功時の自動リダイレクト
  □ エラー時の再送信ボタン

□ 認証メール再送信画面
  □ メールアドレス入力フォーム
  □ レート制限エラー表示

□ ログイン画面
  □ 未認証エラーメッセージ
  □ 再送信リンク
```

### 8.4 テスト

```
□ メール認証フロー
  □ 正常な認証
  □ トークン期限切れ
  □ 無効なトークン
  □ 既に認証済み

□ メール再送信
  □ 正常な再送信
  □ レート制限
  □ 存在しないメール

□ ログイン
  □ 未認証でのログイン試行
  □ 認証後のログイン
```

---

## 9. トラブルシューティング

### 9.1 メールが届かない

**原因と対策:**
```
1. SPF/DKIM/DMARC設定が不適切
   → DNSレコードを正しく設定

2. 迷惑メールフィルター
   → 信頼性の高いメールサービス使用
   → From アドレスを独自ドメインに

3. メール送信サービスの制限
   → 無料枠を超えていないか確認
   → APIキーが正しいか確認
```

### 9.2 トークンが無効

**原因と対策:**
```
1. トークンの期限切れ
   → 再送信機能を案内

2. トークンが既に使用済み
   → email_verifiedがtrueか確認
   → 既に認証済みメッセージ表示

3. データベースの問題
   → トークンが正しく保存されているか確認
```

---

以上、メール認証・メール機能設計書
