import { apiClient } from './client';
import { APIResponse, User } from '../types';

interface RegisterInput {
    email: string;
    password: string;
    userType: 'pharmacy' | 'pharmacist';
    pharmacyName?: string;
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
};

