'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { useAuthStore } from '@/lib/store/authStore';
import { applicationsAPI } from '@/lib/api/applications';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

export default function ApplicationsPage() {
  const user = useAuthStore((state) => state.user);
  const pharmacistId = user?.relatedId || 1;

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchApplications();
  }, [pharmacistId, filterStatus]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationsAPI.getByPharmacist(
        pharmacistId,
        filterStatus || undefined
      );
      if (response.success && response.data) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // ⚠️ 応募取り下げ機能は廃止されました
  // 一度応募したら、基本的に取り下げはできません
  // やむを得ない場合は運営（support@yakunavi.jp）までご連絡ください
  // const handleWithdraw = async (id: number) => {
  //   if (!confirm('この応募を取り下げますか？')) return;

  //   try {
  //     await applicationsAPI.withdraw(id, pharmacistId);
  //     alert('応募を取り下げました');
  //     fetchApplications();
  //   } catch (error: any) {
  //     console.error('Failed to withdraw:', error);
  //     alert(error.response?.data?.error || '取り下げに失敗しました');
  //   }
  // };

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string; icon: any } } = {
      applied: {
        label: '応募済み',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
      },
      under_review: {
        label: '審査中',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
      },
      accepted: {
        label: '承認済み',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      rejected: {
        label: '却下',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
      withdrawn: {
        label: '取り下げ',
        color: 'bg-gray-100 text-gray-800',
        icon: FileText,
      },
    };
    return statusMap[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-800',
      icon: FileText,
    };
  };

  return (
    <ProtectedRoute requiredUserType="pharmacist">
      <PharmacistLayout title="応募管理">
        {/* フィルター */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === ''
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilterStatus('applied')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'applied'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              応募済み
            </button>
            <button
              onClick={() => setFilterStatus('accepted')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'accepted'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              承認済み
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'rejected'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              却下
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">応募履歴がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => {
              const statusInfo = getStatusInfo(app.status);
              const Icon = statusInfo.icon;
              return (
                <div key={app.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.jobPosting?.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusInfo.color}`}
                        >
                          <Icon size={16} />
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          🏥 薬局: {app.jobPosting?.pharmacy?.pharmacyName}
                        </p>
                        <p>
                          📍 {app.jobPosting?.prefecture} {app.jobPosting?.city}
                        </p>
                        <p>
                          💰 日給: ¥{app.jobPosting?.dailyWage?.toLocaleString()}
                        </p>
                        <p>
                          📅 応募日:{' '}
                          {format(new Date(app.appliedAt), 'yyyy/MM/dd HH:mm', {
                            locale: ja,
                          })}
                        </p>
                        {app.coverLetter && (
                          <p className="mt-2 text-gray-700">
                            💬 {app.coverLetter}
                          </p>
                        )}
                        {app.rejectionReason && (
                          <p className="mt-2 text-red-600">
                            ❌ 却下理由: {app.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* 応募取り下げ機能は廃止されました */}
                    {/* やむを得ない場合は運営までご連絡ください */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PharmacistLayout>
    </ProtectedRoute>
  );
}

