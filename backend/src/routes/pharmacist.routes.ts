import { Router } from 'express';
import { authenticate, requireUserType } from '../middleware/auth';
import { PharmacistDashboardController } from '../controllers/pharmacist-dashboard.controller';

const router = Router();
const dashboardController = new PharmacistDashboardController();

// すべてのルートに認証と薬剤師ユーザータイプチェックを適用
router.use(authenticate, requireUserType('pharmacist'));

// ダッシュボード
router.get('/dashboard/:pharmacistId/stats', dashboardController.getDashboardStats);
router.get('/dashboard/notifications', dashboardController.getRecentNotifications);
router.get('/dashboard/:pharmacistId/active-applications', dashboardController.getActiveApplications);
router.get('/dashboard/:pharmacistId/active-contracts', dashboardController.getActiveContracts);
router.get('/dashboard/:pharmacistId/application-history', dashboardController.getApplicationHistory);

export default router;

