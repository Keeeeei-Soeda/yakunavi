'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api/auth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';

    const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token) setError('リセットリンクが無効です。もう一度お試しください。');
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword.length < 8) {
            setError('パスワードは8文字以上で設定してください');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('パスワードが一致しません');
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.resetPassword(token, formData.newPassword);
            setDone(true);
            setTimeout(() => router.push('/auth/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'パスワードの再設定に失敗しました。リンクの期限が切れている可能性があります。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">新しいパスワードを設定</h1>
                    <p className="text-gray-600 text-sm">覚えやすい新しいパスワードを設定してください</p>
                </div>

                {done ? (
                    <div className="text-center">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                            <p className="text-green-700 font-medium">パスワードを再設定しました</p>
                            <p className="text-green-600 text-sm mt-1">3秒後にログイン画面へ移動します...</p>
                        </div>
                        <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            今すぐログイン画面へ
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                                {error.includes('期限') && (
                                    <div className="mt-2">
                                        <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium">
                                            再度リセットメールを送信する →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    新しいパスワード <span className="text-gray-400 font-normal">（8文字以上）</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="新しいパスワード"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    新しいパスワード（確認）
                                </label>
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="もう一度入力"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !token}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        設定中...
                                    </>
                                ) : (
                                    'パスワードを設定する'
                                )}
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                ← ログイン画面に戻る
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><LoadingSpinner /></div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
