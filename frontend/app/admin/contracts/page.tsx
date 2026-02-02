'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getContracts } from '@/lib/api/admin';
import { Search, FileText } from 'lucide-react';

interface Contract {
    id: number;
    initialWorkDate: string;
    workDays: number;
    dailyWage: number;
    totalCompensation: number;
    platformFee: number;
    status: string;
    paymentDeadline: string;
    createdAt: string;
    pharmacy: {
        id: number;
        pharmacyName: string;
        email: string;
    };
    pharmacist: {
        id: number;
        lastName: string;
        firstName: string;
        email: string;
    };
    payment: {
        id: number;
        paymentStatus: string;
        reportedAt: string | null;
        confirmedAt: string | null;
    } | null;
}

export default function ContractsPage() {
    const router = useRouter();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchContracts();
    }, [page, status]);

    const fetchContracts = async () => {
        try {
            setLoading(true);
            const response = await getContracts({
                page,
                limit: 20,
                status: status || undefined,
                search: search || undefined,
            });
            setContracts(response.data);
            setTotal(response.total);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            console.error('Failed to fetch contracts:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                router.push('/admin/auth/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            pending_approval: { label: '承認待ち', className: 'bg-yellow-100 text-yellow-800' },
            pending_payment: { label: '支払い待ち', className: 'bg-orange-100 text-orange-800' },
            active: { label: '契約成立', className: 'bg-green-100 text-green-800' },
            completed: { label: '完了', className: 'bg-blue-100 text-blue-800' },
            cancelled: { label: 'キャンセル', className: 'bg-red-100 text-red-800' },
        };

        const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto w-full">
            {/* ページタイトル */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">契約管理</h1>
                <p className="mt-2 text-sm text-gray-600">契約の一覧・詳細を確認します</p>
            </div>
            {/* フィルター */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ステータス
                        </label>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">すべて</option>
                            <option value="pending_approval">承認待ち</option>
                            <option value="pending_payment">支払い待ち</option>
                            <option value="active">契約成立</option>
                            <option value="completed">完了</option>
                            <option value="cancelled">キャンセル</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            検索
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        setPage(1);
                                        fetchContracts();
                                    }
                                }}
                                placeholder="薬局名、薬剤師名で検索..."
                                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => {
                            setPage(1);
                            fetchContracts();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        検索
                    </button>
                </div>
            </div>

            {/* 統計 */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <p className="text-sm text-gray-600">
                    全{total}件中 {(page - 1) * 20 + 1}〜{Math.min(page * 20, total)}件を表示
                </p>
            </div>

            {/* 契約一覧 */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : contracts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">契約が見つかりません</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    契約ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    薬局
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    薬剤師
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    初回出勤日
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    報酬/手数料
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ステータス
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {contracts.map((contract) => (
                                <tr key={contract.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{contract.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {contract.pharmacy.pharmacyName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {contract.pharmacy.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {contract.pharmacist.lastName} {contract.pharmacist.firstName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {contract.pharmacist.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(contract.initialWorkDate).toLocaleDateString('ja-JP')}
                                        <div className="text-xs text-gray-500">
                                            {contract.workDays}日間
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            ¥{contract.totalCompensation.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            手数料: ¥{contract.platformFee.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(contract.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ページネーション */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            前へ
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            次へ
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}

