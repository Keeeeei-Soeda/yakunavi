import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { MessageController } from '../controllers/message.controller';

const router = Router();
const messageController = new MessageController();

// すべてのルートに認証を適用
router.use(authenticate);

// 会話リスト取得
router.get('/conversations/:relatedId', messageController.getConversations);

// メッセージ一覧取得
router.get('/:applicationId', messageController.getMessages);

// メッセージ送信
router.post('/:applicationId', messageController.sendMessage);

// 初回出勤日候補提案（薬局側）
router.post('/:applicationId/propose-dates', messageController.proposeDates);

// 初回出勤日選択（薬剤師側）
router.post('/:applicationId/select-date', messageController.selectDate);

export default router;

