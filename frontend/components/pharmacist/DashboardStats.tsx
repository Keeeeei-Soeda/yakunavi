'use client';

import React, { useEffect, useState } from 'react';
import { Briefcase, FileText, Bell } from 'lucide-react';
import { StatsCard } from '../common/StatsCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { pharmacistAPI } from '@/lib/api/pharmacist';
import { PharmacistDashboardStats } from '@/lib/types';

interface DashboardStatsProps {
  pharmacistId: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  pharmacistId,
}) => {
  const [stats, setStats] = useState<PharmacistDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await pharmacistAPI.getDashboardStats(pharmacistId);
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('統計データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [pharmacistId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="h-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="進行中の応募"
        value={stats.activeApplications}
        icon={Briefcase}
        iconColor="text-blue-600"
      />
      <StatsCard
        title="アクティブ契約"
        value={stats.activeContracts}
        icon={FileText}
        iconColor="text-green-600"
      />
      <StatsCard
        title="未読メッセージ"
        value={stats.unreadMessages}
        icon={Bell}
        iconColor="text-orange-600"
      />
    </div>
  );
};

