'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api/auth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authAPI.forgotPassword(email);
            setSent(true);
        } catch {
            setError('送信に失敗しました。しばらくしてからお試しください。');
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">パスワードをお忘れの方</h1>
                    <p className="text-gray-600 text-sm">
                        登録済みのメールアドレスを入力してください。<br />
                        パスワード再設定用のリンクをお送りします。
                    </p>
                </div>

                {sent ? (
                    <div className="text-center">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                            <p className="text-green-700 font-medium">送信しました</p>
                            <p className="text-green-600 text-sm mt-1">
                                ご登録のメールアドレスにパスワード再設定のご案内をお送りしました。<br />
                                メールをご確認ください（有効期限：1時間）。
                            </p>
                        </div>
                        <Link
                            href="/auth/login"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            ← ログイン画面に戻る
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    メールアドレス
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="example@email.com"
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
                                        送信中...
                                    </>
                                ) : (
                                    '再設定メールを送信'
                                )}
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <Link
                                href="/auth/login"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
