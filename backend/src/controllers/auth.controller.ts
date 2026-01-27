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

