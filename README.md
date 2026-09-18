# 薬ナビ（静的LP）

https://yaku-navi.com は静的HTMLのランディングページです。

## 構成

```
.
├── index.html              # トップページ
├── nginx-yaku-navi.conf    # Nginx設定
├── deploy.sh               # サーバー上の手動デプロイ
└── .github/workflows/      # main プッシュ時の自動デプロイ
```

アプリ（Next.js / API）と旧サブドメインLPは廃止済みです。  
`yakkyoku.yaku-navi.com` / `yakuzaishi.yaku-navi.com` は本体へリダイレクトします。

## 本番への反映

`main` へプッシュすると GitHub Actions が次を実行します。

1. `index.html` を `/var/www/yaku-navi/` へ配置
2. Nginx 設定を更新して reload
3. 旧PM2プロセス（frontend / backend）を停止

サーバー上で手動実行する場合:

```bash
bash deploy.sh
```

## ローカル確認

`index.html` をブラウザで開くか、任意の静的サーバーで配信してください。
