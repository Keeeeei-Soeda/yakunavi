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
     * 資格証明書 承認通知
     * admin.service.ts の approveCertificate 内で呼び出す
     */
    async notifyCertificateApproved(params: {
        pharmacistUserId: bigint;
        pharmacistEmail: string;
        pharmacistName: string;
        certificateType: string; // 'license' | 'registration'
    }) {
        const { pharmacistUserId, pharmacistEmail, pharmacistName, certificateType } = params;
        const certLabel = certificateType === 'license' ? '薬剤師免許証' : '保険薬剤師登録票';
        const linkUrl = '/pharmacist/profile';

        await this.createNotification({
            userId: pharmacistUserId,
            notificationType: 'certificate_approved',
            title: `${certLabel}が承認されました`,
            message: `提出された${certLabel}が確認・承認されました。`,
            linkUrl,
        });

        const html = this.buildEmailHtml({
            title: `✅ ${certLabel}が承認されました`,
            recipientName: pharmacistName,
            bodyHtml: `
                <p>提出いただいた<strong>${certLabel}</strong>が確認・承認されました。</p>
                <p>これで求人への応募が可能になります。</p>
            `,
            buttonUrl: `https://yaku-navi.com${linkUrl}`,
            buttonText: 'プロフィールを確認する',
            color: '#16a34a',
        });

        await this.sendEmail({
            to: pharmacistEmail,
            subject: `【薬ナビ】${certLabel}が承認されました`,
            html,
        });
    }

    /**
     * 資格証明書 否認（差し戻し）通知
     * admin.service.ts の rejectCertificate 内で呼び出す
     */
    async notifyCertificateRejected(params: {
        pharmacistUserId: bigint;
        pharmacistEmail: string;
        pharmacistName: string;
        certificateType: string;
        reason?: string;
    }) {
        const { pharmacistUserId, pharmacistEmail, pharmacistName, certificateType, reason } = params;
        const certLabel = certificateType === 'license' ? '薬剤師免許証' : '保険薬剤師登録票';
        const linkUrl = '/pharmacist/profile';

        await this.createNotification({
            userId: pharmacistUserId,
            notificationType: 'certificate_rejected',
            title: `${certLabel}が差し戻されました`,
            message: `提出された${certLabel}が差し戻されました。再提出をお願いします。${reason ? `（理由: ${reason}）` : ''}`,
            linkUrl,
        });

        const html = this.buildEmailHtml({
            title: `⚠️ ${certLabel}が差し戻されました`,
            recipientName: pharmacistName,
            bodyHtml: `
                <p>提出いただいた<strong>${certLabel}</strong>が差し戻されました。</p>
                ${reason ? `<p>差し戻し理由: <strong>${reason}</strong></p>` : ''}
                <p>内容をご確認の上、再度アップロードをお願いいたします。</p>
            `,
            buttonUrl: `https://yaku-navi.com${linkUrl}`,
            buttonText: 'プロフィールから再提出する',
            color: '#dc2626',
        });

        await this.sendEmail({
            to: pharmacistEmail,
            subject: `【薬ナビ】${certLabel}が差し戻されました`,
            html,
        });
    }

    /**
     * 支払い報告時の運営通知（info@yaku-navi.com へ Resend で送信）
     */
    async notifyPaymentReportedToAdmin(params: {
        paymentId: number;
        contractId: number;
        pharmacyName: string;
        paymentDate: string;
        transferName: string;
        confirmationNote?: string;
    }) {
        const { paymentId, contractId, pharmacyName, paymentDate, transferName, confirmationNote } = params;
        const adminEmail = process.env.PAYMENT_REPORT_NOTIFY_EMAIL || 'info@yaku-navi.com';

        const bodyRows = [
            ['請求書ID', String(paymentId)],
            ['契約ID', String(contractId)],
            ['薬局名', pharmacyName],
            ['入金日（支払い日）', paymentDate],
            ['振込名義', transferName],
            ...(confirmationNote ? [['確認用メモ', confirmationNote]] : []),
        ];

        const tableRows = bodyRows
            .map(
                ([label, value]) =>
                    `<tr><td style="padding:8px 12px; border-bottom:1px solid #e5e7eb; font-weight:600; width:140px;">${label}</td><td style="padding:8px 12px; border-bottom:1px solid #e5e7eb;">${value}</td></tr>`
            )
            .join('');

        const adminPaymentsUrl = process.env.FRONTEND_URL || 'https://yaku-navi.com';
        const detailUrl = `${adminPaymentsUrl}/admin/payments/${paymentId}`;

        const html = `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 24px; border-radius: 8px;">
    <h1 style="color: #16a34a; font-size: 20px; margin-bottom: 16px;">【薬ナビ】支払い報告がありました</h1>
    <p style="margin-bottom: 16px;">薬局から手数料の支払い報告が送信されました。入金確認のうえ、管理画面で「支払いを確認」してください。</p>
    <table style="width:100%; border-collapse: collapse; background: #fff; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
      ${tableRows}
    </table>
    <p style="margin-top: 20px; text-align: center;">
      <a href="${detailUrl}" style="display: inline-block; background-color: #16a34a; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">管理画面で確認する</a>
    </p>
    <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">このメールは自動送信されています。</p>
  </div>
</body>
</html>`;

        await this.sendEmail({
            to: adminEmail,
            subject: `【薬ナビ】支払い報告がありました（${pharmacyName} / 請求書#${paymentId}）`,
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
