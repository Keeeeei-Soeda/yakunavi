# Gitリポジトリのセットアップ手順

## 📋 現在の状況

プロジェクトディレクトリがGitリポジトリとして初期化されていません。

## 🚀 セットアップ手順

### オプション1: 新規Gitリポジトリを作成（推奨）

#### ステップ1: GitHubでリポジトリを作成

1. GitHubにログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名: `yaku_navi`（または任意の名前）
4. 「Create repository」をクリック
5. **リポジトリURLをコピー**（例: `https://github.com/your-username/yaku_navi.git`）

#### ステップ2: ローカルでGitリポジトリを初期化

```bash
cd /Users/soedakei/yaku_navi

# Gitリポジトリを初期化
git init

# .gitignoreファイルを作成（既に存在する場合はスキップ）
# 必要に応じて作成

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit"

# リモートリポジトリを追加（GitHubのURLを使用）
git remote add origin https://github.com/your-username/yaku_navi.git

# メインブランチを設定
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

### オプション2: 既存のGitHubリポジトリに接続

既にGitHubにリポジトリがある場合：

```bash
cd /Users/soedakei/yaku_navi

# Gitリポジトリを初期化
git init

# リモートリポジトリを追加
git remote add origin https://github.com/your-username/yaku_navi.git

# 既存のリポジトリからプル（初回のみ）
git pull origin main --allow-unrelated-histories

# または、強制的に上書きする場合
git fetch origin
git reset --hard origin/main
```

### オプション3: Gitを使わずにtar.gzでアップロード

Gitを使わない場合は、以下のコマンドで圧縮してアップロード：

```bash
cd /Users/soedakei/yaku_navi

# プロジェクトを圧縮
tar -czf yaku_navi.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.env' \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  .

# 圧縮ファイルの場所を確認
ls -lh yaku_navi.tar.gz
```

その後、SFTPクライアント（FileZillaなど）で`yaku_navi.tar.gz`をXserver VPSにアップロードします。

## 🔐 .gitignoreファイルの確認

`.gitignore`ファイルが存在するか確認：

```bash
ls -la .gitignore
```

存在しない場合は、以下の内容で作成：

```
# Dependencies
node_modules/
**/node_modules/

# Build outputs
.next/
dist/
build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Prisma
prisma/migrations/

# Uploads
uploads/
**/uploads/

# Temporary files
tmp/
temp/
```

## 📝 次のステップ

Gitリポジトリをセットアップした後は、`QUICK_DEPLOY.md`の手順に従ってデプロイできます。

