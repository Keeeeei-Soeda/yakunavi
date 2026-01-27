# 薬局管理システム (Yaku Navi)

薬剤師と薬局のマッチングプラットフォーム

## プロジェクト構成

```
yaku_navi/
├── backend/         # Express + TypeScript バックエンドAPI
├── frontend/        # Next.js 14 + TypeScript フロントエンド
├── shared/          # 共通の型定義やユーティリティ
└── docs/            # 設計ドキュメント
```

## 技術スタック

### バックエンド
- **言語**: TypeScript
- **フレームワーク**: Express.js
- **データベース**: PostgreSQL 14+
- **ORM**: Prisma
- **認証**: JWT
- **バリデーション**: Zod
- **メール送信**: Resend
- **ファイルアップロード**: Multer
- **プロセス管理**: PM2

### フロントエンド
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **フォーム**: React Hook Form + Zod
- **HTTP クライアント**: Axios
- **アイコン**: Lucide React
- **日付処理**: date-fns

## セットアップ手順

### 1. 必要な環境

- Node.js 20+
- PostgreSQL 14+
- npm または yarn

### 2. データベースのセットアップ

```bash
# PostgreSQLにログイン
psql -U postgres

# データベースとユーザーを作成
CREATE DATABASE pharmacy_db;
CREATE USER pharmacy_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pharmacy_db TO pharmacy_user;
```

### 3. バックエンドのセットアップ

```bash
# バックエンドディレクトリに移動
cd backend

# 依存関係のインストール
npm install

# 環境変数ファイルを作成
cp .env.example .env

# .envファイルを編集して、データベース接続情報などを設定
# DATABASE_URL="postgresql://pharmacy_user:your_password@localhost:5432/pharmacy_db?schema=public"
# JWT_SECRET=your-secret-key

# Prismaクライアントの生成
npm run prisma:generate

# データベースマイグレーション
npm run prisma:migrate

# 開発サーバーの起動
npm run dev
```

バックエンドは `http://localhost:5000` で起動します。

### 4. フロントエンドのセットアップ

```bash
# フロントエンドディレクトリに移動
cd frontend

# 依存関係のインストール
npm install

# 環境変数ファイルを作成（必要に応じて）
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# 開発サーバーの起動
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

## 主要機能

### 実装済み機能

#### ✅ フェーズ1: 基盤構築 + ダッシュボード

1. **プロジェクト構造作成**
   - Backend (Express + TypeScript)
   - Frontend (Next.js 14 + TypeScript)
   - Prismaスキーマ

2. **薬局側ダッシュボード** 🎉
   - 統計サマリーカード（アクティブ求人、総応募数、契約数）
   - 最近の応募一覧
   - アクティブ求人一覧
   - 月別応募統計API

3. **薬剤師側ダッシュボード** 🎉
   - 統計サマリーカード（進行中の応募、契約数、未読メッセージ）
   - 最近の通知一覧
   - 進行中の応募一覧
   - 進行中の契約一覧

### 今後の実装予定

#### フェーズ2: 認証・ユーザー管理
- ユーザー登録（薬局・薬剤師）
- ログイン・ログアウト
- メール認証
- パスワードリセット
- プロフィール管理

#### フェーズ3: 求人・応募機能
- 求人投稿（薬局側）
- 求人検索・フィルタリング（薬剤師側）
  - **都道府県**フィルター
  - **日給**範囲フィルター
- 求人詳細表示
- 応募機能
- 応募管理

#### フェーズ4: メッセージ・契約機能
- メッセージング機能
- 契約作成・管理
- 契約書PDF生成
- 支払い管理

#### フェーズ5: 管理者機能
- ユーザー管理
- 証明書確認
- ペナルティ管理
- システム設定

## API エンドポイント

### 薬局向けAPI

- `GET /api/pharmacy/dashboard/:pharmacyId/stats` - ダッシュボード統計
- `GET /api/pharmacy/dashboard/:pharmacyId/recent-applications` - 最近の応募
- `GET /api/pharmacy/dashboard/:pharmacyId/active-job-postings` - アクティブ求人
- `GET /api/pharmacy/dashboard/:pharmacyId/monthly-stats` - 月別統計

### 薬剤師向けAPI

- `GET /api/pharmacist/dashboard/:pharmacistId/stats` - ダッシュボード統計
- `GET /api/pharmacist/dashboard/notifications` - 通知一覧
- `GET /api/pharmacist/dashboard/:pharmacistId/active-applications` - 進行中の応募
- `GET /api/pharmacist/dashboard/:pharmacistId/active-contracts` - 進行中の契約
- `GET /api/pharmacist/dashboard/:pharmacistId/application-history` - 応募履歴統計

## データベーススキーマ

主要なテーブル：

- `users` - ユーザー認証情報
- `pharmacies` - 薬局情報
- `pharmacists` - 薬剤師情報
- `job_postings` - 求人投稿
- `applications` - 応募
- `messages` - メッセージ
- `contracts` - 契約
- `payments` - 支払い
- `documents` - 書類
- `penalties` - ペナルティ
- `notifications` - 通知

詳細は `database_design.md` を参照してください。

## 開発ガイドライン

### コーディング規約

- TypeScriptの型定義を必ず使用
- ESLintとPrettierの設定に従う
- コンポーネントは機能ごとに分割
- APIリクエストはserviceレイヤーで管理

### ディレクトリ構造

#### バックエンド
```
backend/
├── src/
│   ├── routes/          # ルート定義
│   ├── controllers/     # コントローラー
│   ├── services/        # ビジネスロジック
│   ├── middleware/      # ミドルウェア
│   ├── utils/           # ユーティリティ
│   └── types/           # 型定義
├── prisma/
│   └── schema.prisma    # Prismaスキーマ
└── uploads/             # アップロードファイル
```

#### フロントエンド
```
frontend/
├── app/                 # Next.js App Router
│   ├── pharmacy/        # 薬局向けページ
│   ├── pharmacist/      # 薬剤師向けページ
│   └── admin/           # 管理者向けページ
├── components/          # Reactコンポーネント
│   ├── common/          # 共通コンポーネント
│   ├── pharmacy/        # 薬局向けコンポーネント
│   └── pharmacist/      # 薬剤師向けコンポーネント
└── lib/
    ├── api/             # APIクライアント
    ├── store/           # 状態管理 (Zustand)
    ├── types/           # 型定義
    └── utils/           # ユーティリティ
```

## デプロイ

### xserver VPSへのデプロイ

詳細な手順は `IMPLEMENTATION_PLAN.md` の「xserver VPS セットアップ手順」を参照してください。

1. Node.js、PostgreSQL、Nginx、PM2のインストール
2. PostgreSQLデータベースのセットアップ
3. アプリケーションのデプロイ
4. Nginxの設定
5. SSL証明書の設定（Let's Encrypt）
6. PM2でのプロセス管理

## ライセンス

Proprietary - すべての権利は予約されています

## 連絡先

プロジェクトに関する質問や問題がある場合は、開発チームにお問い合わせください。

