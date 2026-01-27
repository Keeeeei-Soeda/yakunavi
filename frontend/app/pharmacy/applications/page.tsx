'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { useAuthStore } from '@/lib/store/authStore';
import { applicationsAPI, Application } from '@/lib/api/applications';
import { Check, X, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

export default function ApplicationsPage() {
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchApplications();
  }, [pharmacyId, filterStatus]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationsAPI.getByPharmacy(
        pharmacyId,
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

  const handleAccept = async (id: number) => {
    if (!confirm('この応募を承認しますか？')) return;

    try {
      await applicationsAPI.updateStatus(id, 'accepted');
      alert('応募を承認しました');
      fetchApplications();
    } catch (error) {
      console.error('Failed to accept:', error);
      alert('承認に失敗しました');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('却下理由を入力してください（任意）:');
    if (reason === null) return;

    try {
      await applicationsAPI.updateStatus(id, 'rejected', reason || undefined);
      alert('応募を却下しました');
      fetchApplications();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('却下に失敗しました');
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      applied: { label: '応募中', color: 'bg-blue-100 text-blue-800' },
      under_review: { label: '審査中', color: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: '承認済み', color: 'bg-green-100 text-green-800' },
      rejected: { label: '却下', color: 'bg-red-100 text-red-800' },
      withdrawn: { label: '取り下げ', color: 'bg-gray-100 text-gray-800' },
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout title="応募管理">
        {/* フィルター */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilterStatus('applied')}
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'applied'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              新規応募
            </button>
            <button
              onClick={() => setFilterStatus('accepted')}
              className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === 'accepted'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              承認済み
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">応募がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => {
              const statusInfo = getStatusLabel(app.status);
              return (
                <div key={app.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.pharmacist?.lastName} {app.pharmacist?.firstName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📋 求人: {app.jobPosting?.title}</p>
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
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {app.status === 'applied' && (
                        <>
                          <button
                            onClick={() => handleAccept(app.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="承認"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="却下"
                          >
                            <X size={20} />
                          </button>
                        </>
                      )}
                      <Link
                        href={`/pharmacy/applications/${app.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="詳細を見る"
                      >
                        👁
                      </Link>
                      <Link
                        href={`/pharmacy/messages?applicationId=${app.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="メッセージ"
                      >
                        <MessageSquare size={20} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PharmacyLayout>
    </ProtectedRoute>
  );
}
