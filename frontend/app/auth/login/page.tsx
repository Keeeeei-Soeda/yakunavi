'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { authAPI } from '@/lib/api/auth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailNotVerified, setEmailNotVerified] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authAPI.login(formData);

            if (response.success && response.data) {
                const { user, accessToken } = response.data;
                login(user, accessToken);

                // ユーザータイプに応じてリダイレクト
                if (user.userType === 'pharmacy') {
                    router.push('/pharmacy/dashboard');
                } else if (user.userType === 'pharmacist') {
                    router.push('/pharmacist/dashboard');
                } else if (user.userType === 'admin') {
                    router.push('/admin/dashboard');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            const apiError = err.response?.data?.error || '';
            if (apiError.includes('メール認証')) {
                setEmailNotVerified(true);
                setError(apiError);
            } else {
                setEmailNotVerified(false);
                setError(apiError || 'ログインに失敗しました。もう一度お試しください。');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
                {/* ヘッダー */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        薬局管理システム
                    </h1>
                    <p className="text-gray-600">ログイン</p>
                </div>

                {/* エラーメッセージ */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                        {emailNotVerified && (
                            <div className="mt-3">
                                <Link
                                    href={`/auth/email-sent?email=${encodeURIComponent(formData.email)}`}
                                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    認証メールを再送する →
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* ログインフォーム */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            メールアドレス
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="example@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            パスワード
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                ログイン中...
                            </>
                        ) : (
                            'ログイン'
                        )}
                    </button>
                    <div className="text-center">
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            パスワードをお忘れの方はこちら
                        </Link>
                    </div>
                </form>

                {/* 登録リンク */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        アカウントをお持ちでない方は
                    </p>
                    <div className="mt-2 space-y-2">
                        <Link
                            href="/auth/register/pharmacy"
                            className="block text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                            薬局として登録
                        </Link>
                        <Link
                            href="/auth/register/pharmacist"
                            className="block text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                            薬剤師として登録
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

