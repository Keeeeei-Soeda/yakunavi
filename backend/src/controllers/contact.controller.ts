import { Request, Response } from 'express';
import { ContactService } from '../services/contact.service';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  /**
   * 問い合わせフォームの送信
   */
  submitContact = async (req: Request, res: Response) => {
    try {
      const { name, age, occupation, content, email, phone } = req.body;

      // バリデーション
      if (!name || !age || !occupation || !content || !email || !phone) {
        return res.status(400).json({
          success: false,
          error: 'すべての項目を入力してください',
        });
      }

      // メールアドレスの形式チェック
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: '有効なメールアドレスを入力してください',
        });
      }

      await this.contactService.sendContactEmail({
        name,
        age,
        occupation,
        content,
        email,
        phone,
      });

      return res.status(200).json({
        success: true,
        message: 'お問い合わせを受け付けました。確認メールを送信しました。',
      });
    } catch (error: any) {
      console.error('Contact submission error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'お問い合わせの送信に失敗しました',
      });
    }
  };
}

