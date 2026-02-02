# 🔧 管理者ログイン問題の修正手順

## 問題
本番環境で管理者ログインができない

## 原因
本番環境のデータベースに管理者アカウントが存在しない可能性が高い

## 解決方法

### 1. サーバーにSSH接続

```bash
ssh root@x85-131-247-170
```

### 2. プロジェクトディレクトリに移動

```bash
cd ~/yaku_navi
```

### 3. 管理者アカウントを作成

```bash
cd backend
npm run create:admin
```

このコマンドで以下の管理者アカウントが作成されます：

#### メイン管理者
- **メール**: `admin@yakunavi.com`
- **パスワード**: `Admin@2026!`

#### サポート管理者
- **メール**: `support@yakunavi.com`
- **パスワード**: `Support@2026!`

### 4. 既存アカウントを管理者に変更する場合

もし既にアカウントが存在する場合は、以下のSQLで管理者に変更できます：

```bash
# PostgreSQLに接続
psql -d pharmacy_db

# 既存アカウントを管理者に変更
UPDATE users 
SET "userType" = 'admin', "isActive" = true 
WHERE email = 'admin@yakunavi.com';

# 確認
SELECT id, email, "userType", "isActive" FROM users WHERE email = 'admin@yakunavi.com';
```

### 5. パスワードをリセットする場合

```bash
cd ~/yaku_navi/backend
npx ts-node -e "
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
(async () => {
  const hashedPassword = await bcrypt.hash('Admin@2026!', 10);
  await prisma.user.update({
    where: { email: 'admin@yakunavi.com' },
    data: { password: hashedPassword, userType: 'admin', isActive: true }
  });
  console.log('✅ パスワードをリセットしました');
  await prisma.\$disconnect();
})();
"
```

### 6. 環境変数の確認

本番環境のAPI URLが正しく設定されているか確認：

```bash
# フロントエンドの環境変数を確認
cd ~/yaku_navi/frontend
cat .env.local | grep NEXT_PUBLIC_API_URL

# 正しく設定されていない場合は設定
echo "NEXT_PUBLIC_API_URL=https://yaku-navi.com/api" > .env.local
# または
echo "NEXT_PUBLIC_API_URL=http://localhost:5001/api" > .env.local
```

### 7. バックエンドの再起動

```bash
pm2 restart yaku-navi-backend
pm2 logs yaku-navi-backend --lines 50
```

### 8. フロントエンドの再ビルド（環境変数変更した場合）

```bash
cd ~/yaku_navi/frontend
npm run build
pm2 restart yaku-navi-frontend
```

## 確認手順

### 1. データベースで管理者アカウントを確認

```bash
psql -d pharmacy_db -c "SELECT id, email, \"userType\", \"isActive\" FROM users WHERE \"userType\" = 'admin';"
```

### 2. バックエンドAPIを直接テスト

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yakunavi.com","password":"Admin@2026!"}'
```

成功すると、`accessToken`が返されます。

### 3. ブラウザでログイン

1. `https://yaku-navi.com/admin/auth/login` にアクセス
2. メール: `admin@yakunavi.com`
3. パスワード: `Admin@2026!`
4. ログインボタンをクリック

## トラブルシューティング

### 問題1: `npm run create:admin` が実行できない

```bash
# TypeScriptを直接実行
cd ~/yaku_navi/backend
npx ts-node scripts/create-admin.ts
```

### 問題2: データベース接続エラー

```bash
# データベース接続を確認
psql -d pharmacy_db -c "SELECT 1;"

# .envファイルを確認
cd ~/yaku_navi/backend
cat .env | grep DATABASE_URL
```

### 問題3: パスワードが正しくない

パスワードは大文字・小文字・数字・記号を含む必要があります：
- `Admin@2026!` ✅
- `admin@2026!` ❌ (大文字のAが必要)
- `Admin2026!` ❌ (@記号が必要)

### 問題4: CORSエラー

バックエンドのCORS設定を確認：

```bash
cd ~/yaku_navi/backend
cat .env | grep CORS
```

本番環境では以下を設定：
```
CORS_ORIGIN=https://yaku-navi.com
FRONTEND_URL=https://yaku-navi.com
```

## 一括実行コマンド（コピー&ペースト用）

```bash
ssh root@x85-131-247-170 << 'EOF'
cd ~/yaku_navi/backend
npm run create:admin
pm2 restart yaku-navi-backend
pm2 logs yaku-navi-backend --lines 20
EOF
```

## 確認用SQLクエリ

```sql
-- 管理者アカウント一覧
SELECT id, email, "userType", "isActive", "createdAt" 
FROM users 
WHERE "userType" = 'admin';

-- 特定の管理者アカウントの詳細
SELECT id, email, "userType", "isActive", "emailVerified", "createdAt" 
FROM users 
WHERE email = 'admin@yakunavi.com';
```

---

**重要**: 管理者アカウントを作成した後、必ずログインできることを確認してください。

