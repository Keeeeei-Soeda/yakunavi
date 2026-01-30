import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';

const router = Router();
const contactController = new ContactController();

// 問い合わせフォーム送信
router.post('/', contactController.submitContact);

export default router;

