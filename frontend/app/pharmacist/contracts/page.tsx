'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacistLayout } from '@/components/pharmacist/Layout';
import { contractsAPI, Contract } from '@/lib/api/contracts';
import { useAuthStore } from '@/lib/store/authStore';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { FileText, DollarSign, Calendar, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ContractsPage() {
  const user = useAuthStore((state) => state.user);
  const pharmacistId = user?.relatedId || 1;

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchContracts();
  }, [filter]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await contractsAPI.getByPharmacist(
        pharmacistId,
        filter === 'all' ? undefined : filter
      );
      if (response.success && response.data) {
        setContracts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: JSX.Element }> = {
      pending_approval: {
        label: '承認待ち',
        className: 'bg-yellow-100 text-yellow-800',
        icon: <AlertCircle size={16} />,
      },
      pending_payment: {
        label: '手続き中',
        className: 'bg-orange-100 text-orange-800',
        icon: <DollarSign size={16} />,
      },
      active: {
        label: '契約成立',
        className: 'bg-green-100 text-green-800',
        icon: <CheckCircle size={16} />,
      },
      completed: {
        label: '完了',
        className: 'bg-gray-100 text-gray-800',
        icon: <CheckCircle size={16} />,
      },
      cancelled: {
        label: 'キャンセル',
        className: 'bg-red-100 text-red-800',
        icon: <AlertCircle size={16} />,
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
      icon: <FileText size={16} />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <ProtectedRoute requiredUserType="pharmacist">
      <PharmacistLayout
        title="勤務中の薬局（契約管理）"
        rightAction={
          <button
            onClick={fetchContracts}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            🔄 更新
          </button>
        }
      >
        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">ステータス:</span>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'すべて' },
                { value: 'pending_approval', label: '承認待ち' },
                { value: 'pending_payment', label: '手続き中' },
                { value: 'active', label: '契約成立' },
                { value: 'completed', label: '完了' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 契約一覧 */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">契約が見つかりません</p>
            <Link
              href="/pharmacist/jobs"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              求人を探す →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract: any) => (
              <div
                key={contract.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {contract.jobPosting?.title || '求人情報なし'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {contract.pharmacy?.name || '薬局情報なし'}
                      </p>
                    </div>
                    <div>{getStatusBadge(contract.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">初回出勤日</p>
                      <p className="font-medium">
                        {format(new Date(contract.initialWorkDate), 'yyyy/MM/dd', { locale: ja })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">勤務日数</p>
                      <p className="font-medium">{contract.workDays}日間</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">日給</p>
                      <p className="font-medium">¥{contract.dailyWage.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">報酬総額</p>
                      <p className="font-medium text-green-600">
                        ¥{contract.totalCompensation.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* ステータス別の情報 */}
                  {contract.status === 'pending_payment' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-orange-900">
                            手続き中
                          </p>
                          <p className="text-sm text-orange-700 mt-1">
                            支払い期限: {format(new Date(contract.paymentDeadline), 'yyyy/MM/dd', { locale: ja })}
                            <br />
                            薬局がプラットフォーム手数料を支払い後、薬局の連絡先が開示されます。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {contract.status === 'active' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-900">
                            契約成立：勤務中
                          </p>
                          <p className="text-sm text-green-700 mt-1">
                            薬局の連絡先が開示されました。
                          </p>
                          {contract.pharmacy && (
                            <div className="mt-3 p-3 bg-white rounded border border-green-200">
                              <p className="text-xs text-gray-600 mb-2">🏥 薬局の連絡先</p>
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium">薬局名:</span> {contract.pharmacy.name}
                                </p>
                                {contract.pharmacy.phone && (
                                  <p className="text-sm">
                                    <span className="font-medium">電話番号:</span> {contract.pharmacy.phone}
                                  </p>
                                )}
                                {contract.pharmacy.email && (
                                  <p className="text-sm">
                                    <span className="font-medium">メール:</span> {contract.pharmacy.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* アクション */}
                  <div className="flex gap-3">
                    <Link
                      href={`/pharmacist/contracts/${contract.id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} />
                      契約詳細を見る
                    </Link>
                    <Link
                      href={`/pharmacist/messages?applicationId=${contract.applicationId}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      メッセージ
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PharmacistLayout>
    </ProtectedRoute>
  );
}

