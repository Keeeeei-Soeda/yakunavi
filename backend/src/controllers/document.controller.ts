import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import path from 'path';
import fs from 'fs';

export class DocumentController {
  /**
   * ドキュメントをダウンロード
   * GET /api/documents/:id/download
   */
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

      // ファイルが存在するか確認
      if (!fs.existsSync(document.filePath)) {
        return res.status(404).json({
          success: false,
          error: 'ファイルが見つかりません',
        });
      }

      // ファイル名を取得
      const fileName = path.basename(document.filePath);

      // ダウンロード記録を更新（薬局側または薬剤師側）
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
      // RFC 5987に準拠した日本語ファイル名対応
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
      );
      
      // ファイルをストリームとして送信（確実なダウンロード方法）
      const fileStream = fs.createReadStream(document.filePath);
      
      // エラーハンドリング
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'ファイルの読み込みに失敗しました',
          });
        }
      });
      
      // ストリームをレスポンスにパイプして終了
      fileStream.pipe(res);
      
      // 明示的にreturnしてTypeScriptエラーを回避
      return;
    } catch (error: any) {
      console.error('Download document error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'ドキュメントのダウンロードに失敗しました',
      });
    }
  }

  /**
   * 契約に紐づくドキュメント一覧を取得
   * GET /api/documents/contract/:contractId
   */
  async getDocumentsByContract(req: Request, res: Response) {
    try {
      const contractId = BigInt(req.params.contractId);

      const documents = await prisma.document.findMany({
        where: { contractId },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.json({
        success: true,
        data: documents.map((doc) => ({
          ...doc,
          id: Number(doc.id),
          contractId: doc.contractId ? Number(doc.contractId) : null,
          pharmacyId: doc.pharmacyId ? Number(doc.pharmacyId) : null,
          pharmacistId: doc.pharmacistId ? Number(doc.pharmacistId) : null,
        })),
      });
    } catch (error: any) {
      console.error('Get documents by contract error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'ドキュメント一覧の取得に失敗しました',
      });
    }
  }
}


