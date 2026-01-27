# フォントファイル手動ダウンロード手順

## 🎯 目的

PDFの日本語文字化けを解決するため、Noto Sans JPフォントをダウンロードして配置します。

## 📥 ダウンロード手順

### 方法1: Google Fontsから直接ダウンロード（推奨）

1. **ブラウザで以下のURLにアクセス**
   ```
   https://fonts.google.com/noto/specimen/Noto+Sans+JP
   ```

2. **「Download family」ボタンをクリック**
   - ページ右上の「Download family」ボタンをクリック
   - ZIPファイルがダウンロードされます（約5MB）

3. **ZIPファイルを解凍**
   ```bash
   # ダウンロードフォルダで
   unzip Noto_Sans_JP.zip
   ```

4. **フォントファイルをコピー**
   - 解凍したフォルダ内の `NotoSansJP-Regular.ttf` を探す
   - このファイルを以下の場所にコピー:
     ```
     backend/fonts/NotoSansJP-Regular.ttf
     ```

5. **確認**
   ```bash
   ls -lh backend/fonts/NotoSansJP-Regular.ttf
   ```
   - ファイルサイズは約5MBであることを確認

### 方法2: GitHubから直接ダウンロード

1. **以下のURLにアクセス**
   ```
   https://github.com/google/fonts/tree/main/ofl/notosansjp
   ```

2. **`NotoSansJP-Regular.ttf` をクリック**

3. **「Download」ボタンをクリック**

4. **ファイルを配置**
   ```
   backend/fonts/NotoSansJP-Regular.ttf
   ```

## ✅ 配置後の確認

### 1. ファイルが正しく配置されているか確認

```bash
cd backend/fonts
ls -lh NotoSansJP-Regular.ttf
```

**期待される結果:**
```
-rw-r--r--  1 user  staff   5.0M  Jan 28 04:15 NotoSansJP-Regular.ttf
```

### 2. ファイルタイプを確認

```bash
file NotoSansJP-Regular.ttf
```

**期待される結果:**
```
NotoSansJP-Regular.ttf: TrueType font data
```

### 3. バックエンドを再起動

フォントファイルを配置後、バックエンドが自動的に再起動します（nodemon使用時）。

手動で再起動する場合:
```bash
cd backend
npm run dev
```

## 🧪 テスト方法

1. **新しい契約を作成**（既存のPDFは再生成が必要）
2. **請求書をダウンロード**
3. **PDFを開いて日本語が正しく表示されるか確認**

## ⚠️ 注意事項

- フォントファイルは約5MBです
- ファイル名は正確に `NotoSansJP-Regular.ttf` である必要があります
- 大文字小文字を区別します

## 🔄 現在の実装について

現在の実装では、システムに日本語フォントがインストールされている場合は自動的に使用されます。

**macOSの場合:**
- ヒラギノ角ゴシックが自動検出されます
- 追加のダウンロードは不要かもしれません

**確認方法:**
システムフォントでPDFを生成して、文字化けが解消されているか確認してください。
もし文字化けが続く場合は、上記の手順でフォントファイルを配置してください。

## 📞 サポート

問題が解決しない場合:
1. フォントファイルのパスを確認
2. ファイルの権限を確認
3. バックエンドのログを確認

