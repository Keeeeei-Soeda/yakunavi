'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPenalties, resolvePenalty } from '@/lib/api/admin';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Penalty {
  id: number;
  pharmacyId: number;
  contractId: number;
  penaltyType: string;
  reason: string;
  penaltyStatus: string;
  imposedAt: string;
  resolvedAt: string;
  resolutionNote: string;
  pharmacy: {
    pharmacyName: string;
    companyName?: string;
    representativeLastName: string;
    representativeFirstName: string;
  };
}

export default function PenaltiesPage() {
  const router = useRouter();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPenalties();
  }, [currentPage, statusFilter, searchQuery]);

  const fetchPenalties = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const data = await getPenalties(params);
      setPenalties(data.data || []);
      setTotalPages(Math.ceil((data.total || 0) / 20));
    } catch (error) {
      console.error('ペナルティ一覧の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolvePenalty = async (penaltyId: number) => {
    const resolutionNote = prompt('解除理由を入力してください:');
    if (!resolutionNote) return;

    if (!confirm('このペナルティを解除しますか?')) {
      return;
    }

    try {
      await resolvePenalty(penaltyId, resolutionNote);
      alert('ペナルティを解除しました');
      fetchPenalties();
    } catch (error) {
      console.error('ペナルティ解除に失敗:', error);
      alert('ペナルティの解除に失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-red-100 text-red-800',
      resolved: 'bg-green-100 text-green-800',
      appeal_submitted: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      active: '🔴 有効',
      resolved: '✅ 解決済み',
      appeal_submitted: '📝 解除申請',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getPenaltyTypeBadge = (type: string) => {
    const styles = {
      payment_delay: 'bg-orange-100 text-orange-800',
      contract_violation: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      payment_delay: '💰 未払い',
      contract_violation: '📋 契約違反',
      other: 'その他',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[type as keyof typeof labels] || type}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  if (loading && penalties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* ページタイトル */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ペナルティ管理</h1>
        <p className="mt-2 text-sm text-gray-600">薬局のペナルティ一覧と管理</p>
      </div>
        {/* フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索
              </label>
              <input
                type="text"
                placeholder="薬局名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="active">有効</option>
                <option value="appeal_submitted">解除申請</option>
                <option value="resolved">解決済み</option>
              </select>
            </div>
          </div>
        </div>

        {/* ペナルティ一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {penalties.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">ペナルティはありません</h3>
              <p className="text-gray-600">現在、有効なペナルティは存在しません。</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      薬局名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      代表者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ペナルティ種別
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      理由
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      適用日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {penalties.map((penalty) => (
                    <tr key={penalty.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{penalty.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {penalty.pharmacy.pharmacyName || penalty.pharmacy.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {penalty.pharmacy.representativeLastName} {penalty.pharmacy.representativeFirstName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getPenaltyTypeBadge(penalty.penaltyType)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {penalty.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(penalty.imposedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(penalty.penaltyStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => router.push(`/admin/penalties/${penalty.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          👁 詳細
                        </button>
                        {penalty.penaltyStatus === 'active' && (
                          <button
                            onClick={() => handleResolvePenalty(penalty.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            ✅ 解除
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  前へ
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    ページ <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      ← 前へ
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      次へ →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

