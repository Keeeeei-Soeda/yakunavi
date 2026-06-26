'use client';

import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '@/lib/api/admin';
import { ClipboardList } from 'lucide-react';

interface AuditLog {
  id: number;
  userId: number;
  action: string;
  resourceType: string;
  resourceId: number | null;
  pharmacyId: number | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: {
    id: number;
    email: string;
    userType: string;
  };
}

const ACTION_LABELS: Record<string, string> = {
  'job_posting.create': '案件作成',
  'job_posting.update': '案件更新',
  'job_posting.publish': '案件公開',
  'job_posting.unpublish': '案件非公開',
  'job_posting.delete': '案件削除',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getAuditLogs({
        page: currentPage,
        limit: 20,
        resourceType: 'job_posting',
        action: actionFilter || undefined,
      });
      setLogs(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">監査ログ</h1>
        <p className="mt-2 text-sm text-gray-600">
          管理者によるおためし案件の代行操作履歴
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-2">操作種別</label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべて</option>
            <option value="job_posting.create">案件作成</option>
            <option value="job_posting.update">案件更新</option>
            <option value="job_posting.publish">案件公開</option>
            <option value="job_posting.unpublish">案件非公開</option>
            <option value="job_posting.delete">案件削除</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-sm text-gray-600">全{total}件</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">監査ログがありません</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日時</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">管理者</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">薬局ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">案件ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">詳細</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ACTION_LABELS[log.action] || log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.pharmacyId ? `#${log.pharmacyId}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.resourceId ? `#${log.resourceId}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              前へ
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              次へ
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
