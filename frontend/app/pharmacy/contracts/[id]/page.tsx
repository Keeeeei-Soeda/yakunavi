'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PharmacyLayout } from '@/components/pharmacy/Layout';
import { contractsAPI, Contract } from '@/lib/api/contracts';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function ContractDetailPage() {
  const params = useParams();
  const contractId = Number(params.id);

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContractDetail();
  }, [contractId]);

  const fetchContractDetail = async () => {
    setLoading(true);
    try {
      const response = await contractsAPI.getById(contractId);
      if (response.success && response.data) {
        setContract(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch contract detail:', error);
    } finally {
      setLoading(false);
    }
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

  if (!contract) {
    return (
      <ProtectedRoute requiredUserType="pharmacy">
        <PharmacyLayout>
          <div className="text-center py-12">
            <p className="text-gray-500">契約が見つかりません</p>
            <Link href="/pharmacy/contracts" className="text-blue-600 hover:underline mt-4 inline-block">
              契約一覧に戻る
            </Link>
          </div>
        </PharmacyLayout>
      </ProtectedRoute>
    );
  }

  const getStatusDisplay = () => {
    switch (contract.status) {
      case 'pending_approval':
        return {
          label: '薬剤師の承認待ち',
          color: 'yellow',
          icon: <Clock className="w-6 h-6" />,
          message: '薬剤師がオファーを承認するまでお待ちください。',
        };
      case 'pending_payment':
        return {
          label: '手数料支払い待ち',
          color: 'orange',
          icon: <DollarSign className="w-6 h-6" />,
          message: 'プラットフォーム手数料のお支払いをお願いします。',
        };
      case 'active':
        return {
          label: '契約成立',
          color: 'green',
          icon: <CheckCircle className="w-6 h-6" />,
          message: '契約が成立しました。薬剤師の連絡先が開示されました。',
        };
      case 'cancelled':
        return {
          label: 'キャンセル',
          color: 'red',
          icon: <XCircle className="w-6 h-6" />,
          message: 'この契約はキャンセルされました。',
        };
      case 'completed':
        return {
          label: '契約終了',
          color: 'gray',
          icon: <CheckCircle className="w-6 h-6" />,
          message: '契約期間が終了しました。',
        };
      default:
        return {
          label: contract.status,
          color: 'gray',
          icon: <AlertCircle className="w-6 h-6" />,
          message: '',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <ProtectedRoute requiredUserType="pharmacy">
      <PharmacyLayout>
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/pharmacy/contracts"
                className="text-blue-600 hover:underline text-sm mb-2 inline-block"
              >
                ← 契約一覧に戻る
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">契約詳細</h1>
            </div>
          </div>

          {/* ステータス */}
          <div className={`bg-${statusDisplay.color}-50 border border-${statusDisplay.color}-200 rounded-lg p-6`}>
            <div className="flex items-center space-x-3">
              <div className={`text-${statusDisplay.color}-600`}>{statusDisplay.icon}</div>
              <div>
                <h2 className={`text-lg font-semibold text-${statusDisplay.color}-900`}>
                  {statusDisplay.label}
                </h2>
                <p className={`text-sm text-${statusDisplay.color}-700 mt-1`}>
                  {statusDisplay.message}
                </p>
              </div>
            </div>

            {contract.status === 'pending_payment' && (
              <div className="mt-4 pt-4 border-t border-orange-200">
                <p className="text-sm text-orange-800">
                  <strong>支払い期限:</strong>{' '}
                  {format(new Date(contract.paymentDeadline), 'yyyy年MM月dd日', { locale: ja })}
                </p>
                <p className="text-xs text-orange-700 mt-2">
                  ⚠️ 期限までにお支払いがない場合、契約は自動的にキャンセルされます。
                </p>
                <Link
                  href={`/pharmacy/payments/${contract.payment?.id || ''}`}
                  className="inline-block mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  支払い手続きへ
                </Link>
              </div>
            )}
          </div>

          {/* 契約内容 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">契約内容</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  初回出勤日
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {format(new Date(contract.initialWorkDate), 'yyyy年MM月dd日', { locale: ja })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  勤務日数
                </label>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{contract.workDays}日間</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日給</label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">¥{contract.dailyWage.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  報酬総額
                </label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    ¥{contract.totalCompensation.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ※体験期間終了後に薬剤師へ直接お支払いください
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  プラットフォーム手数料（税込）
                </label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">¥{Math.floor(contract.platformFee * 1.1).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">（報酬総額の40%＋消費税10%）</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  勤務時間
                </label>
                <span className="text-gray-900">{contract.workHours || '9:00-18:00'}</span>
                <p className="text-xs text-gray-500 mt-1">※目安・相談可</p>
              </div>
            </div>
          </div>

          {/* 薬剤師情報 */}
          {contract.status === 'active' && contract.pharmacist && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">薬剤師の連絡先</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
                  <span className="text-gray-900">
                    {contract.pharmacist.lastName} {contract.pharmacist.firstName}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号
                  </label>
                  <span className="text-gray-900">
                    {contract.pharmacist.phoneNumber || '未設定'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <span className="text-gray-900">
                    {contract.pharmacist.user?.email || '未設定'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 重要事項 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">💡 次のステップ</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              {contract.status === 'pending_approval' && (
                <li>・薬剤師がオファーを承認するまでお待ちください</li>
              )}
              {contract.status === 'pending_payment' && (
                <>
                  <li>・プラットフォーム手数料をお支払いください</li>
                  <li>・支払い確認後、薬剤師の連絡先が開示されます</li>
                </>
              )}
              {contract.status === 'active' && (
                <>
                  <li>・薬剤師と直接連絡を取り、勤務スケジュールを調整してください</li>
                  <li>・初回出勤日までに必要な準備を行ってください</li>
                  <li>
                    ・報酬（¥{contract.totalCompensation.toLocaleString()}
                    ）は体験期間終了後に薬剤師へ直接お支払いください
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </PharmacyLayout>
    </ProtectedRoute>
  );
}


