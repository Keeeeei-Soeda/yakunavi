'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuthStore } from '@/lib/store/authStore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    // 認証状態を初期化
    if (typeof window !== 'undefined') {
      initialize();
    }

    // 認証チェック
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userType = localStorage.getItem('userType');

      if (!token || userType !== 'admin') {
        router.push('/admin/auth/login');
        return;
      }
    }
  }, [router, initialize]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* サイドバー */}
      <AdminSidebar />

      {/* メインコンテンツエリア */}
      <div className="flex-1 lg:ml-64">
        {/* ヘッダー */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="lg:hidden">
                <h1 className="text-lg font-bold text-gray-900">管理者パネル</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userType');
                    localStorage.removeItem('user');
                    useAuthStore.getState().logout();
                    router.push('/admin/auth/login');
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ページコンテンツ */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

