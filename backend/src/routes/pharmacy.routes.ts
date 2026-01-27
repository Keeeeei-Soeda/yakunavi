import { Router } from 'express';
import { authenticate, requireUserType } from '../middleware/auth';
import { PharmacyController } from '../controllers/pharmacy.controller';

const router = Router();
const pharmacyController = new PharmacyController();

// 認証が必要
router.use(authenticate);

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
