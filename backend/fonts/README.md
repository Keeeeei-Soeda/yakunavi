# フォントファイル配置ディレクトリ

## 📝 説明

このディレクトリに日本語フォントファイルを配置してください。

## 🔽 推奨フォント

### Noto Sans JP（推奨）

1. **ダウンロード**
   - https://fonts.google.com/noto/specimen/Noto+Sans+JP
   - 「Download family」をクリック
   - ZIPファイルをダウンロード

2. **配置**
   - ZIPを解凍
   - `NotoSansJP-Regular.ttf` をこのディレクトリに配置
   - ファイル名: `NotoSansJP-Regular.ttf`

3. **確認**
   ```
   backend/fonts/NotoSansJP-Regular.ttf
   ```

## 📋 ファイル構造

```
backend/
└── fonts/
    ├── README.md (このファイル)
    └── NotoSansJP-Regular.ttf (配置してください)
```

## ⚠️ 注意事項

- フォントファイルは `.gitignore` に追加しないでください（プロジェクトに含めます）
- ファイルサイズは約5MBです
- ライセンス: SIL Open Font License（商用利用可）

## 🚀 使用方法

フォントファイルを配置後、バックエンドを再起動すると自動的に検出されます。

```bash
cd backend
npm run dev
```

