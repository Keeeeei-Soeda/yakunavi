import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// 公開ルート
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// 保護されたルート
router.get('/me', authenticate, authController.getCurrentUser);

export default router;

