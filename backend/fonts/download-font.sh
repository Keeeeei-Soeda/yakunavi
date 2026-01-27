#!/bin/bash

# Noto Sans JP フォントダウンロードスクリプト

echo "📥 Noto Sans JP フォントをダウンロード中..."

# フォントディレクトリに移動
cd "$(dirname "$0")"

# Google Fonts APIから直接ダウンロードを試行
echo "方法1: Google Fonts APIからダウンロード..."
curl -L -o NotoSansJP-Regular.ttf \
  "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400&display=swap" \
  2>/dev/null

# ファイルが正しくダウンロードされたか確認
if [ -f "NotoSansJP-Regular.ttf" ]; then
    file_type=$(file -b NotoSansJP-Regular.ttf)
    if [[ "$file_type" == *"TrueType"* ]] || [[ "$file_type" == *"OpenType"* ]]; then
        echo "✅ フォントファイルのダウンロードに成功しました！"
        ls -lh NotoSansJP-Regular.ttf
        exit 0
    else
        echo "❌ ダウンロードしたファイルがフォントファイルではありません"
        rm -f NotoSansJP-Regular.ttf
    fi
fi

echo ""
echo "⚠️  自動ダウンロードに失敗しました"
echo ""
echo "📋 手動ダウンロード手順:"
echo "1. 以下のURLにアクセス:"
echo "   https://fonts.google.com/noto/specimen/Noto+Sans+JP"
echo ""
echo "2. 「Download family」ボタンをクリック"
echo ""
echo "3. ZIPファイルを解凍"
echo ""
echo "4. 以下のファイルをこのディレクトリにコピー:"
echo "   NotoSansJP-Regular.ttf"
echo ""
echo "5. ファイルパスを確認:"
echo "   $(pwd)/NotoSansJP-Regular.ttf"
echo ""

