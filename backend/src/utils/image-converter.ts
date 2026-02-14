import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * HEIC/HEIF形式の画像をJPEGに変換
 * @param inputPath 入力ファイルパス
 * @param outputPath 出力ファイルパス（省略時は自動生成）
 * @returns 変換後のファイルパス
 */
export async function convertHeicToJpeg(
  inputPath: string,
  outputPath?: string
): Promise<string> {
  try {
    // 出力パスが指定されていない場合は、入力ファイルと同じディレクトリにJPEGとして保存
    if (!outputPath) {
      const dir = path.dirname(inputPath);
      const baseName = path.basename(inputPath, path.extname(inputPath));
      outputPath = path.join(dir, `${baseName}.jpg`);
    }

    // HEIC/HEIFをJPEGに変換
    await sharp(inputPath)
      .jpeg({ quality: 90 }) // 高品質で保存
      .toFile(outputPath);

    // 元のファイルを削除
    if (fs.existsSync(inputPath) && inputPath !== outputPath) {
      fs.unlinkSync(inputPath);
    }

    return outputPath;
  } catch (error: any) {
    console.error('HEIC to JPEG conversion error:', error);
    throw new Error(`画像の変換に失敗しました: ${error.message}`);
  }
}

/**
 * 画像ファイルがHEIC/HEIF形式かどうかを判定
 * @param mimeType MIMEタイプ
 * @returns HEIC/HEIF形式の場合true
 */
export function isHeicFormat(mimeType: string): boolean {
  return mimeType === 'image/heic' || mimeType === 'image/heif';
}

/**
 * 画像ファイルを必要に応じて変換
 * @param filePath ファイルパス
 * @param mimeType MIMEタイプ
 * @returns 変換後のファイルパス（変換不要の場合は元のパス）
 */
export async function convertImageIfNeeded(
  filePath: string,
  mimeType: string
): Promise<{ filePath: string; fileName: string }> {
  // HEIC/HEIF形式の場合はJPEGに変換
  if (isHeicFormat(mimeType)) {
    const originalFileName = path.basename(filePath);
    const baseName = path.basename(originalFileName, path.extname(originalFileName));
    const dir = path.dirname(filePath);
    const newFileName = `${baseName}.jpg`;
    const newFilePath = path.join(dir, newFileName);

    const convertedPath = await convertHeicToJpeg(filePath, newFilePath);
    return {
      filePath: convertedPath,
      fileName: newFileName,
    };
  }

  // 変換不要の場合はそのまま返す
  return {
    filePath,
    fileName: path.basename(filePath),
  };
}

