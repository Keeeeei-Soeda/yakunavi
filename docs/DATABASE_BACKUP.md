# データベースバックアップ ガイド

## 📋 目次

1. [現在の設定状況](#現在の設定状況)
2. [バックアップの仕組み](#バックアップの仕組み)
3. [手動バックアップ手順](#手動バックアップ手順)
4. [復元手順](#復元手順)
5. [ログの確認方法](#ログの確認方法)
6. [トラブルシューティング](#トラブルシューティング)

---

## 現在の設定状況

| 項目 | 内容 |
|---|---|
| **対象DB** | `pharmacy_db`（PostgreSQL 17） |
| **DBユーザー** | `pharmacy_user` |
| **ホスト** | `localhost:5432` |
| **本番サーバー** | `85.131.247.170`（yaku-navi.com） |
| **バックアップ形式** | pg_dump カスタム形式（`.dump`） |
| **保存先（サーバー）** | `/root/db_backups/` |
| **保存先（ローカル）** | `db_backups/`（.gitignore 対象） |
| **自動実行** | 毎日 **JST 03:00**（cron） |
| **保持期間** | **30日分**（30日超過分は自動削除） |
| **設定日** | 2026年3月31日 |

---

## バックアップの仕組み

### ディレクトリ構成（本番サーバー）

```
/root/db_backups/
├── backup.sh                         # バックアップスクリプト
├── backup.log                        # 実行ログ
├── pharmacy_db_20260331_202731.dump  # バックアップファイル例
└── pharmacy_db_YYYYMMDD_HHMMSS.dump  # 日次で蓄積
```

### スクリプト（`/root/db_backups/backup.sh`）

```bash
#!/bin/bash
# pharmacy_db 日次バックアップスクリプト
# 保持期間: 30日分

BACKUP_DIR="/root/db_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/pharmacy_db_${TIMESTAMP}.dump"
LOG_FILE="${BACKUP_DIR}/backup.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] バックアップ開始" >> "$LOG_FILE"

PGPASSWORD='Yakunavi168' pg_dump \
  -h localhost \
  -U pharmacy_user \
  -d pharmacy_db \
  -F c \
  -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 完了: $BACKUP_FILE ($SIZE)" >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] エラー: バックアップ失敗" >> "$LOG_FILE"
  exit 1
fi

# 30日以上前のファイルを削除
find "$BACKUP_DIR" -name 'pharmacy_db_*.dump' -mtime +30 -delete
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 古いバックアップを削除（30日超過分）" >> "$LOG_FILE"
```

### cron 設定

```
0 3 * * * /root/db_backups/backup.sh >> /root/db_backups/backup.log 2>&1
```

- 毎日 **JST 03:00** に自動実行
- サーバーのタイムゾーンは `Asia/Tokyo`

---

## 手動バックアップ手順

### ① サーバーに接続

```bash
ssh -i ssh_yakunavi.pem root@85.131.247.170
```

### ② バックアップを実行

```bash
bash /root/db_backups/backup.sh
```

### ③ 結果を確認

```bash
ls -lh /root/db_backups/pharmacy_db_*.dump
cat /root/db_backups/backup.log | tail -5
```

### ④ ローカルにダウンロード（任意）

ローカルマシン（`/Users/soedakei/yaku_navi`）で実行：

```bash
# 最新ファイルをローカルへ
scp -i ssh_yakunavi.pem \
  root@85.131.247.170:/root/db_backups/pharmacy_db_YYYYMMDD_HHMMSS.dump \
  db_backups/
```

> ※ `db_backups/` は `.gitignore` に登録済みのため、Git には含まれません。

---

## 復元手順

### ケース1: サーバー上のバックアップから復元（通常）

#### ① 対象ファイルを確認

```bash
ssh -i ssh_yakunavi.pem root@85.131.247.170
ls -lh /root/db_backups/pharmacy_db_*.dump
```

#### ② アプリを停止

```bash
pm2 stop all
```

#### ③ 既存DBを削除して再作成

```bash
psql -U postgres << 'EOF'
DROP DATABASE IF EXISTS pharmacy_db;
CREATE DATABASE pharmacy_db OWNER pharmacy_user;
EOF
```

#### ④ 復元実行

```bash
PGPASSWORD='Yakunavi168' pg_restore \
  -h localhost \
  -U pharmacy_user \
  -d pharmacy_db \
  --no-owner \
  /root/db_backups/pharmacy_db_YYYYMMDD_HHMMSS.dump
```

`YYYYMMDD_HHMMSS` は復元したい日時のファイル名に置き換える。

#### ⑤ アプリを再起動

```bash
pm2 restart all
pm2 status
```

#### ⑥ 動作確認

```bash
curl -s http://localhost:5001/health
```

---

### ケース2: ローカルのバックアップをサーバーに送って復元

#### ① ローカルからサーバーへアップロード

```bash
scp -i ssh_yakunavi.pem \
  db_backups/pharmacy_db_YYYYMMDD_HHMMSS.dump \
  root@85.131.247.170:/root/db_backups/
```

#### ② 以降はケース1の② 〜 ⑥ と同じ手順

---

### 特定テーブルだけ復元したい場合

```bash
PGPASSWORD='Yakunavi168' pg_restore \
  -h localhost \
  -U pharmacy_user \
  -d pharmacy_db \
  --no-owner \
  -t users \
  -t pharmacies \
  /root/db_backups/pharmacy_db_YYYYMMDD_HHMMSS.dump
```

`-t テーブル名` で対象テーブルを絞れる（複数指定可）。

---

## ログの確認方法

### 最新のバックアップログを確認

```bash
ssh -i ssh_yakunavi.pem root@85.131.247.170 \
  "tail -20 /root/db_backups/backup.log"
```

### バックアップファイル一覧を確認

```bash
ssh -i ssh_yakunavi.pem root@85.131.247.170 \
  "ls -lh /root/db_backups/pharmacy_db_*.dump"
```

### cron 設定を確認

```bash
ssh -i ssh_yakunavi.pem root@85.131.247.170 "crontab -l"
```

---

## トラブルシューティング

### バックアップファイルが作成されていない

1. スクリプトが正常に動作するか手動確認

```bash
bash /root/db_backups/backup.sh
```

2. ログでエラー内容を確認

```bash
cat /root/db_backups/backup.log
```

3. cron が動いているか確認

```bash
systemctl status cron
```

---

### pg_restore でエラーが出る

よくある原因と対処：

| エラー内容 | 対処 |
|---|---|
| `role "pharmacy_user" does not exist` | `CREATE ROLE pharmacy_user LOGIN PASSWORD 'Yakunavi168';` を先に実行 |
| `database "pharmacy_db" already exists` | DROP DATABASE してから再作成 |
| `permission denied` | `--no-owner` オプションを付けて実行 |
| `pg_restore: error: connection to server failed` | PostgreSQL が起動しているか確認 `systemctl status postgresql` |

---

### 復元後にアプリがエラーになる

Prisma のマイグレーション状態がずれる場合がある。

```bash
cd /root/yaku_navi/backend
npx prisma migrate deploy
pm2 restart all
```

---

## 注意事項

- バックアップは **取得時点のスナップショット** であり、それ以降の変更は失われる
- 復元は **DB 全体を上書き** するため、現在のデータは消える（部分復元は `-t` オプションで対応）
- 本番環境での作業は必ず `pm2 stop all` でアプリを止めてから実施する
- パスワード（`Yakunavi168`）は環境変数（`.env`）で管理しており、このファイルは Git に含めない

---

**最終更新**: 2026年3月31日
