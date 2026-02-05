import { Resend } from 'resend';

// APIキーがある場合のみResendを初期化（ない場合はnull）
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yaku-navi.com';
const FROM_NAME = process.env.FROM_NAME || '薬ナビ';
// 管理者メールアドレス（カンマ区切りで複数指定可能）
const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim())
  : ['pharnewton@gmail.com', 'info@yaku-navi.com'];

interface ContactFormData {
  name: string;
  age: string;
  occupation: string;
  content: string;
  email: string;
  phone: string;
}

export class ContactService {
  /**
   * テストメールを送信（管理者のみ）
   */
  async sendTestEmail() {
    // Resend APIキーが設定されていない場合はスキップ
    if (!resend) {
      console.warn('RESEND_API_KEY is not set. Email sending is skipped.');
      return { success: false, message: 'メール送信機能は現在利用できません（RESEND_API_KEYが設定されていません）' };
    }

    const testData: ContactFormData = {
      name: 'テスト 太郎',
      age: '30',
      occupation: 'pharmacist',
      content: 'これはテストメールです。お問い合わせフォームの動作確認のために送信されました。',
      email: 'test@example.com',
      phone: '090-1234-5678',
    };

    try {
      // 管理者への通知メールのみ送信（自動返信は送信しない）
      await this.sendNotificationToAdmin(testData);
      return { success: true, message: 'テストメールを送信しました' };
    } catch (error) {
      console.error('Test email error:', error);
      throw new Error('テストメールの送信に失敗しました');
    }
  }

  /**
   * 問い合わせフォームからメールを送信
   */
  async sendContactEmail(data: ContactFormData) {
    // Resend APIキーが設定されていない場合はスキップ
    if (!resend) {
      console.warn('RESEND_API_KEY is not set. Email sending is skipped.');
      return { success: true, message: 'メール送信機能は現在利用できません' };
    }

    try {
      // 1. 問い合わせ者への自動返信メール
      await this.sendAutoReplyToUser(data);

      // 2. 管理者への通知メール
      await this.sendNotificationToAdmin(data);

      return { success: true };
    } catch (error) {
      console.error('Contact email error:', error);
      throw new Error('メールの送信に失敗しました');
    }
  }

  /**
   * 問い合わせ者への自動返信メール
   */
  private async sendAutoReplyToUser(data: ContactFormData) {
    const occupationMap: { [key: string]: string } = {
      pharmacist: '薬剤師',
      pharmacy: '薬局',
      other: 'その他医療従事者',
    };

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>お問い合わせありがとうございます</title>
</head>
<body style="font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
    <h1 style="color: #14b8a6; font-size: 24px; margin-bottom: 20px;">お問い合わせありがとうございます</h1>
    
    <p>${data.name} 様</p>
    
    <p>この度は、薬ナビにお問い合わせいただき、誠にありがとうございます。</p>
    
    <p>以下の内容でお問い合わせを承りました。担当者より2営業日以内にご連絡させていただきます。</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="font-size: 18px; color: #14b8a6; margin-bottom: 15px;">お問い合わせ内容</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 120px;">氏名</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">年齢</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.age}歳</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">職種</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${occupationMap[data.occupation] || data.occupation}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">メールアドレス</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">電話番号</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.phone}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; vertical-align: top;">問い合わせ内容</td>
          <td style="padding: 8px; white-space: pre-wrap;">${data.content}</td>
        </tr>
      </table>
    </div>
    
    <p style="margin-top: 20px;">ご不明な点がございましたら、お気軽にお問い合わせください。</p>
    
    <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
      このメールは自動送信されています。返信はできませんのでご了承ください。<br>
      お問い合わせへのご返答は、別途担当者よりご連絡いたします。
    </p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
      <p>薬ナビ</p>
      <p>https://yaku-navi.com</p>
    </div>
  </div>
</body>
</html>
    `;

    if (!resend) {
      throw new Error('Resend is not initialized');
    }

    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: data.email,
      subject: '【薬ナビ】お問い合わせありがとうございます',
      html,
    });
  }

  /**
   * 管理者への通知メール
   */
  private async sendNotificationToAdmin(data: ContactFormData) {
    const occupationMap: { [key: string]: string } = {
      pharmacist: '薬剤師',
      pharmacy: '薬局',
      other: 'その他医療従事者',
    };

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>新しいお問い合わせが届きました</title>
</head>
<body style="font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
    <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 20px;">🔔 新しいお問い合わせが届きました</h1>
    
    <p>薬ナビにお問い合わせが届きました。以下の内容をご確認ください。</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
      <h2 style="font-size: 18px; color: #dc2626; margin-bottom: 15px;">お問い合わせ内容</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 120px; background-color: #f9fafb;">氏名</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">年齢</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${data.age}歳</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">職種</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${occupationMap[data.occupation] || data.occupation}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">メールアドレス</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; background-color: #f9fafb;">電話番号</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><a href="tel:${data.phone}">${data.phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; vertical-align: top; background-color: #f9fafb;">問い合わせ内容</td>
          <td style="padding: 8px; white-space: pre-wrap;">${data.content}</td>
        </tr>
      </table>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-weight: bold; color: #92400e;">⚠️ 対応が必要です</p>
      <p style="margin: 5px 0 0 0; color: #78350f; font-size: 14px;">2営業日以内にご返信をお願いします。</p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
      <p>薬ナビ 管理システム</p>
      <p>受信日時: ${new Date().toLocaleString('ja-JP')}</p>
    </div>
  </div>
</body>
</html>
    `;

    if (!resend) {
      throw new Error('Resend is not initialized');
    }

    // 複数の管理者メールアドレスに送信
    const sendPromises = ADMIN_EMAILS.map(email =>
      resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: email,
        subject: `【薬ナビ】新しいお問い合わせ: ${data.name}様（${occupationMap[data.occupation] || data.occupation}）`,
        html,
      })
    );

    await Promise.all(sendPromises);
  }
}

