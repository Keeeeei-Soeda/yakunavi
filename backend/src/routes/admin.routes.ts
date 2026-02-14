import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

// すべてのルートに管理者認証を適用
router.use(authenticateAdmin);

// ダッシュボード
router.get('/dashboard/stats', (req, res) => adminController.getDashboardStats(req, res));

// 資格証明書管理
router.get('/certificates', (req, res) => adminController.getCertificates(req, res));
router.get('/certificates/:id/file', (req, res) => adminController.getCertificateFile(req, res));
router.post('/certificates/:id/approve', (req, res) =>
    adminController.approveCertificate(req, res)
);
router.post('/certificates/:id/reject', (req, res) =>
    adminController.rejectCertificate(req, res)
);

// 契約管理
router.get('/contracts', (req, res) => adminController.getContracts(req, res));

// 支払い管理
router.get('/payments', (req, res) => adminController.getPayments(req, res));
router.get('/payments/:id', (req, res) => adminController.getPaymentById(req, res));
router.post('/payments/:id/confirm', (req, res) => adminController.confirmPayment(req, res));

// ペナルティ管理
router.get('/penalties', (req, res) => adminController.getPenalties(req, res));
router.post('/penalties/:id/resolve', (req, res) => adminController.resolvePenalty(req, res));

// 統計・レポート
router.get('/statistics', (req, res) => adminController.getStatistics(req, res));

// 求人管理
router.get('/job-postings', (req, res) => adminController.getJobPostings(req, res));

// 応募管理
router.get('/applications', (req, res) => adminController.getApplications(req, res));

// ユーザー管理
router.get('/pharmacists', (req, res) => adminController.getPharmacists(req, res));
router.get('/pharmacists/:id', (req, res) => adminController.getPharmacistById(req, res));
router.get('/pharmacies', (req, res) => adminController.getPharmacies(req, res));
router.get('/pharmacies/:id', (req, res) => adminController.getPharmacyById(req, res));
router.post('/users/:id/toggle-status', (req, res) => adminController.toggleUserStatus(req, res));

export default router;

