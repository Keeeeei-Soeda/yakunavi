'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { authAPI } from '@/lib/api/auth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function AdminLoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('ログイン試行:', formData.email);
            const response = await authAPI.login(formData);
            console.log('ログインレスポンス:', response);

            if (response && response.success && response.data) {
                const { user, accessToken } = response.data;

                if (!user) {
                    setError('ユーザー情報の取得に失敗しました。');
                    setIsLoading(false);
                    return;
                }

                // 管理者権限をチェック
                if (user.userType !== 'admin') {
                    setError('管理者権限がありません。一般ユーザーの方は通常のログイン画面をご利用ください。');
                    setIsLoading(false);
                    return;
                }

                if (!accessToken) {
                    setError('トークンの取得に失敗しました。');
                    setIsLoading(false);
                    return;
                }

                console.log('ログイン成功、ダッシュボードへリダイレクト');
                login(user, accessToken);
                router.push('/admin/dashboard');
            } else {
                console.error('予期しないレスポンス形式:', response);
                setError('ログインに失敗しました。レスポンス形式が不正です。');
            }
        } catch (err: any) {
            console.error('Admin login error:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            
            // より詳細なエラーメッセージ
            let errorMessage = 'ログインに失敗しました。';
            
            if (err.response) {
                // サーバーからのエラーレスポンス
                errorMessage = err.response.data?.error || err.response.data?.message || errorMessage;
            } else if (err.request) {
                // リクエストは送信されたが、レスポンスが受信されなかった
                errorMessage = 'サーバーに接続できませんでした。バックエンドサーバーが起動しているか確認してください。';
            } else {
                // リクエストの設定中にエラーが発生
                errorMessage = err.message || errorMessage;
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
                {/* ヘッダー */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        管理者ログイン
                    </h1>
                    <p className="text-gray-600">薬ナビ管理システム</p>
                </div>

                {/* エラーメッセージ */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* ログインフォーム */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            管理者メールアドレス
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="admin@yakunavi.com"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                ログイン中...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                管理者としてログイン
                            </>
                        )}
                    </button>
                </form>

                {/* 注意事項 */}
                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">管理者専用ログイン画面</p>
                            <p>このページは管理者専用です。一般ユーザーの方は通常のログイン画面をご利用ください。</p>
                        </div>
                    </div>
                </div>

                {/* 一般ユーザーログインへのリンク */}
                <div className="mt-6 text-center">
                    <a
                        href="/auth/login"
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                        一般ユーザーとしてログイン
                    </a>
                </div>
            </div>
        </div>
    );
}

