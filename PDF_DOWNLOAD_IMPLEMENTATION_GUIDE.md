# PDFダウンロード機能実装ガイド

## ✅ 実装完了

直接ダウンロードリンク（方法1）の実装が完了しました。

---

## 📋 実装内容

### 1. バックエンド（document.controller.ts）

**変更点:**
- `res.download()` → `fs.createReadStream()` + `pipe()` に変更
- Content-Dispositionヘッダーを設定（日本語ファイル名対応）
- ストリーミングでファイルを送信（確実なダウンロード）

**主な改善:**
```typescript
// Content-Dispositionヘッダーを設定してダウンロード
// RFC 5987に準拠した日本語ファイル名対応
res.setHeader('Content-Type', 'application/pdf');
res.setHeader(
  'Content-Disposition',
  `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
);

// ファイルをストリームとして送信（確実なダウンロード方法）
const fileStream = fs.createReadStream(document.filePath);
fileStream.pipe(res);
```

---

### 2. フロントエンド（新規作成：frontend/lib/api/documents.ts）

**新規作成したAPI:**
- `documentsAPI.download()` - 認証トークン付きでPDFをダウンロード
- `documentsAPI.downloadSimple()` - シンプルなダウンロード（新しいタブで開く）
- `documentsAPI.getByContract()` - 契約に紐づくドキュメント一覧を取得

**主な機能:**
```typescript
export const documentsAPI = {
  // 認証トークン付きでダウンロード
  download: async (documentId: number, userType: 'pharmacy' | 'pharmacist', fileName?: string) => {
    // fetchでBlobを取得
    // Content-Dispositionヘッダーからファイル名を取得
    // Blob URLを作成してダウンロード
  },
  
  // シンプルなダウンロード（新しいタブで開く）
  downloadSimple: (documentId: number, userType: 'pharmacy' | 'pharmacist') => {
    window.open(url, '_blank');
  },
};
```

---

### 3. フロントエンド（薬剤師側：frontend/app/pharmacist/contracts/[id]/page.tsx）

**変更点:**
- `documentsAPI`をインポート
- `downloading`ステートを追加
- `handleDownload`関数を実装
- `<a>`タグ → `<button>`に変更

**実装例:**
```typescript
const handleDownload = async (documentId: number, documentType: string) => {
  setDownloading(documentId);
  try {
    const result = await documentsAPI.download(
      documentId,
      'pharmacist',
      `${documentType}_契約${contractId}.pdf`
    );
    
    if (!result.success) {
      alert(result.error || 'ダウンロードに失敗しました');
    }
  } catch (error: any) {
    console.error('Download error:', error);
    alert(error.message || 'ダウンロードに失敗しました');
  } finally {
    setDownloading(null);
  }
};
```

---

### 4. フロントエンド（薬局側：frontend/app/pharmacy/contracts/[id]/page.tsx）

**変更点:**
- `documentsAPI`をインポート
- `downloading`ステートを追加
- `handleDownloadDocument`関数を改善
- `link.click()` → `documentsAPI.download()`に変更

---

### 5. フロントエンド（薬局側：frontend/app/pharmacy/invoices/[contractId]/page.tsx）

**変更点:**
- `axios`を削除
- `documentsAPI`をインポート
- `handleDownloadPDF`関数を簡潔に改善

**Before:**
```typescript
const response = await axios.get(`${API_URL}/documents/${invoiceDoc.id}/download`, {
  headers: { Authorization: `Bearer ${token}` },
  responseType: 'blob',
});
// ... 複雑なBlob処理 ...
```

**After:**
```typescript
const result = await documentsAPI.download(
  invoiceDoc.id,
  'pharmacy',
  `請求書_${contract.id}.pdf`
);
```

---

## 🔄 変更ファイル一覧

### バックエンド
1. ✅ `backend/src/controllers/document.controller.ts`
   - ストリーミングダウンロードに改善

### フロントエンド
2. 🆕 `frontend/lib/api/documents.ts`（新規作成）
   - documentsAPI実装

3. ✅ `frontend/app/pharmacist/contracts/[id]/page.tsx`
   - documentsAPIを使用したダウンロード実装

4. ✅ `frontend/app/pharmacy/contracts/[id]/page.tsx`
   - documentsAPIを使用したダウンロード実装

5. ✅ `frontend/app/pharmacy/invoices/[contractId]/page.tsx`
   - axiosを削除、documentsAPIに統一

---

## 🎯 現状とのギャップ解消

### Before（問題点）

#### バックエンド
```typescript
// ❌ res.download()は環境によって動作しない
return res.download(document.filePath, fileName);
```

#### フロントエンド
```typescript
// ❌ 認証トークンが送信されない
<a href={doc.fileUrl} download>ダウンロード</a>

// ❌ 方法がバラバラ（link.click()、axios、href）
const link = document.createElement('a');
link.href = `${API_URL}/documents/${documentId}/download`;
link.click();
```

### After（改善後）

#### バックエンド
```typescript
// ✅ ストリーミングで確実にダウンロード
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
const fileStream = fs.createReadStream(document.filePath);
fileStream.pipe(res);
```

#### フロントエンド
```typescript
// ✅ 統一されたAPI、認証トークン自動付与
const result = await documentsAPI.download(
  documentId,
  userType,
  fileName
);
```

---

## 🧪 テスト方法

### 1. 薬剤師側でテスト

1. 薬剤師としてログイン
2. 「勤務中の薬局（契約管理）」に移動
3. 契約詳細ページを開く
4. 「労働条件通知書をダウンロード」ボタンをクリック
5. PDFがダウンロードされることを確認
6. ダウンロードしたPDFを開けることを確認

### 2. 薬局側でテスト（契約詳細）

1. 薬局としてログイン
2. 「契約管理」に移動
3. 契約詳細ページを開く
4. 書類の「ダウンロード」ボタンをクリック
5. PDFがダウンロードされることを確認

### 3. 薬局側でテスト（請求書）

1. 薬局としてログイン
2. 「請求書管理」に移動
3. 請求書詳細ページを開く
4. 「PDFダウンロード」ボタンをクリック
5. PDFがダウンロードされることを確認

---

## 📌 実装のポイント

### 1. 認証トークンの自動付与

`documentsAPI`は`apiClient`を基盤としているため、認証トークンが自動的に付与されます。

```typescript
// frontend/lib/api/client.ts
this.client.interceptors.request.use((config) => {
  const token = this.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. ファイル名の日本語対応

バックエンドでRFC 5987に準拠した形式を使用：

```typescript
res.setHeader(
  'Content-Disposition',
  `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
);
```

### 3. エラーハンドリング

- バックエンド：ファイルストリームのエラーをキャッチ
- フロントエンド：ダウンロード失敗時にユーザーにアラート表示

### 4. ユーザーフィードバック

- ダウンロード中は「ダウンロード中...」を表示
- ボタンを無効化して多重クリックを防止

---

## 🚀 実装済みの機能

### 基本機能
- ✅ 認証トークン付きダウンロード
- ✅ 日本語ファイル名対応
- ✅ ストリーミングダウンロード
- ✅ エラーハンドリング
- ✅ ダウンロード履歴記録

### ユーザー体験
- ✅ ダウンロード中の表示
- ✅ ボタンの無効化
- ✅ エラーメッセージ表示
- ✅ ファイル名のカスタマイズ

---

## 🔧 トラブルシューティング

### 問題1: ダウンロードが開始されない

**原因:**
- 認証トークンがない
- ファイルが存在しない
- CORSエラー

**解決方法:**
```typescript
// ブラウザのコンソールで確認
localStorage.getItem('token') // トークンが存在するか
```

### 問題2: ファイル名が文字化けする

**原因:**
- Content-Dispositionヘッダーのエンコードが正しくない

**解決方法:**
- バックエンドでRFC 5987形式を使用（実装済み）

### 問題3: PDFが開けない

**原因:**
- ダウンロードしたファイルが破損している
- Content-Typeが正しくない

**解決方法:**
```typescript
// バックエンドで確認
res.setHeader('Content-Type', 'application/pdf');
```

---

## 📊 パフォーマンス

### ストリーミングの利点

1. **メモリ効率**
   - ファイル全体をメモリに読み込まない
   - 大きなファイルでも問題なし

2. **レスポンス速度**
   - ファイルを読みながら送信
   - ユーザーの待ち時間が短縮

3. **サーバー負荷**
   - 複数のダウンロードを同時に処理可能
   - Node.jsのストリーム機能を活用

---

## 🎉 まとめ

### 実装完了項目
- ✅ バックエンドのストリーミングダウンロード
- ✅ フロントエンドのdocumentsAPI作成
- ✅ 薬剤師側契約詳細ページの統合
- ✅ 薬局側契約詳細ページの統合
- ✅ 薬局側請求書ページの統合

### 改善された点
- 🎯 ダウンロード方法の統一
- 🔐 認証トークンの自動付与
- 🌏 日本語ファイル名対応
- ⚡ ストリーミングでパフォーマンス向上
- 🛡️ エラーハンドリングの強化

### リンターエラー
- ✅ エラーなし

---

## 📝 今後の拡張案

### オプション機能

1. **ダウンロード進捗表示**
   - 大きなファイルの場合、進捗バーを表示

2. **ダウンロード履歴**
   - ユーザーがダウンロードした履歴を表示

3. **プレビュー機能**
   - PDFをブラウザ内で表示

4. **一括ダウンロード**
   - 複数のドキュメントをZIPでダウンロード

---

以上、PDFダウンロード機能の実装が完了しました！

