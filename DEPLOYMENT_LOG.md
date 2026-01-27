# Xserver VPS デプロイログ

## 📋 デプロイ概要

- **サーバー**: Xserver VPS
- **OS**: Ubuntu 25.04
- **IPアドレス**: 85.131.247.170
- **ホスト名**: x85-131-247-170.static.xvps.ne.jp
- **デプロイ日時**: 2026年1月27日

## 🚀 実行した手順

### ステップ1: システムの状態確認

```bash
node --version    # 結果: コマンドが見つからない
npm --version     # 結果: コマンドが見つからない
psql --version    # 結果: コマンドが見つからない
git --version     # 結果: git version 2.48.1 ✅
```

**結果**: Gitのみインストール済み。Node.js、npm、PostgreSQLは未インストール。

---

### ステップ2: システムの更新

```bash
apt update && apt upgrade -y
```

**結果**: 
- 62.6 MBのパッケージを取得
- システム更新完了
- ⚠️ カーネルアップグレードが保留（6.14.0-15-generic → 6.14.0-37-generic）
- ⚠️ システムの再起動が必要（後で実行予定）

---

### ステップ3: Node.js 20.xのインストール

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

**結果**:
- Node.js 20.20.0 インストール完了 ✅
- npm 10.8.2 インストール完了 ✅

**警告**:
- npm 11.8.0へのアップデートが利用可能（後で対応可能）

---

### ステップ4: PostgreSQLのインストール

```bash
apt install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql
```

**結果**:
- PostgreSQL 17.7 (Ubuntu 17.7-0ubuntu0.25.04.1) インストール完了 ✅
- サービス起動・自動起動設定完了 ✅

---

### ステップ5: PM2のインストール

```bash
npm install -g pm2
pm2 startup
```

**結果**:
- PM2 インストール完了 ✅
- 自動起動設定完了 ✅
- systemdサービスファイル作成: `/etc/systemd/system/pm2-root.service`

**出力**:
```
[PM2] Init System found: systemd
[PM2] Writing init configuration in /etc/systemd/system/pm2-root.service
[PM2] Making script booting at startup...
[PM2] [v] Command successfully executed.
```

---

### ステップ6: Nginxのインストール

```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

**結果**:
- Nginx 1.26.3-2ubuntu1.2 インストール完了 ✅
- サービス起動・自動起動設定完了 ✅

**状態確認**:
```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: active (running) since Tue 2026-01-27 23:03:30 JST
```

---

### ステップ7: データベースのセットアップ

#### 7.1 データベースとユーザーの作成

```bash
sudo -u postgres psql
```

PostgreSQL内で実行:
```sql
CREATE DATABASE pharmacy_db;
CREATE USER pharmacy_user WITH PASSWORD 'Yakunavi168';
GRANT ALL PRIVILEGES ON DATABASE pharmacy_db TO pharmacy_user;
\q
```

**結果**:
- データベース `pharmacy_db` 作成完了 ✅
- ユーザー `pharmacy_user` 作成完了 ✅
- 権限付与完了 ✅

#### 7.2 スキーマ権限の付与（エラー対応）

**発生したエラー**:
```
Error: ERROR: permission denied for schema public
```

**原因**: PostgreSQL 15以降では、`public`スキーマに対する権限がデフォルトで制限されている。

**解決方法**:
```bash
sudo -u postgres psql
\c pharmacy_db
ALTER SCHEMA public OWNER TO pharmacy_user;
GRANT ALL ON SCHEMA public TO pharmacy_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pharmacy_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pharmacy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pharmacy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pharmacy_user;
\q
```

**結果**: 権限付与完了 ✅

---

### ステップ8: プロジェクトファイルの取得

```bash
cd ~
mkdir -p yaku_navi
cd yaku_navi
git clone https://github.com/Keeeeei-Soeda/yakunavi.git .
```

**結果**:
- GitHubからプロジェクトクローン完了 ✅
- 228オブジェクト、22.17 MiB取得
- `.dockerignore`ファイルも含まれていることを確認 ✅

**取得されたファイル**:
- `backend/` - バックエンドディレクトリ
- `frontend/` - フロントエンドディレクトリ
- `.dockerignore` - Docker設定ファイル
- `DEPLOY_STEPS.md` - デプロイ手順書
- その他ドキュメントファイル

---

### ステップ9: バックエンドのセットアップ

#### 9.1 依存関係のインストール

```bash
cd ~/yaku_navi/backend
npm install --production
```

**結果**:
- 264パッケージインストール完了 ✅
- インストール時間: 約10秒

**警告**:
- 非推奨パッケージの警告（後で対応可能）:
  - `rimraf@3.0.2`
  - `npmlog@5.0.1`
  - `multer@1.4.5-lts.2`
  - `inflight@1.0.6`
  - `are-we-there-yet@2.0.0`
  - `gauge@3.0.2`
  - `glob@7.2.3`
  - `tar@6.2.1`
  - `jpeg-exif@1.1.4`

**脆弱性**:
- 3件の高重要度脆弱性が検出（後で対応可能）

#### 9.2 .envファイルの作成

```bash
nano .env
```

**設定内容**:
```env
DATABASE_URL="postgresql://pharmacy_user:Yakunavi168@localhost:5432/pharmacy_db?schema=public"
JWT_SECRET=Yakunavi2024ProductionSecretKeyChangeThisToRandomString32CharsMin
JWT_REFRESH_SECRET=Yakunavi2024RefreshSecretKeyChangeThisToRandomString32CharsMin
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
PORT=5001
NODE_ENV=production
FRONTEND_URL=http://85.131.247.170:3000
RESEND_API_KEY=
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**結果**: `.env`ファイル作成完了 ✅

**注意事項**:
- IPアドレス（85.131.247.170）を使用
- ドメイン取得後は`FRONTEND_URL`を`https://your-domain.com`に変更予定

#### 9.3 Prismaクライアントの生成

```bash
npm run prisma:generate
```

**結果**:
- Prisma Client (v5.22.0) 生成完了 ✅
- 生成時間: 526ms

**出力**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 526ms
```

#### 9.4 データベースマイグレーション

**初回実行（エラー発生）**:
```bash
npx prisma migrate deploy
```

**エラー内容**:
```
No migration found in prisma/migrations
Error: ERROR: permission denied for schema public
```

**原因**: 
1. `.gitignore`に`prisma/migrations/`が含まれているため、マイグレーションファイルがGitHubに含まれていない
2. PostgreSQLの`public`スキーマに対する権限不足（既に解決済み）

**解決方法**: スキーマを直接データベースに適用

```bash
npx prisma db push
```

**結果**:
- データベースがスキーマと同期完了 ✅
- 処理時間: 318ms
- Prisma Client再生成: 443ms

**出力**:
```
🚀  Your database is now in sync with your Prisma schema. Done in 318ms
✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 443ms
```

---

## ⚠️ 発生したエラーと解決方法

### エラー1: PostgreSQLスキーマ権限エラー

**エラーメッセージ**:
```
Error: ERROR: permission denied for schema public
```

**原因**: PostgreSQL 15以降では、`public`スキーマに対する権限がデフォルトで制限されている。

**解決方法**:
```sql
ALTER SCHEMA public OWNER TO pharmacy_user;
GRANT ALL ON SCHEMA public TO pharmacy_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pharmacy_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pharmacy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pharmacy_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pharmacy_user;
```

**結果**: 解決 ✅

---

### エラー2: マイグレーションファイルが見つからない

**エラーメッセージ**:
```
No migration found in prisma/migrations
```

**原因**: `.gitignore`に`prisma/migrations/`が含まれているため、マイグレーションファイルがGitHubに含まれていない。

**解決方法**: `prisma db push`を使用してスキーマを直接データベースに適用。

**結果**: 解決 ✅

**今後の改善**:
- `.gitignore`から`prisma/migrations/`を除外し、マイグレーションファイルをGitに含める
- または、マイグレーションファイルを別途管理する

---

## 📊 現在の状態

### インストール済みソフトウェア

| ソフトウェア | バージョン | 状態 |
|------------|----------|------|
| Node.js | 20.20.0 | ✅ インストール済み |
| npm | 10.8.2 | ✅ インストール済み |
| PostgreSQL | 17.7 | ✅ インストール済み・起動中 |
| PM2 | Latest | ✅ インストール済み・自動起動設定済み |
| Nginx | 1.26.3 | ✅ インストール済み・起動中 |
| Git | 2.48.1 | ✅ インストール済み |

### データベース

- **データベース名**: `pharmacy_db`
- **ユーザー**: `pharmacy_user`
- **スキーマ**: `public`
- **状態**: スキーマ適用完了 ✅

### バックエンド

- **ディレクトリ**: `~/yaku_navi/backend`
- **依存関係**: 264パッケージインストール済み ✅
- **Prisma Client**: v5.22.0 生成済み ✅
- **データベース**: スキーマ同期完了 ✅
- **.envファイル**: 作成完了 ✅
- **ビルド**: 未実行（次のステップ）
- **起動**: 未実行（次のステップ）

### フロントエンド

- **ディレクトリ**: `~/yaku_navi/frontend`
- **状態**: 未セットアップ（次のステップ）

---

## 🔄 次のステップ

### バックエンド（残り）

1. **TypeScriptのビルド**
   ```bash
   cd ~/yaku_navi/backend
   npm run build
   ```

2. **PM2でバックエンドを起動**
   ```bash
   pm2 start dist/index.js --name "yaku-navi-backend"
   pm2 status
   pm2 logs yaku-navi-backend
   ```

3. **ヘルスチェック**
   ```bash
   curl http://localhost:5001/health
   ```

### フロントエンド

1. **依存関係のインストール**
   ```bash
   cd ~/yaku_navi/frontend
   npm install
   ```

2. **.env.localファイルの作成**
   ```env
   NEXT_PUBLIC_API_URL=http://85.131.247.170:5001/api
   ```

3. **ビルド**
   ```bash
   npm run build
   ```

4. **PM2でフロントエンドを起動**
   ```bash
   pm2 start npm --name "yaku-navi-frontend" -- start
   ```

### Nginx設定

1. **Nginx設定ファイルの作成**
2. **リバースプロキシの設定**
3. **SSL証明書の取得**（ドメイン取得後）

---

## 📝 注意事項

1. **カーネルアップグレード**: システムの再起動が必要（すべてのセットアップ完了後に実行）
2. **脆弱性**: 3件の高重要度脆弱性が検出（後で対応）
3. **非推奨パッケージ**: 複数の非推奨パッケージが使用中（後で対応）
4. **マイグレーションファイル**: `.gitignore`から除外し、Gitに含める必要がある
5. **ドメイン**: 現在はIPアドレスを使用。ドメイン取得後は設定を変更する必要がある
6. **JWT_SECRET**: 本番環境では、より強力なランダム文字列に変更することを推奨

---

## 🔗 参考リンク

- **GitHubリポジトリ**: https://github.com/Keeeeei-Soeda/yakunavi.git
- **デプロイ手順書**: `DEPLOY_STEPS.md`
- **デプロイガイド**: `DEPLOYMENT_GUIDE.md`

---

## 📅 更新履歴

- **2026-01-27**: 初回デプロイログ作成
  - システムセットアップ完了
  - データベースセットアップ完了
  - バックエンドセットアップ（途中まで）

