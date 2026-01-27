import { Router } from 'express';
import { authenticate, requireUserType } from '../middleware/auth';
import { ApplicationController } from '../controllers/application.controller';

const router = Router();
const applicationController = new ApplicationController();

// すべてのルートに認証を適用
router.use(authenticate);

// 応募作成（薬剤師のみ）
router.post(
  '/',
  requireUserType('pharmacist'),
  applicationController.createApplication
);

// 応募詳細取得
router.get('/:id', applicationController.getApplication);

// 応募ステータス更新（薬局のみ）
router.patch(
  '/:id/status',
  requireUserType('pharmacy'),
  applicationController.updateApplicationStatus
);

// 応募取り下げ（薬剤師のみ）
// ⚠️ 廃止：一度応募したら、基本的に取り下げはできません
// やむを得ない場合は運営（support@yakunavi.jp）までご連絡ください
// router.post(
//   '/:id/withdraw',
//   requireUserType('pharmacist'),
//   applicationController.withdrawApplication
// );

// 薬局の応募一覧取得
router.get('/pharmacy/:pharmacyId', applicationController.getPharmacyApplications);

// 薬剤師の応募一覧取得
router.get(
  '/pharmacist/:pharmacistId',
  applicationController.getPharmacistApplications
);

export default router;

