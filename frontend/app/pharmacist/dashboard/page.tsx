'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { DashboardStats } from '@/components/pharmacist/DashboardStats';
import { RecentNotifications } from '@/components/pharmacist/RecentNotifications';
import { ActiveApplications } from '@/components/pharmacist/ActiveApplications';
import { ActiveContracts } from '@/components/pharmacist/ActiveContracts';
import { useAuthStore } from '@/lib/store/authStore';

export default function PharmacistDashboard() {
  const user = useAuthStore((state) => state.user);
  const pharmacistId = user?.relatedId || 1;

  return (
    <ProtectedRoute requiredUserType="pharmacist">
      <PharmacistLayout
        title="ダッシュボード"
        rightAction={
          <span className="text-sm text-gray-500">
            最終更新: {new Date().toLocaleString('ja-JP')}
          </span>
        }
      >
        {/* 統計カード */}
        <div className="mb-8">
          <DashboardStats pharmacistId={pharmacistId} />
        </div>

        {/* 通知セクション */}
        <div className="mb-6">
          <RecentNotifications />
        </div>

        {/* グリッドレイアウト: 進行中の応募と契約 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActiveApplications pharmacistId={pharmacistId} />
          <ActiveContracts pharmacistId={pharmacistId} />
        </div>
      </PharmacistLayout>
    </ProtectedRoute>
  );
}

