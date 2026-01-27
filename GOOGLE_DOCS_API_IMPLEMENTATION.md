# Google ドキュメントAPI連携実装ガイド

## 🎯 概要

Google ドキュメントAPIを使用して、契約書や請求書を自動生成し、共有リンクやPDFダウンロードを提供する方法です。

---

## ✅ メリット

### 1. **高品質な日本語表示**
- Google ドキュメントは日本語フォントを完全サポート
- 文字化けの問題が発生しない
- 美しいレイアウトが自動的に適用される

### 2. **柔軟な編集**
- 生成後に手動で編集可能
- テンプレート機能で柔軟なカスタマイズ
- リアルタイムでの共同編集も可能

### 3. **共有機能**
- リンク共有が簡単
- 権限管理（閲覧のみ、編集可など）
- 有効期限の設定も可能

### 4. **複数形式でのエクスポート**
- Google ドキュメント形式
- PDF形式
- Word形式
- その他の形式

### 5. **バージョン管理**
- 変更履歴の自動保存
- 過去のバージョンに戻せる

---

## ⚠️ デメリット・注意点

### 1. **API制限**
- 1日あたりのリクエスト数に制限あり
- 大量生成時は注意が必要

### 2. **依存関係**
- Google Cloud Platformのアカウントが必要
- サービスアカウントの設定が必要
- インターネット接続が必要

### 3. **コスト**
- 無料枠あり（通常は十分）
- 大量使用時は課金の可能性

### 4. **レイテンシ**
- API呼び出しに時間がかかる場合がある
- 非同期処理が必要な場合も

---

## 🚀 実装方法

### 方法1: Google Docs API（推奨）

#### 必要なパッケージ

```bash
npm install googleapis
```

#### 実装手順

1. **Google Cloud Platformでプロジェクト作成**
2. **Google Docs APIを有効化**
3. **サービスアカウントを作成**
4. **認証情報（JSON）をダウンロード**
5. **コード実装**

---

## 📝 実装コード例

### 1. 認証設定

```typescript
// backend/src/services/google-docs.service.ts
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export class GoogleDocsService {
    private auth: any;
    private docs: any;

    constructor() {
        // サービスアカウントの認証情報を読み込み
        const keyPath = path.join(process.cwd(), 'credentials', 'service-account-key.json');
        
        if (!fs.existsSync(keyPath)) {
            throw new Error('Googleサービスアカウントの認証情報が見つかりません');
        }

        const keyFile = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        
        this.auth = new google.auth.GoogleAuth({
            credentials: keyFile,
            scopes: [
                'https://www.googleapis.com/auth/documents',
                'https://www.googleapis.com/auth/drive',
            ],
        });

        this.docs = google.docs({ version: 'v1', auth: this.auth });
        this.drive = google.drive({ version: 'v3', auth: this.auth });
    }

    /**
     * 契約書をGoogle ドキュメントとして作成
     */
    async createContractDocument(data: ContractData): Promise<{
        documentId: string;
        shareUrl: string;
        downloadUrl: string;
    }> {
        // 1. 新しいドキュメントを作成
        const document = await this.docs.documents.create({
            requestBody: {
                title: `契約書 ${data.contractNumber}`,
            },
        });

        const documentId = document.data.documentId!;

        // 2. ドキュメントの内容を挿入
        await this.docs.documents.batchUpdate({
            documentId,
            requestBody: {
                requests: [
                    // タイトル
                    {
                        insertText: {
                            location: { index: 1 },
                            text: '契約書\n\n',
                        },
                    },
                    // スタイル設定
                    {
                        updateParagraphStyle: {
                            range: {
                                startIndex: 1,
                                endIndex: 4,
                            },
                            paragraphStyle: {
                                namedStyleType: 'HEADING_1',
                            },
                            fields: 'namedStyleType',
                        },
                    },
                    // 契約内容を挿入
                    {
                        insertText: {
                            location: { index: 4 },
                            text: this.formatContractContent(data),
                        },
                    },
                ],
            },
        });

        // 3. 共有設定（リンク共有を有効化）
        await this.drive.permissions.create({
            fileId: documentId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // 4. 共有リンクを取得
        const shareUrl = `https://docs.google.com/document/d/${documentId}/edit`;

        // 5. PDFダウンロードURL
        const downloadUrl = `https://docs.google.com/document/d/${documentId}/export?format=pdf`;

        return {
            documentId,
            shareUrl,
            downloadUrl,
        };
    }

    /**
     * PDFとしてダウンロード
     */
    async downloadAsPDF(documentId: string): Promise<Buffer> {
        const response = await this.drive.files.export(
            {
                fileId: documentId,
                mimeType: 'application/pdf',
            },
            { responseType: 'arraybuffer' }
        );

        return Buffer.from(response.data);
    }

    /**
     * 契約内容をフォーマット
     */
    private formatContractContent(data: ContractData): string {
        return `
契約番号: ${data.contractNumber}

【契約当事者】
薬局名: ${data.pharmacyName}
薬剤師名: ${data.pharmacistName}

【契約内容】
初回出勤日: ${this.formatDate(data.initialWorkDate)}
勤務日数: ${data.workDays}日
日給: ¥${data.dailyWage.toLocaleString()}
報酬総額: ¥${data.totalCompensation.toLocaleString()}

【重要事項】
・プラットフォーム手数料は初回出勤日の3日前までにお支払いください
・手数料支払い確認後、薬剤師の連絡先が開示されます

契約日: ${this.formatDate(new Date())}
        `.trim();
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}年${month}月${day}日`;
    }
}
```

---

### 2. コントローラー実装

```typescript
// backend/src/controllers/document.controller.ts に追加

import { GoogleDocsService } from '../services/google-docs.service';

export class DocumentController {
    private googleDocsService: GoogleDocsService;

    constructor() {
        this.googleDocsService = new GoogleDocsService();
    }

    /**
     * Google ドキュメントとして契約書を作成
     */
    async createGoogleDocContract(req: AuthRequest, res: Response) {
        try {
            const { contractId } = req.params;
            
            // 契約情報を取得
            const contract = await prisma.contract.findUnique({
                where: { id: BigInt(contractId) },
                include: {
                    application: {
                        include: {
                            jobPosting: {
                                include: { pharmacy: true },
                            },
                            pharmacist: true,
                        },
                    },
                },
            });

            if (!contract) {
                return res.status(404).json({
                    success: false,
                    error: '契約が見つかりません',
                });
            }

            // Google ドキュメントを作成
            const result = await this.googleDocsService.createContractDocument({
                contractNumber: `CNT-${contract.id}`,
                pharmacyName: contract.application.jobPosting.pharmacy.pharmacyName,
                pharmacistName: `${contract.application.pharmacist.lastName} ${contract.application.pharmacist.firstName}`,
                initialWorkDate: contract.initialWorkDate,
                workDays: contract.workDays,
                dailyWage: contract.dailyWage,
                totalCompensation: contract.totalCompensation,
            });

            // データベースに保存
            await prisma.document.create({
                data: {
                    contractId: BigInt(contractId),
                    documentType: 'contract',
                    filePath: result.shareUrl, // Google ドキュメントのURL
                    fileUrl: result.downloadUrl, // PDFダウンロードURL
                    uploadedBy: 'system',
                },
            });

            return res.status(201).json({
                success: true,
                data: {
                    documentId: result.documentId,
                    shareUrl: result.shareUrl,
                    downloadUrl: result.downloadUrl,
                },
            });
        } catch (error: any) {
            console.error('Create Google Doc error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Google ドキュメントの作成に失敗しました',
            });
        }
    }
}
```

---

## 🔧 セットアップ手順

### 1. Google Cloud Platformでプロジェクト作成

1. https://console.cloud.google.com/ にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト名: `yaku-navi-docs`

### 2. Google Docs APIとDrive APIを有効化

1. 「APIとサービス」→「ライブラリ」
2. 「Google Docs API」を検索して有効化
3. 「Google Drive API」を検索して有効化

### 3. サービスアカウントを作成

1. 「IAMと管理」→「サービスアカウント」
2. 「サービスアカウントを作成」
3. 名前: `yaku-navi-docs-service`
4. 役割: エディター（または必要に応じて）

### 4. 認証情報をダウンロード

1. 作成したサービスアカウントをクリック
2. 「キー」タブ
3. 「キーを追加」→「JSONを作成」
4. ダウンロードしたJSONファイルを `backend/credentials/service-account-key.json` に配置

### 5. パッケージをインストール

```bash
cd backend
npm install googleapis
npm install --save-dev @types/googleapis
```

---

## 📊 比較: PDFKit vs Google Docs API

| 項目 | PDFKit | Google Docs API |
|------|--------|-----------------|
| **日本語対応** | フォント設定必要 | ✅ 完全対応 |
| **文字化け** | 発生する可能性 | ❌ 発生しない |
| **編集** | 不可 | ✅ 可能 |
| **共有** | 不可 | ✅ 可能 |
| **依存関係** | なし | Google Cloud必要 |
| **コスト** | 無料 | 無料枠あり |
| **レイテンシ** | 速い | やや遅い |
| **オフライン** | 可能 | 不可 |

---

## 🎯 推奨実装方針

### ハイブリッド方式（推奨）

1. **通常の請求書**: PDFKitを使用（高速、オフライン対応）
2. **重要な契約書**: Google ドキュメントAPIを使用（編集可能、共有可能）

### 実装例

```typescript
// 契約書の種類に応じて選択
if (documentType === 'contract' && useGoogleDocs) {
    // Google ドキュメントで作成
    return await googleDocsService.createContractDocument(data);
} else {
    // PDFKitで作成
    return await pdfService.generateInvoice(data);
}
```

---

## 🔐 セキュリティ考慮事項

### 1. 認証情報の管理

```bash
# .gitignoreに追加
backend/credentials/
*.json
```

### 2. 環境変数での管理（推奨）

```typescript
// 環境変数から読み込み
const keyFile = {
    type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // ...
};
```

### 3. 共有リンクの権限設定

```typescript
// 閲覧のみ
await this.drive.permissions.create({
    fileId: documentId,
    requestBody: {
        role: 'reader',
        type: 'anyone',
    },
});

// 期限付き共有（30日後）
await this.drive.permissions.create({
    fileId: documentId,
    requestBody: {
        role: 'reader',
        type: 'anyone',
        expirationTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
});
```

---

## 📝 実装の優先順位

### Phase 1: 基本実装
1. ✅ Google Docs APIのセットアップ
2. ✅ サービスアカウントの認証
3. ✅ 基本的なドキュメント作成

### Phase 2: 機能拡張
1. テンプレート機能
2. 共有リンクの生成
3. PDFダウンロード機能

### Phase 3: 高度な機能
1. バージョン管理
2. コメント機能
3. 通知機能

---

## 🧪 テスト方法

### 1. ローカルテスト

```typescript
// テストコード
const service = new GoogleDocsService();
const result = await service.createContractDocument({
    contractNumber: 'CNT-TEST-001',
    pharmacyName: 'テスト薬局',
    pharmacistName: 'テスト 太郎',
    // ...
});

console.log('Document ID:', result.documentId);
console.log('Share URL:', result.shareUrl);
```

### 2. エラーハンドリング

```typescript
try {
    const result = await googleDocsService.createContractDocument(data);
} catch (error) {
    if (error.code === 429) {
        // レート制限エラー
        console.error('APIレート制限に達しました');
    } else if (error.code === 403) {
        // 権限エラー
        console.error('API権限が不足しています');
    }
}
```

---

## 💡 まとめ

### Google Docs APIの利点
- ✅ 日本語完全対応（文字化けなし）
- ✅ 編集可能
- ✅ 共有機能
- ✅ バージョン管理

### 実装のポイント
- サービスアカウントの設定が必要
- 認証情報の安全な管理
- エラーハンドリングの実装
- レート制限への対応

### 推奨
- **重要な契約書**: Google Docs API
- **一般的な請求書**: PDFKit（現在の実装）

両方を併用することで、柔軟性とパフォーマンスを両立できます！

