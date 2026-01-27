import { Router } from 'express';
import { authenticate, requireUserType } from '../middleware/auth';
import { PharmacistProfileController, uploadMiddleware } from '../controllers/pharmacist-profile.controller';

const router = Router();
const profileController = new PharmacistProfileController();

// すべてのルートに認証を適用
router.use(authenticate);
router.use(requireUserType('pharmacist'));

// プロフィール取得・更新
router.get('/:pharmacistId', profileController.getProfile);
router.put('/:pharmacistId', profileController.updateProfile);

// 証明書アップロード
router.post(
  '/:pharmacistId/certificates',
  uploadMiddleware,
  profileController.uploadCertificate
);

// 証明書一覧取得
router.get('/:pharmacistId/certificates', profileController.getCertificates);

// 証明書削除
router.delete(
  '/:pharmacistId/certificates/:certificateId',
  profileController.deleteCertificate
);

// 証明書確認ステータス取得
router.get(
  '/:pharmacistId/verification-status',
  profileController.getVerificationStatus
);

export default router;

