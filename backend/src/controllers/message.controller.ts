import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MessageService } from '../services/message.service';

export class MessageController {
    private messageService: MessageService;

    constructor() {
        this.messageService = new MessageService();
    }

    /**
     * 会話リストを取得
     */
    getConversations = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: '認証が必要です',
                });
            }

            const { userType } = req.user;
            const relatedId = req.params.relatedId;

            let conversations;

            if (userType === 'pharmacy') {
                conversations = await this.messageService.getPharmacyConversations(
                    BigInt(relatedId)
                );
            } else if (userType === 'pharmacist') {
                conversations = await this.messageService.getPharmacistConversations(
                    BigInt(relatedId)
                );
            } else {
                return res.status(403).json({
                    success: false,
                    error: 'アクセス権限がありません',
                });
            }

            return res.status(200).json({
                success: true,
                data: conversations,
            });
        } catch (error: any) {
            console.error('Get conversations error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || '会話リストの取得に失敗しました',
            });
        }
    };

    /**
     * メッセージ一覧を取得
     */
    getMessages = async (req: AuthRequest, res: Response) => {
        try {
            const applicationId = BigInt(req.params.applicationId);

            const messages = await this.messageService.getMessages(applicationId);

            // メッセージを既読にする
            if (req.user) {
                await this.messageService.markAsRead(
                    applicationId,
                    req.user.userType as 'pharmacy' | 'pharmacist'
                );
            }

            return res.status(200).json({
                success: true,
                data: messages,
            });
        } catch (error: any) {
            console.error('Get messages error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'メッセージの取得に失敗しました',
            });
        }
    };

    /**
     * メッセージを送信
     */
    sendMessage = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: '認証が必要です',
                });
            }

            const applicationId = BigInt(req.params.applicationId);
            const { messageContent } = req.body;

            if (!messageContent) {
                return res.status(400).json({
                    success: false,
                    error: 'メッセージ内容は必須です',
                });
            }

            const message = await this.messageService.sendMessage({
                applicationId,
                senderType: req.user.userType as 'pharmacy' | 'pharmacist',
                senderId: BigInt(req.user.id),
                messageContent,
            });

            return res.status(201).json({
                success: true,
                message: 'メッセージを送信しました',
                data: message,
            });
        } catch (error: any) {
            console.error('Send message error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'メッセージの送信に失敗しました',
            });
        }
    };

    /**
     * 初回出勤日候補を提案（薬局側）
     */
    proposeDates = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user || req.user.userType !== 'pharmacy') {
                return res.status(403).json({
                    success: false,
                    error: '薬局アカウントのみアクセス可能です',
                });
            }

            const applicationId = BigInt(req.params.applicationId);
            const { proposedDates } = req.body;

            if (!proposedDates || !Array.isArray(proposedDates) || proposedDates.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: '候補日は最低1つ必要です',
                });
            }

            const pharmacyId = BigInt(req.body.pharmacyId);

            const result = await this.messageService.proposeDates({
                applicationId,
                pharmacyId,
                proposedDates,
            });

            return res.status(201).json({
                success: true,
                message: '初回出勤日の候補を提案しました',
                data: result,
            });
        } catch (error: any) {
            console.error('Propose dates error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || '候補日の提案に失敗しました',
            });
        }
    };

    /**
     * 初回出勤日を選択（薬剤師側）
     */
    selectDate = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user || req.user.userType !== 'pharmacist') {
                return res.status(403).json({
                    success: false,
                    error: '薬剤師アカウントのみアクセス可能です',
                });
            }

            const applicationId = BigInt(req.params.applicationId);
            const { selectedDate } = req.body;

            if (!selectedDate) {
                return res.status(400).json({
                    success: false,
                    error: '選択日は必須です',
                });
            }

            const pharmacistId = BigInt(req.body.pharmacistId);

            const result = await this.messageService.selectDate(
                applicationId,
                pharmacistId,
                selectedDate
            );

            return res.status(201).json({
                success: true,
                message: '初回出勤日を選択しました',
                data: result,
            });
        } catch (error: any) {
            console.error('Select date error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || '出勤日の選択に失敗しました',
            });
        }
    };
}

