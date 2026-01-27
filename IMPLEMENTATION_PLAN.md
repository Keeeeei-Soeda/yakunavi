# 薬局管理システム：実装計画書（更新版）

## 🎯 優先度変更：ダッシュボード最優先

**変更点**: 薬局側・薬剤師側のダッシュボードを最優先フェーズに移動

---

## 🏗️ 技術スタック（xserver VPS対応）

### フロントエンド
```
✅ Framework: Next.js 14 (App Router)
✅ Language: TypeScript
✅ Styling: Tailwind CSS
✅ State Management: Zustand
✅ Form Handling: React Hook Form + Zod
✅ API Client: Axios
✅ Date: date-fns
✅ Notifications: react-hot-toast
✅ Charts: Recharts (ダッシュボード用)
```

### バックエンド
```
✅ Runtime: Node.js 20+
✅ Framework: Express.js
✅ Language: TypeScript
✅ Database: PostgreSQL 14+ (xserver VPS内)
✅ ORM: Prisma
✅ Authentication: JWT
✅ Validation: Zod
✅ File Upload: Multer + ローカルストレージ（後でS3移行可）
✅ Email: Resend
✅ PDF Generation: puppeteer or pdfkit
✅ Task Queue: node-cron (バッチ処理)
✅ Process Manager: PM2 (xserver VPS用)
```

### インフラ（xserver VPS）
```
✅ Server: xserver VPS
✅ Web Server: Nginx (リバースプロキシ)
✅ Database: PostgreSQL (VPS内)
✅ SSL: Let's Encrypt (無料)
✅ Domain: 任意のドメイン
✅ Process Manager: PM2
```

---

## 📁 プロジェクト構造

```
yaku_navi/
├── docs/                    # 設計書（既存）
├── pharmacy_UI/            # 薬局側UIデザイン画像
├── pharmacust_UI/          # 薬剤師側UIデザイン画像
│
├── frontend/                # Next.js フロントエンド
│   ├── app/
│   │   ├── (auth)/         # 認証関連ページ
│   │   ├── pharmacy/       # 薬局側ページ
│   │   │   └── dashboard/  # ダッシュボード（優先）
│   │   ├── pharmacist/     # 薬剤師側ページ
│   │   │   └── dashboard/  # ダッシュボード（優先）
│   │   └── admin/          # 管理者ページ
│   ├── components/
│   │   ├── dashboard/      # ダッシュボードコンポーネント
│   │   └── common/         # 共通コンポーネント
│   ├── lib/
│   └── types/
│
├── backend/                 # Express.js バックエンド
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── cron/           # バッチ処理
│   ├── prisma/
│   └── uploads/            # ファイルアップロード（一時）
│
└── deployment/              # デプロイ設定
    ├── nginx.conf           # Nginx設定
    ├── ecosystem.config.js  # PM2設定
    └── deploy.sh            # デプロイスクリプト
```

---

## 🚀 実装フェーズ（更新版：ダッシュボード優先）

### **フェーズ1: 基盤構築 + ダッシュボード（1-2週間）** ⭐ 最優先

#### 1.1 開発環境セットアップ
- [ ] プロジェクトディレクトリ作成
- [ ] Git リポジトリ初期化
- [ ] Frontend: Next.js + TypeScript セットアップ
- [ ] Backend: Express + TypeScript セットアップ
- [ ] Prisma セットアップ
- [ ] 環境変数設定（.env）

#### 1.2 データベース構築
- [ ] PostgreSQL データベース作成
- [ ] Prismaスキーマ作成（database_design.mdベース）
- [ ] マイグレーション実行
- [ ] シードデータ作成（ダッシュボード表示用のテストデータ含む）

#### 1.3 認証システム（最小限）
- [ ] JWT認証実装
- [ ] ユーザー登録API（薬局・薬剤師）
- [ ] ログインAPI
- [ ] メール認証機能（簡易版）

#### 1.4 **薬局側ダッシュボード** ⭐ 最優先
- [ ] ダッシュボードAPI（統計データ取得）
  - [ ] 現在募集中の案件数
  - [ ] 応募された薬剤師数
  - [ ] 現在の採用数
  - [ ] 契約書確認待ち件数
- [ ] ダッシュボードUI実装
  - [ ] サマリーカード（4つ）
  - [ ] 最近の応募一覧（直近5件）
  - [ ] アクティブな求人一覧
  - [ ] クイックアクション
- [ ] 通知機能（基本）

#### 1.5 **薬剤師側ダッシュボード** ⭐ 最優先
- [ ] ダッシュボードAPI（統計データ取得）
  - [ ] 応募中の求人数
  - [ ] 契約中の薬局数
  - [ ] 未読メッセージ数
- [ ] ダッシュボードUI実装
  - [ ] サマリーカード（3つ）
  - [ ] 最近の通知
  - [ ] クイックアクション
  - [ ] 進行中の応募一覧

---

### **フェーズ2: 薬剤師側機能（2-3週間）**

#### 2.1 プロフィール管理
- [ ] プロフィール閲覧・編集画面
- [ ] 資格証明書アップロード機能
- [ ] プロフィール入力フォーム

#### 2.2 求人検索・応募
- [ ] 求人一覧表示
- [ ] 求人検索・フィルタリング
- [ ] 求人詳細表示
- [ ] 応募機能
- [ ] 応募一覧表示

#### 2.3 メッセージング
- [ ] メッセージ一覧表示
- [ ] メッセージ送受信
- [ ] 初回出勤日選択機能
- [ ] 正式オファー確認・承認

#### 2.4 契約管理
- [ ] 契約一覧表示
- [ ] 契約詳細表示
- [ ] 労働条件通知書ダウンロード

---

### **フェーズ3: 薬局側機能（2-3週間）**

#### 3.1 プロフィール管理
- [ ] 薬局プロフィール閲覧・編集

#### 3.2 求人管理
- [ ] 求人投稿フォーム
- [ ] 求人一覧・編集・削除
- [ ] 求人公開・停止

#### 3.3 応募管理
- [ ] 応募一覧表示
- [ ] 応募者プロフィール閲覧（個人情報非表示）
- [ ] 応募ステータス管理

#### 3.4 メッセージング
- [ ] メッセージ一覧
- [ ] メッセージ送受信
- [ ] 初回出勤日候補提示
- [ ] 正式オファー送信

#### 3.5 契約・支払い管理
- [ ] 契約一覧・詳細
- [ ] 請求書一覧・詳細・ダウンロード
- [ ] 支払い報告機能
- [ ] ペナルティ表示・解除申請

---

### **フェーズ4: 管理者側機能（2週間）**

#### 4.1 ダッシュボード
- [ ] サマリーカード表示
- [ ] 統計情報表示
- [ ] 最近のアクティビティ

#### 4.2 ユーザー管理
- [ ] 薬局一覧・詳細
- [ ] 薬剤師一覧・詳細
- [ ] アカウント停止・有効化

#### 4.3 資格証明書管理（重要）
- [ ] 証明書確認待ち一覧
- [ ] 証明書PDF表示
- [ ] 承認・差し戻し機能

#### 4.4 支払い管理（重要）
- [ ] 支払い確認待ち一覧
- [ ] 支払い確認・承認
- [ ] 支払い履歴

#### 4.5 契約・ペナルティ管理
- [ ] 契約一覧・詳細
- [ ] ペナルティ一覧
- [ ] ペナルティ解除審査

---

### **フェーズ5: 書類生成・メール機能（1-2週間）**

#### 5.1 PDF生成
- [ ] 労働条件通知書PDF生成
- [ ] 請求書PDF生成
- [ ] 契約書PDF生成

#### 5.2 メール機能
- [ ] メール認証メール
- [ ] 応募通知メール
- [ ] オファー通知メール
- [ ] 契約成立メール
- [ ] 支払い期限リマインダー
- [ ] その他業務メール

---

### **フェーズ6: バッチ処理・通知（1週間）**

#### 6.1 バッチ処理
- [ ] 支払い期限超過チェック（日次）
- [ ] 契約自動キャンセル
- [ ] ペナルティ自動適用
- [ ] 支払い期限リマインダー送信

#### 6.2 通知システム
- [ ] システム内通知表示
- [ ] 通知既読管理

---

### **フェーズ7: xserver VPSデプロイ（1週間）**

#### 7.1 サーバーセットアップ
- [ ] xserver VPS初期設定
- [ ] Node.js 20+ インストール
- [ ] PostgreSQL インストール・設定
- [ ] Nginx インストール・設定
- [ ] PM2 インストール
- [ ] SSL証明書設定（Let's Encrypt）

#### 7.2 アプリケーションデプロイ
- [ ] データベースマイグレーション実行
- [ ] Backend デプロイ（PM2で起動）
- [ ] Frontend ビルド・デプロイ
- [ ] Nginx設定（リバースプロキシ）
- [ ] 環境変数設定

#### 7.3 監視・メンテナンス
- [ ] PM2監視設定
- [ ] ログ設定
- [ ] バックアップ設定

---

### **フェーズ8: テスト・デバッグ（1-2週間）**

- [ ] 単体テスト
- [ ] 統合テスト
- [ ] E2Eテスト
- [ ] ユーザー受入テスト（UAT）
- [ ] セキュリティテスト
- [ ] パフォーマンステスト

---

## 📊 ダッシュボード実装詳細

### 薬局側ダッシュボード API

```typescript
// GET /api/pharmacy/dashboard
{
  summary: {
    activeJobPostings: number,      // 現在募集中の案件
    totalApplications: number,        // 応募された薬剤師数
    activeContracts: number,         // 現在の採用数
    pendingContracts: number         // 契約書確認待ち
  },
  recentApplications: [
    {
      id: number,
      pharmacistName: string,
      jobTitle: string,
      appliedAt: string,
      status: string
    }
  ],
  activeJobPostings: [
    {
      id: number,
      title: string,
      applicationCount: number,
      deadline: string,
      status: string
    }
  ],
  notifications: [
    {
      id: number,
      type: string,
      title: string,
      message: string,
      isRead: boolean,
      createdAt: string
    }
  ]
}
```

### 薬剤師側ダッシュボード API

```typescript
// GET /api/pharmacist/dashboard
{
  summary: {
    activeApplications: number,     // 応募中の求人
    activeContracts: number,          // 契約中の薬局
    unreadMessages: number           // 未読メッセージ
  },
  recentNotifications: [
    {
      id: number,
      type: string,
      title: string,
      message: string,
      isRead: boolean,
      createdAt: string
    }
  ],
  activeApplications: [
    {
      id: number,
      jobTitle: string,
      pharmacyName: string,
      status: string,
      appliedAt: string
    }
  ]
}
```

---

## 🛠️ xserver VPS セットアップ手順

### 1. サーバー初期設定

```bash
# SSH接続
ssh root@your-vps-ip

# システム更新
apt update && apt upgrade -y

# Node.js 20 インストール
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PostgreSQL インストール
apt install -y postgresql postgresql-contrib

# Nginx インストール
apt install -y nginx

# PM2 インストール
npm install -g pm2

# Git インストール
apt install -y git
```

### 2. PostgreSQL セットアップ

```bash
# PostgreSQLユーザー作成
sudo -u postgres psql
CREATE USER pharmacy_user WITH PASSWORD 'your_password';
CREATE DATABASE pharmacy_db OWNER pharmacy_user;
\q
```

### 3. アプリケーションデプロイ

```bash
# アプリケーションディレクトリ作成
mkdir -p /var/www/yaku_navi
cd /var/www/yaku_navi

# リポジトリクローン
git clone your-repo-url .

# 依存関係インストール
cd backend && npm install
cd ../frontend && npm install

# 環境変数設定
nano backend/.env
nano frontend/.env.local

# データベースマイグレーション
cd backend
npx prisma migrate deploy
npx prisma generate

# PM2で起動
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Nginx設定

```nginx
# /etc/nginx/sites-available/yaku_navi
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. SSL証明書設定

```bash
# Certbot インストール
apt install -y certbot python3-certbot-nginx

# SSL証明書取得
certbot --nginx -d your-domain.com

# 自動更新設定
certbot renew --dry-run
```

---

## 📝 次のアクション

**即座に開始する作業**:

1. ✅ プロジェクト構造作成
2. ✅ Frontend/Backend セットアップ
3. ✅ データベース構築
4. ✅ **ダッシュボードAPI実装（最優先）**
5. ✅ **ダッシュボードUI実装（最優先）**

準備ができ次第、実装を開始しますか？

