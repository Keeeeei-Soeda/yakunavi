'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { DashboardStats } from '@/components/pharmacy/DashboardStats';
import { RecentApplications } from '@/components/pharmacy/RecentApplications';
import { ActiveJobPostings } from '@/components/pharmacy/ActiveJobPostings';
import { PharmacyRecentNotifications } from '@/components/pharmacy/RecentNotifications';
import { useAuthStore } from '@/lib/store/authStore';
import { RefreshCw } from 'lucide-react';

export default function PharmacyDashboard() {
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const onFocus = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout
        title="ダッシュボード"
        rightAction={
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            title="更新"
          >
            <RefreshCw size={16} />
            更新
          </button>
        }
      >
        {/* 統計カード */}
        <div className="mb-8">
          <DashboardStats pharmacyId={pharmacyId} />
        </div>

        {/* グリッドレイアウト: 最近の応募・募集中のおためし案件・通知 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RecentApplications pharmacyId={pharmacyId} />
          <ActiveJobPostings pharmacyId={pharmacyId} />
        </div>

        {/* 最近の通知 */}
        <div className="mb-8">
          <PharmacyRecentNotifications key={`notifications-${refreshKey}`} />
        </div>

        {/* クイックアクション */}
        <div className="mt-2">
          <h3 className="text-lg font-semibold mb-4">クイックアクション</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/pharmacy/job-postings/new"
              className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
            >
              + 新しいおためし案件を投稿
            </a>
            <a
              href="/pharmacy/applications"
              className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-4 rounded-lg hover:bg-blue-50 transition-colors text-center font-medium"
            >
              応募を確認
            </a>
            <a
              href="/pharmacy/contracts"
              className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-4 rounded-lg hover:bg-blue-50 transition-colors text-center font-medium"
            >
              📄 契約を管理
            </a>
          </div>
        </div>
      </PharmacyLayout>
    </ProtectedRoute>
  );
}

