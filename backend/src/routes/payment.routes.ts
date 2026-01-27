import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorizeUserType } from '../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

// 支払い報告 - 薬局のみ
router.post(
  '/:id/report',
  authenticate,
  authorizeUserType('pharmacy'),
  (req, res) => paymentController.reportPayment(req, res)
);

// 支払い確認 - 管理者のみ（将来実装）
router.post(
  '/:id/confirm',
  authenticate,
  // TODO: authorizeUserType('admin'),
  (req, res) => paymentController.confirmPayment(req, res)
);

// 期限超過チェック - バッチ処理用（認証不要、内部呼び出しのみ）
router.post('/check-overdue', (req, res) =>
  paymentController.checkOverduePayments(req, res)
);

// 請求書一覧を取得（薬局側）
router.get(
  '/pharmacy/:pharmacyId',
  authenticate,
  authorizeUserType('pharmacy'),
  (req, res) => paymentController.getPaymentsByPharmacy(req, res)
);

// ペナルティ一覧を取得（薬局側）
router.get(
  '/pharmacy/:pharmacyId/penalties',
  authenticate,
  authorizeUserType('pharmacy'),
  (req, res) => paymentController.getPenaltiesByPharmacy(req, res)
);

// ペナルティ解除申請（薬局側）
router.post(
  '/penalties/:id/request-resolution',
  authenticate,
  authorizeUserType('pharmacy'),
  (req, res) => paymentController.requestPenaltyResolution(req, res)
);

// 請求書詳細を取得
router.get('/:id', authenticate, (req, res) =>
  paymentController.getPaymentById(req, res)
);

export default router;

