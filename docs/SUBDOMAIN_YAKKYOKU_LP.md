# サブドメインLP公開手順（yakkyoku / yakuzaishi）

## 見通し（概要）

本番サーバー（85.131.247.170）とSSH（同じ鍵）で、Nginx に静的LP用のサブドメインを追加して公開しています。

| サブドメイン | 用途 | トップページ（index） |
|-------------|------|------------------------|
| **yakkyoku.yaku-navi.com** | 薬局向けLP | phaemacy_lp.html |
| **yakuzaishi.yaku-navi.com** | 薬剤師向けLP | pharmacist_lp.html |

以下は yakkyoku を中心にした手順です。yakuzaishi も同じ方法（別ディレクトリ・別証明書）で運用します。

---

## 現状

| 項目 | 内容 |
|------|------|
| 本番サーバー | 85.131.247.170（yaku-navi.com と同じ） |
| SSH | 同じ `ssh_yakunavi.pem` で接続 |
| Nginx | `yaku-navi.com` / `www.yaku-navi.com` のみ設定済み |
| LPファイル | `LP_page/phaemacy_lp.html`（canonical は既に `https://yakkyoku.yaku-navi.com/`） |

---

## 必要な作業（3つ）

### 1. DNS設定（ドメイン管理側）

- **yakkyoku.yaku-navi.com** の **Aレコード** を追加し、**85.131.247.170** を指すようにする。
- これで「yakkyoku」の名前解決が同じサーバーに向く。

### 2. SSL証明書の追加（サーバー上・SSH）

- サブドメイン用に Let's Encrypt の証明書を取得する。
- 既存の certbot 利用を想定した例:
  ```bash
  sudo certbot certonly --nginx -d yakkyoku.yaku-navi.com
  ```
- ワイルドカード証明書（`*.yaku-navi.com`）を既に持っている場合は、その証明書を流用することも可能。

### 3. Nginx設定の追加（サーバー上・SSH）

- **yakkyoku.yaku-navi.com** 用の `server` ブロックを追加する。
- このサブドメインでは **静的HTMLのみ** を配信する（Next.js や API は使わない）。
- ルート（`/`）で `LP_page/phaemacy_lp.html` の内容を返し、LP用の静的ファイル（HTML・画像など）を一つのディレクトリでまとめて配置する。

---

## ファイルの「アップロード」の考え方

- **推奨**: リポジトリに `LP_page/` をコミット済みなので、本番では **git pull** で取得する。
- 配置例: `/root/yaku_navi/LP_page/` に `phaemacy_lp.html` などを置き、Nginx の `root` をその親（例: `/root/yaku_navi/lp_public`）にし、`index.html` や `phaemacy_lp.html` をトップとして見られるようにする。
- あるいは **Nginx の root** を `/root/yaku_navi/LP_page` にし、トップを `phaemacy_lp.html` から `index.html` にリネームする、などの運用でもよい。

いずれにせよ「アップロード」は、

1. ローカルで `LP_page/` を編集 → コミット・プッシュ  
2. 本番で `git pull`  
3. （必要なら）Nginx の root に合わせてファイルをコピー or シンボリックリンク  

で実現できます。FTP等で直接アップロードする運用にも対応可能です（その場合は Nginx の `root` をアップロード先に合わせる）。

---

## LPページ内のパスについて

- `phaemacy_lp.html` では **相対パス** で画像を参照している（例: `./images/pain_manager.jpg`）。
- **LP_page/images/** をリポジトリに用意済み。必要な画像（`pain_manager.jpg`・`process_team.jpg`・`cta_pharmacist.jpg`）は後から指定ファイル名でアップロードする想定です。一覧は `LP_page/images/README.txt` を参照。
- トップページは `phaemacy_lp.html` に固定済みのため、`https://yakkyoku.yaku-navi.com/` でLPが表示されます。

---

## デプロイで用意した内容（リポジトリ側）

- **LP_page/images/** … 画像用フォルダ。以下を後からアップロードする想定です。
  - `pain_manager.jpg`
  - `process_team.jpg`
  - `cta_pharmacist.jpg`
  - 一覧は `LP_page/images/README.txt` に記載。
- **トップページ**: `phaemacy_lp.html` をルート（`/`）で表示するよう Nginx 設定に反映済み。
- **Nginx 設定**: リポジトリの `nginx-yaku-navi.conf` にサブドメイン用の server ブロックを追加済み。

---

## デプロイ手順（本番サーバーで実行）

### 前提

- DNS で **yakkyoku.yaku-navi.com** の Aレコードを **85.131.247.170** に設定済みであること。
- 同じ SSH 鍵でサーバーにログインできること。

### Step 1: サーバーに SSH 接続

```bash
ssh -i ssh_yakunavi.pem root@85.131.247.170
```

### Step 2: リポジトリを最新化（LP_page と Nginx 設定を取得）

```bash
cd /root/yaku_navi
git pull origin main
```

### Step 3: サブドメイン用 SSL 証明書を取得（初回のみ）

```bash
sudo certbot certonly --nginx -d yakkyoku.yaku-navi.com
```

（対話に従い、メールアドレス等を入力。既にワイルドカード証明書 `*.yaku-navi.com` がある場合は、その証明書パスに合わせて Nginx 設定の `ssl_certificate` / `ssl_certificate_key` を書き換えてください。）

### Step 4: LP ファイルを Nginx が読める場所に配置

Nginx は `www-data` ユーザーで動作するため、`/root/` 配下は読めません。LP は **/var/www/yakkyoku** に配置してください。

```bash
sudo mkdir -p /var/www/yakkyoku
sudo cp -r /root/yaku_navi/LP_page/* /var/www/yakkyoku/
sudo chown -R www-data:www-data /var/www/yakkyoku
```

（LP や画像を更新したあとにも、上記コピーをやり直すと反映されます。）

### Step 5: Nginx 設定を本番に反映

リポジトリの設定を sites-available にコピーして有効化します。

```bash
sudo cp /root/yaku_navi/nginx-yaku-navi.conf /etc/nginx/sites-available/yaku-navi
sudo nginx -t
```

問題がなければ Nginx をリロードします。

```bash
sudo systemctl reload nginx
```

### Step 6: 動作確認

- ブラウザで **https://yakkyoku.yaku-navi.com/** を開く。
- 薬局向けLP（`phaemacy_lp.html`）がトップで表示されればOK。

### 画像のアップロード（後から実施）

画像は後から、以下のファイル名で **LP_page/images/** に配置し、本番では **/var/www/yakkyoku/images/** に同じファイルを置いてください。  
（`git pull` 後に `sudo cp -r /root/yaku_navi/LP_page/* /var/www/yakkyoku/` でまとめて反映しても可）

| ファイル名 | 用途 |
|------------|------|
| `pain_manager.jpg` | 課題セクション用 |
| `process_team.jpg` | 採用の流れセクション用 |
| `cta_pharmacist.jpg` | CTA用 |

- **方法1**: 本番で `git pull` したあと、SCP/SFTP で `LP_page/images/` にアップロード。
- **方法2**: リポジトリに画像を追加してコミットし、本番で `git pull`。

画像が無い間は該当箇所は欠けた表示になりますが、LP 自体は表示されます。

---

## 薬剤師向けLP（yakuzaishi.yaku-navi.com）

- **URL**: https://yakuzaishi.yaku-navi.com/
- **トップページ**: pharmacist_lp.html
- **配置先**: /var/www/yakuzaishi（Nginx の root）
- **デプロイ**: 上記と同様に、DNS（Aレコード → 85.131.247.170）→ certbot（yakuzaishi.yaku-navi.com）→ Nginx に server ブロック追加。LP 更新時は `sudo cp -r /root/yaku_navi/LP_page/* /var/www/yakuzaishi/ && sudo chown -R www-data:www-data /var/www/yakuzaishi` で反映。
- 画像は `LP_page/images/README.txt` および pharmacist_lp.html 内の参照に従い、`/var/www/yakuzaishi/images/` に配置。

---

## 補足

- 同じSSH・同じサーバーで Nginx に設定を足すだけなので、既存の yaku-navi.com や本番アプリへの影響は、設定ミスがなければありません。
