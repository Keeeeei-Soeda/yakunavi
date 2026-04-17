import crypto from 'crypto';
import { Resend } from 'resend';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { UserType } from '../types';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yaku-navi.com';
const FROM_NAME = process.env.FROM_NAME || '薬ナビ';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://yaku-navi.com';

const RESET_TOKEN_EXPIRES_HOURS = 1;   // パスワードリセットトークン有効期限（1時間）
const VERIFY_TOKEN_EXPIRES_HOURS = 24; // メール認証トークン有効期限（24時間）

interface RegisterInput {
    email: string;
    password: string;
    userType: UserType;
    // 薬局情報（法人名・代表者名で登録、薬局名はプロフィールで登録）
    companyName?: string;
    representativeLastName?: string;
    representativeFirstName?: string;
    // 薬剤師情報
    lastName?: string;
    firstName?: string;
}

interface LoginInput {
    email: string;
    password: string;
}

export class AuthService {
    /**
     * ユーザー登録
     */
    async register(input: RegisterInput) {
        const { email, password, userType } = input;

        // メールアドレスの重複チェック
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('このメールアドレスは既に登録されています');
        }

        // パスワードをハッシュ化
        const hashedPassword = await hashPassword(password);

        // ユーザーを作成
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                userType,
                emailVerified: false, // 本番ではメール認証が必要
            },
        });

        // ユーザータイプに応じて追加情報を作成
        let relatedId = null;
        if (userType === 'pharmacy') {
            const pharmacy = await prisma.pharmacy.create({
                data: {
                    userId: user.id,
                    companyName: input.companyName || '未設定',
                    representativeLastName: input.representativeLastName || '未設定',
                    representativeFirstName: input.representativeFirstName || '未設定',
                    pharmacyName: null, // プロフィールで登録
                },
            });
            relatedId = Number(pharmacy.id);
        } else if (userType === 'pharmacist') {
            const pharmacist = await prisma.pharmacist.create({
                data: {
                    userId: user.id,
                    lastName: input.lastName || '未設定',
                    firstName: input.firstName || '未設定',
                },
            });
            relatedId = Number(pharmacist.id);
        }

        // メール認証トークンを生成して保存
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiresAt = new Date(
            Date.now() + VERIFY_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000,
        );
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken, verificationTokenExpiresAt },
        });

        // 認証メールを送信
        await this.sendVerificationEmail(user.email, verificationToken);

        // 登録完了（JWT は発行しない。メール認証後に自動ログイン）
        return {
            email: user.email,
            userType: user.userType,
            relatedId,
        };
    }

    /**
     * 認証メールを送信（内部共通ヘルパー）
     */
    private async sendVerificationEmail(email: string, token: string) {
        const verifyUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;

        if (!resend) {
            console.warn('[Auth] RESEND_API_KEY 未設定。認証メール送信をスキップします。');
            console.log(`[Auth] 認証URL（開発用）: ${verifyUrl}`);
            return;
        }

        await resend.emails.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: email,
            subject: '【薬ナビ】メールアドレスの認証をお願いします',
            html: `
<div style="font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans',Meiryo,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
  <h2 style="color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:8px;">メールアドレスの認証</h2>
  <p>薬ナビへのご登録ありがとうございます。</p>
  <p>以下のボタンをクリックしてメールアドレスを認証してください。<br>認証が完了するとそのままログインできます。</p>
  <div style="text-align:center;margin:32px 0;">
    <a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">メールアドレスを認証する</a>
  </div>
  <p style="font-size:13px;color:#666;">このリンクの有効期限は <strong>${VERIFY_TOKEN_EXPIRES_HOURS}時間</strong> です。</p>
  <p style="font-size:13px;color:#666;">このメールに心当たりがない場合は、そのまま無視してください。</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
  <p style="font-size:12px;color:#999;">薬ナビ運営事務局<br>${FRONTEND_URL}</p>
</div>`,
        });
    }

    /**
     * ログイン
     */
    async login(input: LoginInput) {
        const { email, password } = input;

        // ユーザーを検索
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                pharmacy: true,
                pharmacist: true,
            },
        });

        if (!user) {
            throw new Error('メールアドレスまたはパスワードが正しくありません');
        }

        // アカウントが有効かチェック
        if (!user.isActive) {
            throw new Error('アカウントが無効化されています');
        }

        // メール認証チェック（管理者はスキップ）
        if (user.userType !== 'admin' && !user.emailVerified) {
            const err = new Error('メール認証が完了していません。登録時に送信したメールをご確認ください。');
            (err as any).code = 'EMAIL_NOT_VERIFIED';
            throw err;
        }

        // パスワードを検証
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new Error('メールアドレスまたはパスワードが正しくありません');
        }

        // 最終ログイン時刻を更新
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // JWTトークンを生成
        const accessToken = generateAccessToken({
            id: Number(user.id),
            email: user.email,
            userType: user.userType as UserType,
        });

        const refreshToken = generateRefreshToken({
            id: Number(user.id),
            email: user.email,
            userType: user.userType as UserType,
        });

        // 関連情報のIDを取得
        let relatedId = null;
        if (user.pharmacy) {
            relatedId = Number(user.pharmacy.id);
        } else if (user.pharmacist) {
            relatedId = Number(user.pharmacist.id);
        }

        console.log(`[Auth] Login successful for user ${user.email} (${user.userType}), relatedId: ${relatedId}`);

        return {
            user: {
                id: Number(user.id),
                email: user.email,
                userType: user.userType,
                isActive: user.isActive,
                relatedId, // 薬局IDまたは薬剤師ID
            },
            accessToken,
            refreshToken,
        };
    }

    /**
     * メールアドレスを認証し、JWT を返して自動ログイン
     */
    async verifyEmail(token: string) {
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpiresAt: { gt: new Date() },
            },
            include: { pharmacy: true, pharmacist: true },
        });

        if (!user) {
            throw new Error('認証リンクが無効または期限切れです。認証メールを再送してください。');
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                verificationTokenExpiresAt: null,
            },
        });

        // 認証完了後そのまま自動ログイン用の JWT を返す
        const accessToken = generateAccessToken({
            id: Number(user.id),
            email: user.email,
            userType: user.userType as UserType,
        });
        const refreshToken = generateRefreshToken({
            id: Number(user.id),
            email: user.email,
            userType: user.userType as UserType,
        });

        let relatedId = null;
        if (user.pharmacy) relatedId = Number(user.pharmacy.id);
        else if (user.pharmacist) relatedId = Number(user.pharmacist.id);

        return {
            user: {
                id: Number(user.id),
                email: user.email,
                userType: user.userType,
                isActive: user.isActive,
                relatedId,
            },
            accessToken,
            refreshToken,
        };
    }

    /**
     * 認証メールを再送
     */
    async resendVerification(email: string) {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return; // セキュリティ上、ユーザー存否を返さない

        if (user.emailVerified) {
            throw new Error('このメールアドレスは既に認証済みです');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + VERIFY_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken: token, verificationTokenExpiresAt: expiresAt },
        });

        await this.sendVerificationEmail(email, token);
    }

    /**
     * パスワードリセットメールを送信
     */
    async forgotPassword(email: string) {
        const user = await prisma.user.findUnique({ where: { email } });

        // セキュリティ上、ユーザーが存在しない場合も同じレスポンスを返す
        if (!user) return;

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordTokenExpiresAt: expiresAt,
            },
        });

        const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${token}`;

        if (!resend) {
            console.warn('[Auth] RESEND_API_KEY 未設定。メール送信をスキップします。');
            console.log(`[Auth] リセットURL（開発用）: ${resetUrl}`);
            return;
        }

        await resend.emails.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: email,
            subject: '【薬ナビ】パスワード再設定のご案内',
            html: `
<div style="font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans',Meiryo,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
  <h2 style="color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:8px;">パスワード再設定のご案内</h2>
  <p>薬ナビをご利用いただきありがとうございます。</p>
  <p>パスワード再設定のリクエストを受け付けました。<br>以下のボタンから新しいパスワードを設定してください。</p>
  <div style="text-align:center;margin:32px 0;">
    <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;">パスワードを再設定する</a>
  </div>
  <p style="font-size:13px;color:#666;">このリンクの有効期限は <strong>${RESET_TOKEN_EXPIRES_HOURS}時間</strong> です。</p>
  <p style="font-size:13px;color:#666;">このメールに心当たりがない場合は、そのまま無視してください。パスワードは変更されません。</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
  <p style="font-size:12px;color:#999;">薬ナビ運営事務局<br>${FRONTEND_URL}</p>
</div>`,
        });
    }

    /**
     * パスワードをリセット（トークン検証後、新パスワードを設定）
     */
    async resetPassword(token: string, newPassword: string) {
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordTokenExpiresAt: { gt: new Date() },
            },
        });

        if (!user) {
            throw new Error('リセットリンクが無効または期限切れです。もう一度お試しください。');
        }

        if (newPassword.length < 8) {
            throw new Error('パスワードは8文字以上で設定してください');
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordTokenExpiresAt: null,
            },
        });
    }

    /**
     * パスワード変更（ログイン済みユーザーが自分で変更）
     */
    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } });

        if (!user) {
            throw new Error('ユーザーが見つかりません');
        }

        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new Error('現在のパスワードが正しくありません');
        }

        if (newPassword.length < 8) {
            throw new Error('新しいパスワードは8文字以上で設定してください');
        }

        if (currentPassword === newPassword) {
            throw new Error('新しいパスワードは現在のパスワードと異なるものを設定してください');
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: BigInt(userId) },
            data: { password: hashedPassword },
        });
    }

    /**
     * 現在のユーザー情報を取得
     */
    async getCurrentUser(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: BigInt(userId) },
            include: {
                pharmacy: true,
                pharmacist: true,
            },
        });

        if (!user) {
            throw new Error('ユーザーが見つかりません');
        }

        let relatedId = null;
        if (user.pharmacy) {
            relatedId = Number(user.pharmacy.id);
        } else if (user.pharmacist) {
            relatedId = Number(user.pharmacist.id);
        }

        return {
            id: Number(user.id),
            email: user.email,
            userType: user.userType,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            relatedId,
        };
    }
}

