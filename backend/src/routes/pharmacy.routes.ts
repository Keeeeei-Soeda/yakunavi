import { Router } from 'express';
import { authenticate, requireUserType } from '../middleware/auth';
import { PharmacyController } from '../controllers/pharmacy.controller';

const router = Router();
const pharmacyController = new PharmacyController();

// 認証が必要
router.use(authenticate);

// 薬局プロフィール取得（薬局のみ）
router.get(
    '/profile/:pharmacyId',
    requireUserType('pharmacy'),
    pharmacyController.getProfile
);

// 薬局プロフィール更新（薬局のみ）
router.put(
    '/profile/:pharmacyId',
    requireUserType('pharmacy'),
    pharmacyController.updateProfile
);

// ダッシュボード統計（薬局のみ）
router.get(
    '/dashboard/:pharmacyId/stats',
    requireUserType('pharmacy'),
    pharmacyController.getDashboardStats
);

// 最近の応募（薬局のみ）
router.get(
    '/dashboard/:pharmacyId/recent-applications',
    requireUserType('pharmacy'),
    pharmacyController.getRecentApplications
);

// アクティブな求人（薬局のみ）
router.get(
    '/dashboard/:pharmacyId/active-job-postings',
    requireUserType('pharmacy'),
    pharmacyController.getActiveJobPostings
);

export default router;
