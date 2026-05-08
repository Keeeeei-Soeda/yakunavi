# Google広告 コンバージョン計測 実装指示書

## 前提・現在の設定

| 項目 | 内容 |
|------|------|
| サイト | https://yakkyoku.yaku-navi.com |
| 構成 | yaku-navi.com の Next.js プロジェクトのサブディレクトリ（同一コードベース） |
| フレームワーク | Next.js（App Router 想定） |
| コンバージョンアクション① | **お問合せ** → `https://yaku-navi.com/contact` のリンククリックを計測 |
| コンバージョンアクション② | **資料請求** → Googleフォームへの外部リンククリックを計測 |
| 計測方針 | 両方とも**リンク・ボタンのクリック時にコンバージョンイベントを発火**する |
| Google広告 アカウントID | `AW-18067084143` |
| お問合せ send_to | `AW-18067084143/Ep6PCLrGt6McEO-mh6dD` |
| 資料請求 send_to | `AW-18067084143/c5pTCLbW7qMcEO-mh6dD` |

---

## 確認事項（実装前に確認）

- [ ] `app/layout.tsx` または `_app.tsx` に既に `gtag.js` が設置されているか確認
  - 入っている場合：既存タグを流用（重複設置しない）
  - 入っていない場合：下記 STEP 1 を実施する
- [ ] お問合せリンク（`/contact` へ遷移するリンクまたはボタン）が設置されているコンポーネントのパスを確認
- [ ] 資料請求のGoogleフォームリンクが設置されているコンポーネントのパスを確認

---

## 実装内容

### STEP 1：グローバルサイトタグの設置（未設置の場合のみ）

**対象ファイル：** `app/layout.tsx`

`next/script` を使って `<head>` 内に追加する：

```tsx
import Script from 'next/script';

// <head> 内に追加
<Script
  src="https://www.googletagmanager.com/gtag/js?id=AW-18067084143"
  strategy="afterInteractive"
/>
<Script id="gtag-init" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-18067084143');
  `}
</Script>
```

---

### STEP 2：お問合せ クリック計測

**対象ファイル：** `/contact` へ遷移するリンク・ボタンが設置されているコンポーネント

`onClick` ハンドラを追加する：

```tsx
'use client';

const handleContactClick = () => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'conversion', {
      send_to: 'AW-18067084143/Ep6PCLrGt6McEO-mh6dD',
    });
  }
};

// 既存のリンク・ボタンに onClick を追加
<a
  href="/contact"
  onClick={handleContactClick}
>
  お問い合わせはこちら
</a>
```

---

### STEP 3：資料請求 クリック計測

**対象ファイル：** 資料請求のGoogleフォームリンクが設置されているコンポーネント

`onClick` ハンドラを追加する：

```tsx
'use client';

const handleDocumentRequestClick = () => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'conversion', {
      send_to: 'AW-18067084143/c5pTCLbW7qMcEO-mh6dD',
    });
  }
};

// 既存のリンクに onClick を追加（href・target は既存のまま維持）
<a
  href="https://docs.google.com/forms/xxxxx"  // 既存URLそのまま
  onClick={handleDocumentRequestClick}
  target="_blank"
  rel="noopener noreferrer"
>
  資料請求はこちら
</a>
```

---

## 実装後の動作確認方法

1. Chrome拡張「**Google Tag Assistant**」を導入
2. 対象ページでリンクをクリックし、コンバージョンイベントが発火するか確認
3. Google広告管理画面 → コンバージョン一覧 → ステータスが**「有効」**に変わるか確認（反映まで最大24時間）
