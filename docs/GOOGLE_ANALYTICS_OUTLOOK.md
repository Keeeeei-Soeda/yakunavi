# Google Analytics 設置の見通し

薬ナビの各ドメイン・LP に Google Analytics（GA4）を設置するための見通しです。

---

## 現状

| 対象 | URL | GA の有無 | 備考 |
|------|-----|-----------|------|
| **メインアプリ** | https://yaku-navi.com | ✅ **設置済み** | Next.js の `app/layout.tsx` で gtag を読み込み |
| **薬局向けLP** | https://yakkyoku.yaku-navi.com | ❌ 未設置 | 静的 HTML（`phaemacy_lp.html`）、Nginx で配信 |
| **薬剤師向けLP** | https://yakuzaishi.yaku-navi.com | ❌ 未設置 | 静的 HTML（`pharmacist_lp.html`）、Nginx で配信 |

### メインアプリ側の設定

- **測定ID**: `process.env.NEXT_PUBLIC_GA_ID` またはデフォルト `G-9T7LVD6HVV`
- **読み込み**: `next/script` の `afterInteractive` で gtag.js と config を実行
- 本番で GA を有効にするには、フロントの `.env` または Vercel/サーバー環境変数に `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` を設定

---

## やること（見通し）

### 1. GA4 プロパティの確認・準備

- Google アナリティクス（GA4）でプロパティが作成済みか確認
- **測定ID**（`G-XXXXXXXXXX`）を控える
- 必要なら「データストリーム」を追加し、以下を登録するとレポートで見分けやすいです：
  - メイン: `https://yaku-navi.com`
  - 薬局LP: `https://yakkyoku.yaku-navi.com`
  - 薬剤師LP: `https://yakuzaishi.yaku-navi.com`  
  ※ 1 プロパティに 1 ストリームでまとめ、ホスト名でフィルタする運用でも可

### 2. メインアプリ（yaku-navi.com）

- **対応済み**。本番環境変数に `NEXT_PUBLIC_GA_ID` を設定すれば計測開始
- 測定IDを変える場合は `.env.production` または本番の環境変数を変更

### 3. 薬局向けLP（phaemacy_lp.html）

- **作業**: `<head>` 内に GA4 用の gtag スクリプトを追加
- **内容**:
  - `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX` の読み込み
  - `dataLayer` と `gtag('config', 'G-XXXXXXXXXX')` のインラインスクリプト
- **測定ID**: メインと同じ ID を使うか、LP 用に別ストリームの ID を使うかは運用方針で決定

### 4. 薬剤師向けLP（pharmacist_lp.html）

- 上記と同様に `<head>` に gtag スクリプトを追加
- 同じ ID で「ページ」や「ホスト名」で LP を識別するか、別 ID で完全分離するか選択

### 5. 環境変数・共通化（任意）

- LP は静的 HTML のため、測定IDを変更するたびに HTML を書き換える必要がある
- 運用で「LP 用は固定 ID」でよい場合は、HTML に直接 `G-XXXXXXXXXX` を記述
- メインアプリは引き続き `NEXT_PUBLIC_GA_ID` で切り替え可能

---

## 実装イメージ（LP に追加するタグ）

各 LP の `</head>` 直前に、次のブロックを入れる想定です（`G-XXXXXXXXXX` は実際の測定IDに置き換え）。

```html
<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

- **設置場所**: `LP_page/phaemacy_lp.html` と `LP_page/pharmacist_lp.html` の `<head>` 内（`</head>` の直前が無難）
- メインアプリと同じ測定IDを使う場合、GA4 の「レポート」や「探索」で「ホスト名」や「ページの場所」で yakkyoku / yakuzaishi を絞り込める

---

## チェックリスト

- [ ] GA4 プロパティと測定ID（G-XXXXXXXXXX）を確認
- [ ] メインアプリ: 本番の `NEXT_PUBLIC_GA_ID` を設定済みか確認
- [ ] 薬局LP: `phaemacy_lp.html` の `<head>` に gtag を追加
- [ ] 薬剤師LP: `pharmacist_lp.html` の `<head>` に gtag を追加
- [ ] 本番デプロイ後、各URLでアクセスし GA4 の「リアルタイム」で計測を確認

---

## 注意事項

- **Cookie 同意**: 欧州などでは Cookie 同意バナーと連携する必要がある場合があります。国内のみの運用でも、ポリシーに合わせて検討してください。
- **送信元**: LP は Nginx が静的ファイルを配信するため、タグの追加・変更のたびに LP ファイルを更新し、本番に再デプロイする必要があります。

以上が Google Analytics 設置の見通しです。測定IDが決まっていれば、LP へのタグ追加はすぐに実装できます。
