'use client';

import React from 'react';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useAuthStore } from '@/lib/store/authStore';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout title="設定">
        <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
          <h3 className="text-lg font-semibold mb-6">アカウント設定</h3>

          <div className="space-y-6">
            {/* メールアドレス（登録時に設定したアカウントのメールアドレス） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none cursor-not-allowed"
                aria-readonly
              />
              <p className="text-xs text-gray-500 mt-1">
                アカウント登録時のメールアドレスです
              </p>
            </div>

          {/* パスワード変更 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              パスワードを変更
            </button>
          </div>

          {/* 通知設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              通知設定
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  新しい応募があったときにメールで通知
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  メッセージを受信したときにメールで通知
                </span>
              </label>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="pt-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </PharmacyLayout>
    </ProtectedRoute>
  );
}

