# PDFダウンロード機能の改善提案

## 現在の問題

現在のPDFダウンロード実装では、`res.download()`を使用していますが、以下の問題が発生する可能性があります：

1. CORSの問題
2. フロントエンドとバックエンドが別ドメインの場合の問題
3. ブラウザのセキュリティ制限

## 推奨する解決方法

### 方法1: 直接ダウンロードリンク（最も簡単）

**メリット：**
- 実装が簡単
- 確実に動作する
- ブラウザのネイティブダウンロード機能を使用

**実装方法：**

#### バックエンド（現在の実装を維持）
```typescript
// backend/src/controllers/document.controller.ts
async downloadDocument(req: Request, res: Response) {
  try {
    const documentId = BigInt(req.params.id);
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'ドキュメントが見つかりません',
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        error: 'ファイルが見つかりません',
      });
    }

    const fileName = path.basename(document.filePath);

    // ダウンロード記録を更新
    const userType = req.query.userType as string;
    if (userType === 'pharmacy') {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          downloadedByPharmacy: true,
          pharmacyDownloadedAt: new Date(),
        },
      });
    } else if (userType === 'pharmacist') {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          downloadedByPharmacist: true,
          pharmacistDownloadedAt: new Date(),
        },
      });
    }

    // Content-Dispositionヘッダーを設定してダウンロード
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    
    // ファイルをストリームとして送信
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error('Download document error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'ドキュメントのダウンロードに失敗しました',
    });
  }
}
```

#### フロントエンド
```typescript
// 方法A: window.openを使用
const handleDownload = (documentId: number) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}/download?userType=pharmacist`;
  window.open(url, '_blank');
};

// 方法B: aタグのdownload属性を使用（より確実）
const handleDownload = async (documentId: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}/download?userType=pharmacist`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error('ダウンロードに失敗しました');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${documentId}.pdf`; // ファイル名
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download error:', error);
    alert('ダウンロードに失敗しました');
  }
};
```

---

### 方法2: Base64エンコード（ファイルが小さい場合）

**メリット：**
- 確実に動作する
- CORSの問題がない

**デメリット：**
- ファイルサイズが大きくなる（約33%増加）
- 大きなファイルには不向き

**実装方法：**

#### バックエンド
```typescript
async downloadDocument(req: Request, res: Response) {
  try {
    const documentId = BigInt(req.params.id);
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || !fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        error: 'ドキュメントが見つかりません',
      });
    }

    // ファイルをBase64に変換
    const fileBuffer = fs.readFileSync(document.filePath);
    const base64 = fileBuffer.toString('base64');
    const fileName = path.basename(document.filePath);

    return res.json({
      success: true,
      data: {
        fileName,
        mimeType: 'application/pdf',
        base64,
      },
    });
  } catch (error: any) {
    console.error('Download document error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'ドキュメントのダウンロードに失敗しました',
    });
  }
}
```

#### フロントエンド
```typescript
const handleDownload = async (documentId: number) => {
  try {
    const response = await documentsAPI.download(documentId);
    if (!response.success || !response.data) {
      throw new Error('ダウンロードに失敗しました');
    }

    const { fileName, base64, mimeType } = response.data;
    
    // Base64をBlobに変換
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    // ダウンロード
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download error:', error);
    alert('ダウンロードに失敗しました');
  }
};
```

---

### 方法3: 署名付きURL（AWS S3などを使用する場合）

**メリット：**
- 最もスケーラブル
- サーバー負荷が少ない
- セキュリティが高い

**デメリット：**
- AWS S3などのクラウドストレージが必要
- 実装が複雑

---

## 推奨する実装

**現時点では「方法1: 直接ダウンロードリンク」を推奨します。**

理由：
1. 実装が簡単
2. 確実に動作する
3. ファイルサイズに制限がない
4. ブラウザのネイティブダウンロード機能を活用

### 実装手順

1. バックエンドのdocument.controller.tsを修正（上記のコードを参照）
2. フロントエンドのダウンロードボタンを修正
3. 認証トークンをヘッダーに含める
4. エラーハンドリングを追加

---

## テスト方法

1. 薬剤師としてログイン
2. 契約詳細ページに移動
3. 「労働条件通知書をダウンロード」ボタンをクリック
4. PDFがダウンロードされることを確認
5. ダウンロードしたPDFを開けることを確認

---

## その他の注意点

### ファイル名の日本語対応

ファイル名に日本語を含める場合は、RFC 5987に準拠した形式を使用：

```typescript
res.setHeader(
  'Content-Disposition',
  `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
);
```

### セキュリティ

- 認証トークンを必ずチェック
- ユーザーが自分の契約書のみダウンロードできるように制限
- ダウンロード履歴を記録

### パフォーマンス

- 大きなファイルの場合はストリーミングを使用
- キャッシュヘッダーを適切に設定

