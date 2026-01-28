# 📄 PDFダウンロード・印刷機能ガイド

## 📋 目次

1. [PDFダウンロード機能](#pdfダウンロード機能)
2. [ブラウザ印刷機能](#ブラウザ印刷機能)
3. [PDF文字化け問題の解決](#pdf文字化け問題の解決)
4. [フォント設定](#フォント設定)

---

## PDFダウンロード機能

### 実装方法

**バックエンド** (`backend/src/controllers/document.controller.ts`):
- `fs.createReadStream()` + `pipe()` を使用
- Content-Dispositionヘッダーを設定（日本語ファイル名対応）
- ストリーミングでファイルを送信

**フロントエンド** (`frontend/lib/api/documents.ts`):
- `documentsAPI.download()` - 認証トークン付きでPDFをダウンロード
- `documentsAPI.downloadSimple()` - シンプルなダウンロード

### 使用方法

```typescript
import { documentsAPI } from '@/lib/api/documents';

// ダウンロード
const result = await documentsAPI.download(documentId, 'pharmacy', fileName);
if (result.success) {
  console.log('ダウンロード成功');
}
```

---

## ブラウザ印刷機能

### 実装内容

**場所**: 請求書詳細ページ（`/pharmacy/payments/[id]`）

**機能**:
- 「印刷 / PDF保存」ボタンを追加
- クリックするとブラウザの印刷ダイアログが開く
- 印刷プレビューでPDFとして保存可能

### 使用方法

1. 請求書詳細ページにアクセス
2. 「印刷 / PDF保存」ボタンをクリック
3. ブラウザの印刷ダイアログで「PDFに保存」を選択

### 印刷用CSS

**ファイル**: `frontend/app/globals.css`

**主な機能**:
- `@media print`で印刷時のスタイルを定義
- サイドバー、ナビゲーション、ボタンなどを非表示
- 請求書の内容のみを印刷
- A4サイズに最適化

---

## PDF文字化け問題の解決

### 問題の原因

PDFKitはデフォルトでHelveticaフォントを使用しますが、このフォントは**日本語をサポートしていません**。そのため、日本語テキストが文字化けします。

### 解決方法

#### 方法1: システムフォントを使用（現在の実装）

現在の実装では、システムにインストールされている日本語フォントを自動検出して使用します。

**対応OS:**
- **macOS**: ヒラギノ角ゴシック、AppleGothic
- **Linux**: Noto Sans CJK
- **Windows**: MSゴシック、MS明朝

#### 方法2: プロジェクトにフォントファイルを配置（推奨）

最も確実な方法は、プロジェクトに日本語フォントファイルを含めることです。

**手順:**

1. **フォントファイルをダウンロード**
   - Noto Sans JP: https://fonts.google.com/noto/specimen/Noto+Sans+JP
   - 「Download family」から `NotoSansJP-Regular.ttf` をダウンロード

2. **フォントファイルを配置**
   ```
   backend/
   └── fonts/
       └── NotoSansJP-Regular.ttf
   ```

3. **コードは既に対応済み**
   - 現在の実装では、`backend/fonts/NotoSansJP-Regular.ttf` を自動的に検出します

---

## フォント設定

### フォントファイルの配置場所

```
backend/
└── fonts/
    ├── NotoSansJP-Regular.ttf
    └── NotoSansJP-VariableFont_wght.ttf
```

### フォント検出の優先順位

1. `backend/fonts/NotoSansJP-VariableFont_wght.ttf`
2. `backend/fonts/NotoSansJP-Regular.ttf`
3. `backend/fonts/NotoSansCJK-Regular.ttc`
4. システムフォント（OS別）

### フォントファイルの確認

```bash
# フォントファイルが正しく配置されているか確認
ls -lh ~/yaku_navi/backend/fonts/NotoSansJP-VariableFont_wght.ttf

# ファイルサイズが約8.7MBであることを確認
```

---

## トラブルシューティング

### 問題1: PDFがダウンロードされない

- ブラウザのポップアップブロッカーを確認
- 認証トークンが正しく設定されているか確認
- ネットワークタブでエラーを確認

### 問題2: 文字化けが発生する

- フォントファイルが正しく配置されているか確認
- バックエンドのログでフォントパスを確認
- システムフォントが利用可能か確認

### 問題3: 印刷時にレイアウトが崩れる

- ブラウザの印刷設定を確認
- `@media print`のCSSを確認
- ページサイズをA4に設定

---

**最終更新**: 2026年1月28日

