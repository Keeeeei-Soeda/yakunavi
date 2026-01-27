import { Router } from 'express';
import { PharmacistDashboardController } from '../controllers/pharmacist-dashboard.controller';

const router = Router();
const dashboardController = new PharmacistDashboardController();

// 開発環境用: 認証なしでアクセス可能
// 本番環境では使用しないでください

// ダッシュボード（認証スキップ版）
router.get('/dashboard/:pharmacistId/stats', async (req, res) => {
  (req as any).user = { userType: 'pharmacist', id: 1 };
  await dashboardController.getDashboardStats(req as any, res);
});

router.get('/dashboard/notifications', async (req, res) => {
  (req as any).user = { userType: 'pharmacist', id: 1 };
  await dashboardController.getRecentNotifications(req as any, res);
});

router.get('/dashboard/:pharmacistId/active-applications', async (req, res) => {
  (req as any).user = { userType: 'pharmacist', id: 1 };
  await dashboardController.getActiveApplications(req as any, res);
});

router.get('/dashboard/:pharmacistId/active-contracts', async (req, res) => {
  (req as any).user = { userType: 'pharmacist', id: 1 };
  await dashboardController.getActiveContracts(req as any, res);
});

router.get('/dashboard/:pharmacistId/application-history', async (req, res) => {
  (req as any).user = { userType: 'pharmacist', id: 1 };
  await dashboardController.getApplicationHistory(req as any, res);
});

export default router;

