'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { DashboardStats } from '@/components/pharmacist/DashboardStats';
import { RecentNotifications } from '@/components/pharmacist/RecentNotifications';
import { ActiveApplications } from '@/components/pharmacist/ActiveApplications';
import { ActiveContracts } from '@/components/pharmacist/ActiveContracts';
import { useAuthStore } from '@/lib/store/authStore';
import { RefreshCw } from 'lucide-react';

export default function PharmacistDashboard() {
  const user = useAuthStore((state) => state.user);
  const pharmacistId = user?.relatedId || 1;
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  // ページフォーカス時に自動更新
  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1);
      setLastUpdated(new Date());
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleManualRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setLastUpdated(new Date());
  };

  return (
    <ProtectedRoute requiredUserType="pharmacist">
      <PharmacistLayout
        title="ダッシュボード"
        rightAction={
          <div className="flex items-center gap-4">
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="更新"
            >
              <RefreshCw size={16} />
              更新
            </button>
            <span className="text-sm text-gray-500">
              最終更新: {lastUpdated.toLocaleString('ja-JP')}
            </span>
          </div>
        }
      >
        {/* 統計カード */}
        <div className="mb-8" key={`stats-${refreshKey}`}>
          <DashboardStats pharmacistId={pharmacistId} />
        </div>

        {/* 通知セクション */}
        <div className="mb-6" key={`notifications-${refreshKey}`}>
          <RecentNotifications />
        </div>

        {/* グリッドレイアウト: 進行中の応募と契約 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div key={`applications-${refreshKey}`}>
            <ActiveApplications pharmacistId={pharmacistId} />
          </div>
          <div key={`contracts-${refreshKey}`}>
            <ActiveContracts pharmacistId={pharmacistId} />
          </div>
        </div>
      </PharmacistLayout>
    </ProtectedRoute>
  );
}

