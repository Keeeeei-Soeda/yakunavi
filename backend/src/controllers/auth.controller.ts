import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    /**
     * ユーザー登録
     */
    register = async (req: Request, res: Response) => {
        try {
            const { email, password, userType, ...additionalData } = req.body;

            // バリデーション
            if (!email || !password || !userType) {
                return res.status(400).json({
                    success: false,
                    error: 'メールアドレス、パスワード、ユーザータイプは必須です',
                });
            }

            if (!['pharmacy', 'pharmacist'].includes(userType)) {
                return res.status(400).json({
                    success: false,
                    error: 'ユーザータイプが不正です',
                });
            }

            if (userType === 'pharmacy') {
                if (!additionalData.companyName || !additionalData.representativeLastName || !additionalData.representativeFirstName) {
                    return res.status(400).json({
                        success: false,
                        error: '法人名、代表者姓、代表者名は必須です',
                    });
                }
            }

            if (userType === 'pharmacist') {
                if (!additionalData.lastName || !additionalData.firstName) {
                    return res.status(400).json({
                        success: false,
                        error: '姓、名は必須です',
                    });
                }
            }

            const result = await this.authService.register({
                email,
                password,
                userType,
                ...additionalData,
            });

            return res.status(201).json({
                success: true,
                message: 'ユーザー登録が完了しました',
                data: result,
            });
        } catch (error: any) {
            console.error('Registration error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'ユーザー登録に失敗しました',
            });
        }
    };

    /**
     * ログイン
     */
    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            // バリデーション
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'メールアドレスとパスワードは必須です',
                });
            }

            const result = await this.authService.login({ email, password });

            return res.status(200).json({
                success: true,
                message: 'ログインに成功しました',
                data: result,
            });
        } catch (error: any) {
            console.error('Login error:', error);
            return res.status(401).json({
                success: false,
                error: error.message || 'ログインに失敗しました',
            });
        }
    };

    /**
     * パスワードリセットメール送信
     */
    forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ success: false, error: 'メールアドレスは必須です' });
            }
            await this.authService.forgotPassword(email);
            // ユーザーの存否に関わらず同じメッセージを返す（セキュリティ）
            return res.status(200).json({
                success: true,
                message: '入力されたメールアドレスにパスワード再設定のご案内を送信しました（登録済みの場合）',
            });
        } catch (error: any) {
            console.error('Forgot password error:', error);
            return res.status(500).json({ success: false, error: '送信に失敗しました。しばらくしてお試しください。' });
        }
    };

    /**
     * パスワードリセット（トークン検証 + 新パスワード設定）
     */
    resetPassword = async (req: Request, res: Response) => {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res.status(400).json({ success: false, error: 'トークンと新しいパスワードは必須です' });
            }
            await this.authService.resetPassword(token, newPassword);
            return res.status(200).json({ success: true, message: 'パスワードを再設定しました' });
        } catch (error: any) {
            console.error('Reset password error:', error);
            return res.status(400).json({ success: false, error: error.message || 'パスワードの再設定に失敗しました' });
        }
    };

    /**
     * パスワード変更（ログイン済みユーザーが自分で変更）
     */
    changePassword = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: '認証が必要です' });
            }
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, error: '現在のパスワードと新しいパスワードは必須です' });
            }
            await this.authService.changePassword(req.user.id, currentPassword, newPassword);
            return res.status(200).json({ success: true, message: 'パスワードを変更しました' });
        } catch (error: any) {
            console.error('Change password error:', error);
            return res.status(400).json({ success: false, error: error.message || 'パスワードの変更に失敗しました' });
        }
    };

    /**
     * ログアウト（クライアント側でトークンを削除）
     */
    logout = async (_req: Request, res: Response) => {
        return res.status(200).json({
            success: true,
            message: 'ログアウトしました',
        });
    };

    /**
     * 現在のユーザー情報を取得
     */
    getCurrentUser = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: '認証が必要です',
                });
            }

            const user = await this.authService.getCurrentUser(req.user.id);

            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error: any) {
            console.error('Get current user error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'ユーザー情報の取得に失敗しました',
            });
        }
    };
}

