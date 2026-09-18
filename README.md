# 薬ナビ（静的LP）

https://yaku-navi.com は静的HTMLのランディングページです。

## 構成

```
.
├── index.html              # トップページ
├── styles.css              # Tailwind をビルドした本番用CSS
├── input.css               # CSSのソース（カスタムテーマ含む）
├── build-css.ps1           # styles.css の再生成
├── nginx-yaku-navi.conf    # Nginx設定
├── deploy.sh               # サーバー上の手動デプロイ
└── .github/workflows/      # main プッシュ時の自動デプロイ
```

アプリ（Next.js / API）と旧サブドメインLPは廃止済みです。  
`yakkyoku.yaku-navi.com` / `yakuzaishi.yaku-navi.com` は本体へリダイレクトします。

## CSSの再生成

`index.html` のクラスを変えたら、次を実行して `styles.css` を更新します。

```powershell
.\build-css.ps1
```

Node がある場合:

```bash
npx @tailwindcss/cli -i ./input.css -o ./styles.css --minify
```

## 本番への反映

`main` へプッシュすると GitHub Actions が次を実行します。

1. `index.html` と `styles.css` を `/var/www/yaku-navi/` へ配置
2. Nginx 設定を更新して reload
3. 旧PM2プロセス（frontend / backend）を停止

サーバー上で手動実行する場合:

```bash
bash deploy.sh
```

## ローカル確認

`index.html` と同じフォルダから静的サーバーで配信してください（`styles.css` を相対パスで読み込みます）。
