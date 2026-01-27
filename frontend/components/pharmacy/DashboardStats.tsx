'use client';

import React, { useEffect, useState } from 'react';
import { Briefcase, Users, FileText, Clock } from 'lucide-react';
import { StatsCard } from '../common/StatsCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { pharmacyAPI } from '@/lib/api/pharmacy';
import { PharmacyDashboardStats } from '@/lib/types';

interface DashboardStatsProps {
  pharmacyId: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  pharmacyId,
}) => {
  const [stats, setStats] = useState<PharmacyDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await pharmacyAPI.getDashboardStats(pharmacyId);
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
  }, [pharmacyId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="アクティブ求人"
        value={stats.activeJobPostings}
        icon={Briefcase}
        iconColor="text-blue-600"
      />
      <StatsCard
        title="総応募数"
        value={stats.totalApplications}
        icon={Users}
        iconColor="text-green-600"
      />
      <StatsCard
        title="アクティブ契約"
        value={stats.activeContracts}
        icon={FileText}
        iconColor="text-purple-600"
      />
      <StatsCard
        title="承認待ち契約"
        value={stats.pendingContracts}
        icon={Clock}
        iconColor="text-orange-600"
      />
    </div>
  );
};

