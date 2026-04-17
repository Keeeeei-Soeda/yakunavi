import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// 公開ルート
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// パスワードリセット（未ログイン）
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// 保護されたルート（ログイン必須）
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/change-password', authenticate, authController.changePassword);

export default router;

