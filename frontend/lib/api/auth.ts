import { apiClient } from './client';
import { APIResponse, User } from '../types';

interface RegisterInput {
    email: string;
    password: string;
    userType: 'pharmacy' | 'pharmacist';
    companyName?: string;
    representativeLastName?: string;
    representativeFirstName?: string;
    lastName?: string;
    firstName?: string;
}

interface LoginInput {
    email: string;
    password: string;
}

interface AuthResponse {
    user: User & { relatedId?: number };
    accessToken: string;
    refreshToken: string;
}

export const authAPI = {
    // ユーザー登録
    register: async (input: RegisterInput) => {
        return apiClient.post<APIResponse<AuthResponse>>('/auth/register', input);
    },

    // ログイン
    login: async (input: LoginInput) => {
        return apiClient.post<APIResponse<AuthResponse>>('/auth/login', input);
    },

    // ログアウト
    logout: async () => {
        return apiClient.post<APIResponse>('/auth/logout');
    },

    // 現在のユーザー情報取得
    getCurrentUser: async () => {
        return apiClient.get<APIResponse<User>>('/auth/me');
    },

    // メールアドレス認証（トークン検証 → 自動ログイン用JWT取得）
    verifyEmail: async (token: string) => {
        return apiClient.post<APIResponse<AuthResponse>>('/auth/verify-email', { token });
    },

    // 認証メール再送
    resendVerification: async (email: string) => {
        return apiClient.post<APIResponse>('/auth/resend-verification', { email });
    },

    // パスワードリセットメール送信（未ログイン）
    forgotPassword: async (email: string) => {
        return apiClient.post<APIResponse>('/auth/forgot-password', { email });
    },

    // パスワードリセット実行（トークン + 新パスワード）
    resetPassword: async (token: string, newPassword: string) => {
        return apiClient.post<APIResponse>('/auth/reset-password', { token, newPassword });
    },

    // パスワード変更（ログイン済み）
    changePassword: async (currentPassword: string, newPassword: string) => {
        return apiClient.post<APIResponse>('/auth/change-password', { currentPassword, newPassword });
    },
};

