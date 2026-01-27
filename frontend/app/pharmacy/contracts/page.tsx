'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { useAuthStore } from '@/lib/store/authStore';
import { contractsAPI, Contract } from '@/lib/api/contracts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { FileText, User, Calendar, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContractsPage() {
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    fetchContracts();
  }, [pharmacyId, selectedStatus]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await contractsAPI.getByPharmacy(pharmacyId, selectedStatus);
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
    const statusMap: { [key: string]: { label: string; className: string; icon: JSX.Element } } = {
      pending_approval: {
        label: '承認待ち',
        className: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="w-4 h-4" />,
      },
      pending_payment: {
        label: '手数料支払い待ち',
        className: 'bg-orange-100 text-orange-800',
        icon: <DollarSign className="w-4 h-4" />,
      },
      active: {
        label: '契約成立',
        className: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      cancelled: {
        label: 'キャンセル',
        className: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4" />,
      },
      completed: {
        label: '契約終了',
        className: 'bg-gray-100 text-gray-800',
        icon: <CheckCircle className="w-4 h-4" />,
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
      icon: <Clock className="w-4 h-4" />,
    };

    return (
      <span
        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.className}`}
      >
        {statusInfo.icon}
        <span>{statusInfo.label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute requiredUserType="pharmacy">
        <PharmacyLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </PharmacyLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">契約管理</h1>
          </div>

          {/* ステータスフィルター */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <label className="font-medium text-gray-700">ステータス:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                <option value="pending_approval">承認待ち</option>
                <option value="pending_payment">手数料支払い待ち</option>
                <option value="active">契約成立</option>
                <option value="cancelled">キャンセル</option>
                <option value="completed">契約終了</option>
              </select>
            </div>
          </div>

          {/* 契約リスト */}
          <div className="bg-white rounded-lg shadow">
            {contracts.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">契約がありません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {contracts.map((contract) => (
                  <Link
                    key={contract.id}
                    href={`/pharmacy/contracts/${contract.id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            契約ID: {contract.id}
                          </h3>
                          {getStatusBadge(contract.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              初回出勤日:{' '}
                              {format(new Date(contract.initialWorkDate), 'yyyy年MM月dd日', {
                                locale: ja,
                              })}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>勤務日数: {contract.workDays}日</span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>
                              報酬総額: ¥{contract.totalCompensation.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>
                              プラットフォーム手数料: ¥{contract.platformFee.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {contract.status === 'pending_payment' && (
                          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-800">
                              ⚠️ 支払い期限:{' '}
                              {format(new Date(contract.paymentDeadline), 'yyyy年MM月dd日', {
                                locale: ja,
                              })}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          詳細を見る →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* サマリー */}
          {contracts.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">契約サマリー</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {contracts.filter((c) => c.status === 'pending_approval').length}
                  </div>
                  <div className="text-sm text-gray-600">承認待ち</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {contracts.filter((c) => c.status === 'pending_payment').length}
                  </div>
                  <div className="text-sm text-gray-600">支払い待ち</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {contracts.filter((c) => c.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">契約成立</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {contracts.filter((c) => c.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">契約終了</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PharmacyLayout>
    </ProtectedRoute>
  );
}
