'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const login = useAuthStore((state) => state.login);

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [userType, setUserType] = useState<string>('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('認証リンクが無効です。');
            return;
        }

        const verify = async () => {
            try {
                const response = await authAPI.verifyEmail(token);
                if (response.success && response.data) {
                    const { user, accessToken } = response.data;
                    login(user, accessToken);
                    setUserType(user.userType);
                    setStatus('success');

                    // ユーザータイプに応じてダッシュボードへ自動遷移（2秒後）
                    setTimeout(() => {
                        if (user.userType === 'pharmacy') {
                            router.push('/pharmacy/dashboard');
                        } else if (user.userType === 'pharmacist') {
                            router.push('/pharmacist/dashboard');
                        } else {
                            router.push('/');
                        }
                    }, 2000);
                }
            } catch (err: any) {
                setStatus('error');
                setErrorMessage(
                    err.response?.data?.error || '認証リンクが無効または期限切れです。'
                );
            }
        };

        verify();
    }, [token, login, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">

                {status === 'loading' && (
                    <>
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <LoadingSpinner size="lg" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">認証中...</h1>
                        <p className="text-gray-500 text-sm">メールアドレスを確認しています。しばらくお待ちください。</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">認証完了！</h1>
                        <p className="text-gray-600 mb-2">メールアドレスの認証が完了しました。</p>
                        <p className="text-gray-500 text-sm">ダッシュボードへ移動します...</p>
                        <div className="mt-4">
                            <LoadingSpinner size="sm" className="mx-auto" />
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">認証できませんでした</h1>
                        <p className="text-red-600 text-sm mb-6">{errorMessage}</p>
                        <div className="space-y-3">
                            <Link
                                href="/auth/forgot-password"
                                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center text-sm"
                            >
                                認証メールを再送する
                            </Link>
                            <Link
                                href="/auth/login"
                                className="block text-gray-500 hover:text-gray-700 text-sm"
                            >
                                ← ログイン画面に戻る
                            </Link>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
