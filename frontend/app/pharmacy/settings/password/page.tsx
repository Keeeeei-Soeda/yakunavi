'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { authAPI } from '@/lib/api/auth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function PharmacyChangePasswordPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword.length < 8) {
            setError('新しいパスワードは8文字以上で設定してください');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('新しいパスワードが一致しません');
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.changePassword(formData.currentPassword, formData.newPassword);
            setDone(true);
            setTimeout(() => router.push('/pharmacy/settings'), 2500);
        } catch (err: any) {
            setError(err.response?.data?.error || 'パスワードの変更に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredUserType="pharmacy">
            <PharmacyLayout title="パスワード変更">
                <div className="max-w-lg">
                    <div className="mb-6">
                        <Link
                            href="/pharmacy/settings"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            設定に戻る
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow p-8">
                        <h3 className="text-lg font-semibold mb-6">パスワードの変更</h3>

                        {done ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-gray-900 font-medium">パスワードを変更しました</p>
                                <p className="text-gray-500 text-sm mt-1">設定画面に戻ります...</p>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            現在のパスワード
                                        </label>
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            required
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="現在のパスワード"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            新しいパスワード <span className="text-gray-400 font-normal">（8文字以上）</span>
                                        </label>
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            required
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="新しいパスワード"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            新しいパスワード（確認）
                                        </label>
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="もう一度入力"
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={showPasswords}
                                            onChange={(e) => setShowPasswords(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        パスワードを表示する
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {isLoading ? (
                                            <>
                                                <LoadingSpinner size="sm" className="mr-2" />
                                                変更中...
                                            </>
                                        ) : (
                                            'パスワードを変更する'
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </PharmacyLayout>
        </ProtectedRoute>
    );
}
