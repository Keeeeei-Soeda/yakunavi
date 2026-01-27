'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { User, Calendar } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { pharmacyAPI } from '@/lib/api/pharmacy';
import { Application } from '@/lib/types';

interface RecentApplicationsProps {
  pharmacyId: number;
}

export const RecentApplications: React.FC<RecentApplicationsProps> = ({
  pharmacyId,
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await pharmacyAPI.getRecentApplications(pharmacyId);
        if (response.success && response.data) {
          setApplications(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError('応募データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [pharmacyId]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: '審査中', color: 'bg-yellow-100 text-yellow-800' },
      under_review: { label: '検討中', color: 'bg-blue-100 text-blue-800' },
      interview_scheduled: {
        label: '面接予定',
        color: 'bg-purple-100 text-purple-800',
      },
      offered: { label: '内定', color: 'bg-green-100 text-green-800' },
      accepted: { label: '承諾', color: 'bg-green-100 text-green-800' },
      rejected: { label: '不採用', color: 'bg-red-100 text-red-800' },
      withdrawn: { label: '辞退', color: 'bg-gray-100 text-gray-800' },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">最近の応募</h3>
        <LoadingSpinner className="py-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">最近の応募</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">最近の応募</h3>
        <a
          href="/pharmacy/applications"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          すべて見る →
        </a>
      </div>

      {applications.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          まだ応募がありません
        </p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {application.jobPosting.title}
                  </h4>
                  <div className="flex items-center text-sm text-gray-600 gap-4">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>
                        {application.pharmacist?.lastName}{' '}
                        {application.pharmacist?.firstName}
                        {application.pharmacist?.age &&
                          ` (${application.pharmacist.age}歳)`}
                      </span>
                    </div>
                    {application.pharmacist?.workExperienceYears && (
                      <span className="text-xs">
                        経験: {application.pharmacist.workExperienceYears}年
                      </span>
                    )}
                  </div>
                </div>
                {getStatusBadge(application.status)}
              </div>
              <div className="flex items-center text-xs text-gray-500 gap-1">
                <Calendar size={12} />
                <span>
                  {format(new Date(application.appliedAt), 'yyyy年MM月dd日', {
                    locale: ja,
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

