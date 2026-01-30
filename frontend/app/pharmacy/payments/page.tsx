'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { useAuthStore } from '@/lib/store/authStore';
import { paymentsAPI, Payment } from '@/lib/api/payments';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function PaymentsPage() {
  const user = useAuthStore((state) => state.user);
  const pharmacyId = user?.relatedId || 1;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    fetchPayments();
  }, [pharmacyId, selectedStatus]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentsAPI.getByPharmacy(pharmacyId, selectedStatus);
      if (response.success && response.data) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string; icon: JSX.Element } } = {
      pending: {
        label: '支払い待ち',
        className: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="w-4 h-4" />,
      },
      reported: {
        label: '支払い報告済み',
        className: 'bg-blue-100 text-blue-800',
        icon: <AlertCircle className="w-4 h-4" />,
      },
      confirmed: {
        label: '支払い確認済み',
        className: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      overdue: {
        label: '期限超過',
        className: 'bg-red-100 text-red-800',
        icon: <AlertCircle className="w-4 h-4" />,
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

  const getTotalAmount = () => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getPendingCount = () => {
    return payments.filter((p) => p.paymentStatus === 'pending').length;
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
            <h1 className="text-2xl font-bold text-gray-900">請求書管理</h1>
          </div>

          {/* サマリーカード */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-600">支払い待ち</h3>
                <AlertCircle className="text-orange-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-orange-600">{getPendingCount()}件</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-600">全請求書</h3>
                <FileText className="text-gray-600" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-600">{payments.length}件</p>
            </div>
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
                <option value="pending">支払い待ち</option>
                <option value="reported">支払い報告済み</option>
                <option value="confirmed">支払い確認済み</option>
                <option value="overdue">期限超過</option>
              </select>
            </div>
          </div>

          {/* 請求書リスト */}
          <div className="bg-white rounded-lg shadow">
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">請求書がありません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <Link
                    key={payment.id}
                    href={`/pharmacy/payments/${payment.id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            請求書 INV-{String(payment.contractId).padStart(6, '0')}
                          </h3>
                          {getStatusBadge(payment.paymentStatus)}
                        </div>

                        {payment.contract && (
                          <div className="text-sm text-gray-600 mb-3">
                            契約ID: {payment.contractId}
                            {payment.contract.pharmacist && (
                              <span className="ml-4">
                                薬剤師: {payment.contract.pharmacist.lastName}{' '}
                                {payment.contract.pharmacist.firstName}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>請求額: ¥{payment.amount.toLocaleString()}</span>
                          </div>

                          {payment.contract && (
                            <>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  初回出勤日:{' '}
                                  {format(
                                    new Date(payment.contract.initialWorkDate),
                                    'yyyy/MM/dd',
                                    { locale: ja }
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>
                                  支払い期限:{' '}
                                  {format(
                                    new Date(payment.contract.paymentDeadline),
                                    'yyyy/MM/dd',
                                    { locale: ja }
                                  )}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {payment.paymentStatus === 'pending' && payment.contract && (
                          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-800">
                              ⚠️ お支払い期限:{' '}
                              {format(new Date(payment.contract.paymentDeadline), 'yyyy年MM月dd日', {
                                locale: ja,
                              })}
                            </p>
                          </div>
                        )}

                        {payment.paymentStatus === 'overdue' && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              ⚠️ 支払い期限を過ぎています。契約がキャンセルされました。
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

          {/* 重要事項 */}
          {getPendingCount() > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="font-semibold text-orange-900 mb-3">💡 お支払いについて</h3>
              <ul className="space-y-2 text-sm text-orange-800">
                <li>・支払い期限は初回出勤日の3日前となります</li>
                <li>・期限までにお支払いがない場合、契約は自動的にキャンセルされます</li>
                <li>・お支払い確認後、薬剤師の連絡先が開示されます</li>
                <li>・振込名義は会社名または代表者名でお願いします</li>
              </ul>
            </div>
          )}
        </div>
      </PharmacyLayout>
    </ProtectedRoute>
  );
}



