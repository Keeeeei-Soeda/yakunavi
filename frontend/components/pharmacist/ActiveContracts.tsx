'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Building2, Calendar, DollarSign, FileText } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { pharmacistAPI } from '@/lib/api/pharmacist';
import { Contract } from '@/lib/types';

interface ActiveContractsProps {
  pharmacistId: number;
}

export const ActiveContracts: React.FC<ActiveContractsProps> = ({
  pharmacistId,
}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const response = await pharmacistAPI.getActiveContracts(pharmacistId);
        if (response.success && response.data) {
          setContracts(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch contracts:', err);
        setError('契約データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [pharmacistId]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending_approval: {
        label: '承認待ち',
        color: 'bg-yellow-100 text-yellow-800',
      },
      active: { label: 'アクティブ', color: 'bg-green-100 text-green-800' },
      in_progress: { label: '実施中', color: 'bg-blue-100 text-blue-800' },
      completed: { label: '完了', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'キャンセル', color: 'bg-red-100 text-red-800' },
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
        <h3 className="text-lg font-semibold mb-4">進行中の契約</h3>
        <LoadingSpinner className="py-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">進行中の契約</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">進行中の契約</h3>
        <a
          href="/pharmacist/contracts"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          すべて見る →
        </a>
      </div>

      {contracts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          進行中の契約がありません
        </p>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {contract.jobPosting?.title || '契約'}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Building2 size={14} />
                    <span>{contract.pharmacy?.pharmacyName}</span>
                  </div>
                </div>
                {getStatusBadge(contract.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>
                    開始日:{' '}
                    {format(new Date(contract.initialWorkDate), 'MM/dd', {
                      locale: ja,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText size={14} />
                  <span>{contract.workDays}日間</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign size={14} />
                  <span>日給: ¥{contract.dailyWage.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-green-700">
                  総額: ¥{contract.totalCompensation.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

