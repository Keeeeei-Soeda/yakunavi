import { Router } from 'express';
import { authenticate, requireUserType } from '../middleware/auth';
import { PharmacyController } from '../controllers/pharmacy.controller';
import { PharmacyBranchController } from '../controllers/pharmacy-branch.controller';

const router = Router();
const pharmacyController = new PharmacyController();
const branchController = new PharmacyBranchController();

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

// 薬局プロフィール取得（薬剤師側からもアクセス可能）
router.get(
    '/public-profile/:pharmacyId',
    pharmacyController.getPublicProfile
);

// ===== PharmacyBranch（薬局単位） =====
// 薬局一覧取得
router.get(
    '/:pharmacyId/branches',
    requireUserType('pharmacy'),
    (req, res) => branchController.getBranches(req as any, res)
);

// 薬局1件取得
router.get(
    '/:pharmacyId/branches/:branchId',
    requireUserType('pharmacy'),
    (req, res) => branchController.getBranch(req as any, res)
);

// 薬局追加
router.post(
    '/:pharmacyId/branches',
    requireUserType('pharmacy'),
    (req, res) => branchController.createBranch(req as any, res)
);

// 薬局更新
router.put(
    '/:pharmacyId/branches/:branchId',
    requireUserType('pharmacy'),
    (req, res) => branchController.updateBranch(req as any, res)
);

// 薬局削除
router.delete(
    '/:pharmacyId/branches/:branchId',
    requireUserType('pharmacy'),
    (req, res) => branchController.deleteBranch(req as any, res)
);

export default router;
