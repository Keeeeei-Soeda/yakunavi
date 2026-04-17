'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api/auth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

function EmailSentContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') ?? '';

    const [isResending, setIsResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [error, setError] = useState('');

    const handleResend = async () => {
        if (!email) return;
        setError('');
        setIsResending(true);
        try {
            await authAPI.resendVerification(email);
            setResent(true);
        } catch (err: any) {
            setError(err.response?.data?.error || '再送に失敗しました。しばらくしてからお試しください。');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">メールをご確認ください</h1>

                <p className="text-gray-600 mb-2">
                    以下のアドレスに認証メールをお送りしました。
                </p>
                {email && (
                    <p className="text-blue-700 font-medium mb-6 bg-blue-50 rounded-lg px-4 py-2 inline-block">
                        {email}
                    </p>
                )}

                <div className="bg-gray-50 rounded-lg p-4 text-left mb-6 space-y-2">
                    <p className="text-sm text-gray-700 font-medium">次のステップ：</p>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                        <li>受信したメールを開く</li>
                        <li>「メールアドレスを認証する」ボタンをクリック</li>
                        <li>認証完了後、自動的にログインされます</li>
                    </ol>
                </div>

                <p className="text-xs text-gray-500 mb-6">
                    リンクの有効期限は24時間です。<br />
                    迷惑メールフォルダもご確認ください。
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {resent ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
                        認証メールを再送しました。メールをご確認ください。
                    </div>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={isResending || !email}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400 flex items-center justify-center gap-1 mx-auto"
                    >
                        {isResending ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-1" />
                                送信中...
                            </>
                        ) : (
                            'メールが届かない場合は再送する'
                        )}
                    </button>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <Link href="/auth/login" className="text-gray-500 hover:text-gray-700 text-sm">
                        ← ログイン画面に戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function EmailSentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><LoadingSpinner /></div>}>
            <EmailSentContent />
        </Suspense>
    );
}
