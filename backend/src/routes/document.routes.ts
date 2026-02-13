import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const documentController = new DocumentController();

// ドキュメントをダウンロード
router.get('/:id/download', authenticate, (req, res) =>
  documentController.downloadDocument(req, res)
);

// 契約に紐づくドキュメント一覧を取得
router.get('/contract/:contractId', authenticate, (req, res) =>
  documentController.getDocumentsByContract(req, res)
);

export default router;




