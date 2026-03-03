import { Resend } from 'resend';
import prisma from '../utils/prisma';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yaku-navi.com';
const FROM_NAME = process.env.FROM_NAME || '薬ナビ';

export class NotificationService {
    /**
     * DB通知を作成する共通メソッド
     */
    private async createNotification(params: {
        userId: bigint;
        notificationType: string;
        title: string;
        message: string;
        linkUrl?: string;
    }) {
        try {
            await prisma.notification.create({
                data: {
                    userId: params.userId,
                    notificationType: params.notificationType,
                    title: params.title,
                    message: params.message,
                    linkUrl: params.linkUrl,
                    isRead: false,
                },
            });
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    }

    /**
     * メール送信の共通メソッド
     */
    private async sendEmail(params: {
        to: string;
        subject: string;
        html: string;
    }) {
        if (!resend) {
            console.warn('RESEND_API_KEY is not set. Email sending is skipped.');
            return;
        }
        try {
            await resend.emails.send({
                from: `${FROM_NAME} <${FROM_EMAIL}>`,
                to: params.to,
                subject: params.subject,
                html: params.html,
            });
        } catch (error) {
            console.error('Failed to send email:', error);
        }
    }

    /**
     * 正式オファー到着通知
     * 薬局がオファーを作成した後に呼び出す（approveContract内ではなくcreateContract内）
     */
    async notifyOffer(params: {
        pharmacistUserId: bigint;
        pharmacistEmail: string;
        pharmacistName: string;
        pharmacyName: string;
        applicationId: number;
    }) {
        const { pharmacistUserId, pharmacistEmail, pharmacistName, pharmacyName, applicationId } = params;
        const linkUrl = `/pharmacist/messages?applicationId=${applicationId}`;

        // DB通知
        await this.createNotification({
            userId: pharmacistUserId,
            notificationType: 'offer_received',
            title: '正式オファーが届きました',
            message: `${pharmacyName}から正式オファーが届きました。内容を確認してください。`,
            linkUrl,
        });

        // メール通知
        const html = this.buildEmailHtml({
            title: '📄 正式オファーが届きました',
            recipientName: pharmacistName,
            bodyHtml: `
                <p><strong>${pharmacyName}</strong>から正式オファーが届きました。</p>
                <p>内容をご確認の上、承認または辞退をお選びください。</p>
            `,
            buttonUrl: `https://yaku-navi.com${linkUrl}`,
            buttonText: 'オファーを確認する',
            color: '#f97316',
        });

        await this.sendEmail({
            to: pharmacistEmail,
            subject: `【薬ナビ】${pharmacyName}から正式オファーが届きました`,
            html,
        });
    }

    /**
     * 契約完了（手数料支払い確認後）通知
     * payment.service.ts の confirmPayment 内で呼び出す
     */
    async notifyContractActivated(params: {
        pharmacistUserId: bigint;
        pharmacistEmail: string;
        pharmacistName: string;
        pharmacyName: string;
        contractId: number;
    }) {
        const { pharmacistUserId, pharmacistEmail, pharmacistName, pharmacyName, contractId } = params;
        const linkUrl = `/pharmacist/contracts/${contractId}`;

        // DB通知
        await this.createNotification({
            userId: pharmacistUserId,
            notificationType: 'contract_activated',
            title: '契約が成立しました',
            message: `${pharmacyName}との契約が成立しました。薬局の連絡先が開示されました。`,
            linkUrl,
        });

        // メール通知
        const html = this.buildEmailHtml({
            title: '✅ 契約が成立しました',
            recipientName: pharmacistName,
            bodyHtml: `
                <p><strong>${pharmacyName}</strong>との契約が成立しました。</p>
                <p>薬局の連絡先が開示されました。直接ご連絡の上、勤務スケジュールを調整してください。</p>
            `,
            buttonUrl: `https://yaku-navi.com${linkUrl}`,
            buttonText: '契約詳細を確認する',
            color: '#16a34a',
        });

        await this.sendEmail({
            to: pharmacistEmail,
            subject: `【薬ナビ】${pharmacyName}との契約が成立しました`,
            html,
        });
    }

    /**
     * 初回出勤日候補提案通知
     * message.service.ts の proposeDates 内で呼び出す
     */
    async notifyDateProposal(params: {
        pharmacistUserId: bigint;
        pharmacistEmail: string;
        pharmacistName: string;
        pharmacyName: string;
        applicationId: number;
    }) {
        const { pharmacistUserId, pharmacistEmail, pharmacistName, pharmacyName, applicationId } = params;
        const linkUrl = `/pharmacist/messages?applicationId=${applicationId}`;

        // DB通知
        await this.createNotification({
            userId: pharmacistUserId,
            notificationType: 'date_proposal',
            title: '初回出勤日の候補が届きました',
            message: `${pharmacyName}から初回出勤日の候補が届きました。日程を選択してください。`,
            linkUrl,
        });

        // メール通知
        const html = this.buildEmailHtml({
            title: '📅 初回出勤日の候補が届きました',
            recipientName: pharmacistName,
            bodyHtml: `
                <p><strong>${pharmacyName}</strong>から初回出勤日の候補が届きました。</p>
                <p>メッセージ画面を開いて、希望の日程を選択してください。</p>
            `,
            buttonUrl: `https://yaku-navi.com${linkUrl}`,
            buttonText: '日程を選択する',
            color: '#2563eb',
        });

        await this.sendEmail({
            to: pharmacistEmail,
            subject: `【薬ナビ】${pharmacyName}から初回出勤日の候補が届きました`,
            html,
        });
    }

    /**
     * 共通メールHTMLテンプレート
     */
    private buildEmailHtml(params: {
        title: string;
        recipientName: string;
        bodyHtml: string;
        buttonUrl: string;
        buttonText: string;
        color: string;
    }) {
        const { title, recipientName, bodyHtml, buttonUrl, buttonText, color } = params;
        return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
    <h1 style="color: ${color}; font-size: 22px; margin-bottom: 20px;">${title}</h1>
    <p>${recipientName} 様</p>
    ${bodyHtml}
    <div style="margin: 28px 0; text-align: center;">
      <a href="${buttonUrl}"
         style="display: inline-block; background-color: ${color}; color: #ffffff; text-decoration: none;
                padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px;">
        ${buttonText}
      </a>
    </div>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
      <p>薬ナビ</p>
      <p><a href="https://yaku-navi.com" style="color: #6b7280;">https://yaku-navi.com</a></p>
      <p style="margin-top: 8px;">このメールは自動送信されています。返信はできませんのでご了承ください。</p>
    </div>
  </div>
</body>
</html>`;
    }
}
