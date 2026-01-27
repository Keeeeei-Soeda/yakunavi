import { Router } from 'express';
import { PharmacyDashboardController } from '../controllers/pharmacy-dashboard.controller';

const router = Router();
const dashboardController = new PharmacyDashboardController();

// 開発環境用: 認証なしでアクセス可能
// 本番環境では使用しないでください

// ダッシュボード（認証スキップ版）
router.get('/dashboard/:pharmacyId/stats', async (req, res) => {
  // モックユーザーを設定
  (req as any).user = { userType: 'pharmacy' };
  await dashboardController.getDashboardStats(req as any, res);
});

router.get('/dashboard/:pharmacyId/recent-applications', async (req, res) => {
  (req as any).user = { userType: 'pharmacy' };
  await dashboardController.getRecentApplications(req as any, res);
});

router.get('/dashboard/:pharmacyId/active-job-postings', async (req, res) => {
  (req as any).user = { userType: 'pharmacy' };
  await dashboardController.getActiveJobPostings(req as any, res);
});

router.get('/dashboard/:pharmacyId/monthly-stats', async (req, res) => {
  (req as any).user = { userType: 'pharmacy' };
  await dashboardController.getMonthlyApplicationStats(req as any, res);
});

export default router;

