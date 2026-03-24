# 管理者システム 完全ガイド

管理者機能・ログイン情報・運用・トラブルシューティングをまとめたドキュメントです。

---

## 🔐 管理者ログイン情報

### メイン管理者アカウント
```
メールアドレス: admin@yaku-navi.com
パスワード: Admin@2026!
ユーザーID: 24
```

### サポート管理者アカウント
```
メールアドレス: support@yaku-navi.com
パスワード: Support@2026!
ユーザーID: 25
```

### ログインURL
- **開発環境**: http://localhost:3000/admin/auth/login
- **本番環境**: https://yaku-navi.com/admin/auth/login

> ⚠️ **重要**: 認証情報は厳重に管理し、初回ログイン後にパスワード変更を推奨します。

---

## ログイン方法

1. 上記URLにアクセス
2. メールアドレスとパスワードを入力
3. 「管理者としてログイン」をクリック
4. ダッシュボードにリダイレクトされます

---

## 管理者機能一覧

| 機能 | URL | 説明 |
|------|-----|------|
| ダッシュボード | `/admin/dashboard` | 統計情報とサマリー |
| 薬剤師管理 | `/admin/pharmacists` | 薬剤師アカウント一覧・管理 |
| 薬局管理 | `/admin/pharmacies` | 薬局アカウント一覧・管理 |
| 証明書管理 | `/admin/certificates` | 資格証明書の確認・承認 |
| 契約管理 | `/admin/contracts` | 契約一覧・詳細 |
| 支払い管理 | `/admin/payments` | 支払い報告の確認 |
| ペナルティ管理 | `/admin/penalties` | ペナルティの管理・解除 |

### 主な機能概要
- **ダッシュボード**: 登録薬局数・薬剤師数、アクティブ求人数、契約成立数、未確認証明書数・未確認支払い数
- **薬剤師/薬局管理**: 一覧・検索・フィルター、アカウント有効化/停止
- **証明書管理**: 未確認証明書一覧、承認・差し戻し、PDF表示
- **契約・支払い・ペナルティ**: 一覧・ステータスフィルター・確認・解除

---

## 実装内容サマリー

### バックエンド
- 認証ミドルウェア（`authenticateAdmin`）
- 管理者サービス・コントローラー・ルート（`/api/admin/*`）
- 管理者アカウント作成スクリプト: `backend/scripts/create-admin.ts`（`npm run create:admin`）

### フロントエンド
- ログイン画面: `/admin/auth/login`
- ダッシュボード、薬剤師管理、薬局管理、証明書管理、契約管理、支払い管理、ペナルティ管理の各UI

### APIエンドポイント例
- `GET /api/admin/dashboard/stats` - ダッシュボード統計
- `GET /api/admin/certificates` - 資格証明書一覧
- `POST /api/admin/certificates/:id/approve` / `reject`
- `GET /api/admin/contracts` - 契約一覧
- `GET /api/admin/penalties` - ペナルティ一覧
- `POST /api/admin/penalties/:id/resolve`
- `GET /api/admin/pharmacists` / `pharmacies` / `payments`
- `PATCH /api/admin/users/:id/status` - アカウントステータス変更

---

## 使用方法

### 1. サーバー起動
```bash
# バックエンド
cd backend && npm run dev

# フロントエンド（別ターミナル）
cd frontend && npm run dev
```

### 2. 管理者ログイン
ブラウザで `http://localhost:3000/admin/auth/login` にアクセスし、上記認証情報でログイン。

---

## セキュリティ

- JWT トークン認証、管理者権限チェック（`userType = 'admin'` のみアクセス可）
- パスワードのハッシュ化（bcrypt）
- パスワードポリシー: 8文字以上、大文字・小文字・数字・記号を含む

---

## 🐛 トラブルシューティング

### ログインできない場合
1. **認証情報を確認** - メール・パスワード（大文字・小文字に注意）
2. **サーバー状態** - バックエンド（ポート5001）・フロントエンド（ポート3000）が起動しているか
3. **ブラウザコンソール** - F12 → Console でエラー確認
4. **データベース** - 管理者アカウントの存在確認（Prisma Studio または SQL）

### 401 Unauthorized
- トークンが正しく設定されているか、有効期限を確認
- `localStorage.getItem('token')` でトークン確認

### 403 Forbidden
- ユーザータイプが `'admin'` であることを確認
- DB: `SELECT user_type FROM users WHERE email = 'admin@yaku-navi.com';`

### 管理者アカウントを再作成
```bash
cd backend
npm run create:admin
```

### 本番でログインできない場合（管理者アカウント作成）
```bash
# サーバーにSSH接続後
cd ~/yaku_navi/backend
npm run create:admin
# または TypeScriptで直接実行
npx ts-node scripts/create-admin.ts
```

### 既存アカウントを管理者に変更
```bash
psql -d pharmacy_db
UPDATE users SET "userType" = 'admin', "isActive" = true WHERE email = 'admin@yaku-navi.com';
```

### パスワードリセット（本番など）
```bash
cd backend
npx ts-node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
(async () => {
  const hashed = await bcrypt.hash('Admin@2026!', 10);
  await prisma.user.update({
    where: { email: 'admin@yaku-navi.com' },
    data: { password: hashed, userType: 'admin', isActive: true }
  });
  console.log('✅ パスワードをリセットしました');
  await prisma.\$disconnect();
})();
"
```

### 環境変数（本番）
- フロントエンド: `NEXT_PUBLIC_API_URL` が本番APIを指しているか
- バックエンド: `CORS_ORIGIN` / `FRONTEND_URL` が本番ドメインか

### 確認用SQL
```sql
SELECT id, email, "userType", "isActive", "createdAt" FROM users WHERE "userType" = 'admin';
```

---

## 関連ドキュメント

- **設計書**: `docs/ADMIN_PANEL_DESIGN.md`
- **要件定義**: `docs/ADMIN_SYSTEM_REQUIREMENTS.md`
- **デプロイ**: `docs/DEPLOYMENT.md`（管理者デプロイ時のチェックリスト含む）

---

**最終更新**: 2026年2月  
**⚠️ この情報は機密情報です。適切に管理してください。**
