'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCertificates, approveCertificate, rejectCertificate } from '@/lib/api/admin';
import { CheckCircle, XCircle, Clock, Search } from 'lucide-react';

interface Certificate {
    id: number;
    pharmacistId: number;
    certificateType: string;
    fileName: string;
    filePath: string;
    uploadedAt: string;
    verificationStatus: string;
    pharmacist: {
        id: number;
        lastName: string;
        firstName: string;
        licenseNumber: string;
        email: string;
    };
}

export default function CertificatesPage() {
    const router = useRouter();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [status, setStatus] = useState('pending');
    const [search, setSearch] = useState('');
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchCertificates = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getCertificates({
                page,
                limit: 20,
                status: status || undefined,
                search: search || undefined,
            });
            setCertificates(response.data);
            setTotal(response.total);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            console.error('Failed to fetch certificates:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                router.push('/admin/auth/login');
            }
        } finally {
            setLoading(false);
        }
    }, [page, status, search, router]);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    const handleApprove = async (certificateId: number) => {
        if (!confirm('この証明書を承認しますか?')) return;

        try {
            setProcessing(true);
            await approveCertificate(certificateId);
            alert('証明書を承認しました');
            setSelectedCertificate(null);
            fetchCertificates();
        } catch (err: any) {
            console.error('Failed to approve certificate:', err);
            alert(err.response?.data?.error || '承認に失敗しました');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (certificateId: number) => {
        if (!rejectionReason.trim()) {
            alert('差し戻し理由を入力してください');
            return;
        }

        if (!confirm('この証明書を差し戻しますか?')) return;

        try {
            setProcessing(true);
            await rejectCertificate(certificateId, rejectionReason);
            alert('証明書を差し戻しました');
            setSelectedCertificate(null);
            setRejectionReason('');
            fetchCertificates();
        } catch (err: any) {
            console.error('Failed to reject certificate:', err);
            alert(err.response?.data?.error || '差し戻しに失敗しました');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        未確認
                    </span>
                );
            case 'verified':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        確認済み
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        差し戻し
                    </span>
                );
            default:
                return null;
        }
    };

    const getCertificateTypeName = (type: string) => {
        switch (type) {
            case 'pharmacist_license':
                return '薬剤師免許証';
            case 'insurance_registration':
                return '保険薬剤師登録票';
            default:
                return type;
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full">
            {/* ページタイトル */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">資格証明書管理</h1>
                <p className="mt-2 text-sm text-gray-600">薬剤師の資格証明書を確認・承認します</p>
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
                            <option value="pending">未確認</option>
                            <option value="verified">確認済み</option>
                            <option value="rejected">差し戻し</option>
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
                                        fetchCertificates();
                                    }
                                }}
                                placeholder="氏名、免許番号で検索..."
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
                            fetchCertificates();
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

            {/* 証明書一覧 */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : certificates.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">証明書が見つかりません</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    薬剤師
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    証明書種別
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    提出日
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ステータス
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    アクション
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {certificates.map((cert) => (
                                <tr key={cert.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {cert.pharmacist.lastName} {cert.pharmacist.firstName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            免許番号: {cert.pharmacist.licenseNumber || '未登録'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {getCertificateTypeName(cert.certificateType)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(cert.uploadedAt).toLocaleDateString('ja-JP')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(cert.verificationStatus)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setSelectedCertificate(cert)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            詳細
                                        </button>
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

            {/* 詳細モーダル */}
            {selectedCertificate && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                証明書詳細
                            </h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    薬剤師: {selectedCertificate.pharmacist.lastName}{' '}
                                    {selectedCertificate.pharmacist.firstName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    証明書種別: {getCertificateTypeName(selectedCertificate.certificateType)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    ファイル名: {selectedCertificate.fileName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    提出日: {new Date(selectedCertificate.uploadedAt).toLocaleString('ja-JP')}
                                </p>
                                <p className="text-sm text-gray-600">
                                    ステータス: {getStatusBadge(selectedCertificate.verificationStatus)}
                                </p>
                            </div>

                            {selectedCertificate.verificationStatus === 'pending' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            差し戻し理由（差し戻す場合のみ）
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="差し戻す理由を入力してください"
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => {
                                                setSelectedCertificate(null);
                                                setRejectionReason('');
                                            }}
                                            disabled={processing}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            キャンセル
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedCertificate.id)}
                                            disabled={processing}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                        >
                                            差し戻す
                                        </button>
                                        <button
                                            onClick={() => handleApprove(selectedCertificate.id)}
                                            disabled={processing}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                        >
                                            承認する
                                        </button>
                                    </div>
                                </>
                            )}

                            {selectedCertificate.verificationStatus !== 'pending' && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setSelectedCertificate(null)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        閉じる
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

