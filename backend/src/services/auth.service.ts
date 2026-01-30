import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { UserType } from '../types';

interface RegisterInput {
    email: string;
    password: string;
    userType: UserType;
    // 薬局情報
    pharmacyName?: string;
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
                    pharmacyName: input.pharmacyName || '未設定',
                    representativeLastName: input.representativeLastName || '未設定',
                    representativeFirstName: input.representativeFirstName || '未設定',
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

        return {
            user: {
                id: Number(user.id),
                email: user.email,
                userType: user.userType,
                isActive: user.isActive,
                relatedId, // 薬局IDまたは薬剤師IDを追加
            },
            accessToken,
            refreshToken,
        };
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

