'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { DashboardStats } from '@/components/pharmacy/DashboardStats';
import { RecentApplications } from '@/components/pharmacy/RecentApplications';
import { ActiveJobPostings } from '@/components/pharmacy/ActiveJobPostings';
import { useAuthStore } from '@/lib/store/authStore';

export default function PharmacyDashboard() {
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;
  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout 
        title="ダッシュボード"
        rightAction={
          <span className="text-sm text-gray-500">
            最終更新: {new Date().toLocaleString('ja-JP')}
          </span>
        }
      >
        {/* 統計カード */}
        <div className="mb-8">
          <DashboardStats pharmacyId={pharmacyId} />
        </div>

        {/* グリッドレイアウト: 最近の応募とアクティブ求人 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentApplications pharmacyId={pharmacyId} />
          <ActiveJobPostings pharmacyId={pharmacyId} />
        </div>

        {/* クイックアクション */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">クイックアクション</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/pharmacy/job-postings/new"
              className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
            >
              + 新しい求人を投稿
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

