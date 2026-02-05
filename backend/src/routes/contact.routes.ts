import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';

const router = Router();
const contactController = new ContactController();

// 問い合わせフォーム送信
router.post('/', contactController.submitContact);

// テストメール送信
router.post('/test', contactController.sendTestEmail);

export default router;

