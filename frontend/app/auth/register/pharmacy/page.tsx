'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { authAPI } from '@/lib/api/auth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TermsModal } from '@/components/common/TermsModal';

export default function PharmacyRegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    pharmacyName: '',
    representativeLastName: '',
    representativeFirstName: '',
    termsAgreed: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // パスワード確認
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    // パスワードの長さチェック
    if (formData.password.length < 8) {
      setError('パスワードは8文字以上で設定してください');
      return;
    }

    // 利用規約への同意チェック
    if (!formData.termsAgreed) {
      setError('利用規約への同意が必要です');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        userType: 'pharmacy',
        pharmacyName: formData.pharmacyName,
        representativeLastName: formData.representativeLastName,
        representativeFirstName: formData.representativeFirstName,
      });

      if (response.success && response.data) {
        const { user, accessToken } = response.data;
        login(user, accessToken);
        router.push('/pharmacy/dashboard');
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setError(
        err.response?.data?.error || '登録に失敗しました。もう一度お試しください。'
      );
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
            薬ナビ
          </h1>
          <p className="text-gray-600">薬局アカウント登録</p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* 登録フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pharmacyName" className="block text-sm font-medium text-gray-700 mb-1">
              薬局名 *
            </label>
            <input
              id="pharmacyName"
              type="text"
              required
              value={formData.pharmacyName}
              onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="representativeLastName" className="block text-sm font-medium text-gray-700 mb-1">
                代表者姓 *
              </label>
              <input
                id="representativeLastName"
                type="text"
                required
                value={formData.representativeLastName}
                onChange={(e) => setFormData({ ...formData, representativeLastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="representativeFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                代表者名 *
              </label>
              <input
                id="representativeFirstName"
                type="text"
                required
                value={formData.representativeFirstName}
                onChange={(e) => setFormData({ ...formData, representativeFirstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス *
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード *
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="8文字以上"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード確認 *
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-start">
            <input
              id="termsAgreed"
              type="checkbox"
              checked={formData.termsAgreed}
              onChange={(e) => setFormData({ ...formData, termsAgreed: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="termsAgreed" className="ml-2 text-sm text-gray-700">
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                利用規約
              </button>
              に同意します <span className="text-red-500">*</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mt-6"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                登録中...
              </>
            ) : (
              '登録'
            )}
          </button>
        </form>

        {/* ログインリンク */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            既にアカウントをお持ちの方は{' '}
            <Link href="/pharmacy/login" className="text-blue-600 hover:text-blue-800 font-medium">
              ログイン
            </Link>
          </p>
        </div>
      </div>

      {/* 利用規約モーダル */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
}

